import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

export async function POST({ request, cookies }) {
  if (cookies.get('admin_session') !== 'active') {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // NOTA: La password non è salvata nel database SQLite, ma nel file data/settings.json.
    // Di conseguenza, ripristinare il database SQLite NON sovrascrive la password admin.
    // Eseguiamo direttamente la sostituzione.

    const dbPath = env.DB_PATH || 'data/sqlite.db';
    const resolvedPath = path.resolve(dbPath);
    
    // Backup del vecchio DB (opzionale, ma sicuro) prima di sovrascrivere
    if (fs.existsSync(resolvedPath)) {
      fs.copyFileSync(resolvedPath, resolvedPath + '.bak');
    }

    // Sovrascrive il database fisico
    fs.writeFileSync(resolvedPath, buffer);

    // Eseguiamo la migrazione/creazione tabelle per sicurezza sul nuovo file
    const sqlite = new Database(resolvedPath);
    
    // Eseguiamo le tabelle se mancano (es. se backup molto vecchio o vuoto)
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        position INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL REFERENCES categories(id),
        name TEXT NOT NULL,
        description TEXT,
        url TEXT NOT NULL,
        icon TEXT,
        docker_image TEXT,
        widget_type TEXT,
        ping_enabled INTEGER DEFAULT 1 NOT NULL,
        position INTEGER DEFAULT 0
      );
    `);

    // Migrazione colonne
    try {
      const columns = sqlite.prepare(`PRAGMA table_info(services);`).all() as {name: string}[];
      const hasContainerId = columns.some(c => c.name === 'container_id');
      const hasDockerImage = columns.some(c => c.name === 'docker_image');
      
      if (hasContainerId && !hasDockerImage) {
        sqlite.exec(`ALTER TABLE services RENAME COLUMN container_id TO docker_image;`);
      } else if (!hasContainerId && !hasDockerImage) {
        sqlite.exec(`ALTER TABLE services ADD COLUMN docker_image TEXT;`);
      }
    } catch (e: any) {
      console.error("Migration error during restore:", e.message);
    }
    sqlite.close();

    // Riavvia il container dopo 1 secondo per ricaricare le istanze globali di DB/Drizzle
    setTimeout(() => {
      console.log('Restarting container after DB restore...');
      process.exit(1);
    }, 1000);

    return json({ success: true });
  } catch (err: any) {
    console.error(err);
    return json({ success: false, error: err.message }, { status: 500 });
  }
}
