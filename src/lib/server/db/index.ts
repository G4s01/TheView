import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import { env } from "$env/dynamic/private";
import fs from "fs";
import path from "path";

// Ensure data directory exists
const dbPath = env.DB_PATH || "data/sqlite.db";
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sqlite = new Database(dbPath);

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    icon TEXT,
    position INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS dashboard_grids (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    show_header INTEGER DEFAULT 1 NOT NULL,
    position INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grid_id INTEGER REFERENCES dashboard_grids(id),
    category_id INTEGER REFERENCES categories(id),
    name TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    icon TEXT,
    docker_image TEXT,
    widget_type TEXT,
    ping_enabled INTEGER DEFAULT 1 NOT NULL,
    position INTEGER DEFAULT 0,
    size TEXT DEFAULT '1x1' NOT NULL,
    is_widget INTEGER DEFAULT 0 NOT NULL,
    require_auth INTEGER DEFAULT 0 NOT NULL,
    widget_size TEXT DEFAULT '1x1' NOT NULL,
    x INTEGER DEFAULT 0 NOT NULL,
    y INTEGER DEFAULT 0 NOT NULL,
    w INTEGER DEFAULT 2 NOT NULL,
    h INTEGER DEFAULT 2 NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    expires_at INTEGER NOT NULL
  );
`);

// Eseguiamo la migrazione da settings.json a database se esiste ancora il file
try {
  const jsonSettingsPath = path.resolve(path.dirname(dbPath), "settings.json");
  if (fs.existsSync(jsonSettingsPath)) {
    console.log("Migrazione di settings.json verso SQLite...");
    const data = JSON.parse(fs.readFileSync(jsonSettingsPath, "utf-8"));
    const insertStmt = sqlite.prepare(
      "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
    );

    // Migra e cifra le password scoperte - rimosso require non esm, decrittazione supporta fallback

    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined && val !== null) {
        insertStmt.run(
          key,
          typeof val === "string" ? val : JSON.stringify(val),
        );
      }
    }
    // Rinomina il file per non ripetere la migrazione
    fs.renameSync(jsonSettingsPath, jsonSettingsPath + ".bak");
    console.log("Migrazione settings completata.");
  }
} catch (e: any) {
  console.error("Errore durante la migrazione da JSON a SQLite:", e.message);
}

// Eseguiamo la migrazione in modo sicuro per rinominare la colonna
try {
  // Check if container_id exists and docker_image doesn't
  const columns = sqlite.prepare(`PRAGMA table_info(services);`).all() as {
    name: string;
  }[];
  const hasContainerId = columns.some((c) => c.name === "container_id");
  const hasDockerImage = columns.some((c) => c.name === "docker_image");

  if (hasContainerId && !hasDockerImage) {
    sqlite.exec(
      `ALTER TABLE services RENAME COLUMN container_id TO docker_image;`,
    );
  } else if (!hasContainerId && !hasDockerImage) {
    sqlite.exec(`ALTER TABLE services ADD COLUMN docker_image TEXT;`);
  }

  const hasSize = columns.some((c) => c.name === "size");
  if (!hasSize) {
    sqlite.exec(
      `ALTER TABLE services ADD COLUMN size TEXT DEFAULT '1x1' NOT NULL;`,
    );
  }
  const hasIsWidget = columns.some((c) => c.name === "is_widget");
  if (!hasIsWidget) {
    sqlite.exec(
      `ALTER TABLE services ADD COLUMN is_widget INTEGER DEFAULT 0 NOT NULL;`,
    );
  }
  const hasRequireAuth = columns.some((c) => c.name === "require_auth");
  if (!hasRequireAuth) {
    sqlite.exec(
      `ALTER TABLE services ADD COLUMN require_auth INTEGER DEFAULT 0 NOT NULL;`,
    );
  }
  const hasWidgetSize = columns.some((c) => c.name === "widget_size");
  if (!hasWidgetSize) {
    sqlite.exec(
      `ALTER TABLE services ADD COLUMN widget_size TEXT DEFAULT '1x1' NOT NULL;`,
    );
  }

  // Safely drop old columns if they exist (SQLite 3.35.0+)
  const hasRowSpan = columns.some((c) => c.name === "row_span");
  if (hasRowSpan) {
    try {
      sqlite.exec(`ALTER TABLE services DROP COLUMN row_span;`);
    } catch (e) {}
  }
  const hasColSpan = columns.some((c) => c.name === "col_span");
  if (hasColSpan) {
    try {
      sqlite.exec(`ALTER TABLE services DROP COLUMN col_span;`);
    } catch (e) {}
  }

  // Categories migrations
  const categoryColumns = sqlite
    .prepare(`PRAGMA table_info(categories);`)
    .all() as {
    name: string;
  }[];
  const hasCategoryIcon = categoryColumns.some((c) => c.name === "icon");
  if (!hasCategoryIcon) {
    sqlite.exec(`ALTER TABLE categories ADD COLUMN icon TEXT;`);
  }

  // Assicurati che esista la categoria fantasma (-1)
  sqlite.exec(
    `INSERT OR IGNORE INTO categories (id, name, position) VALUES (-1, 'CATEGORIA FANTASMA', -1);`,
  );

  // --- MIGRAZIONE MULTI-GRID ---
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS dashboard_grids (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      show_header INTEGER DEFAULT 1 NOT NULL,
      position INTEGER DEFAULT 0
    );
  `);

  // Se dashboard_grids è vuoto, proviamo a popolarlo con le vecchie categorie
  const gridsCount = sqlite
    .prepare("SELECT count(*) as count FROM dashboard_grids")
    .get() as { count: number };
  if (gridsCount.count === 0) {
    const hasCategories = sqlite
      .prepare(
        "SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='categories'",
      )
      .get() as { count: number };
    if (hasCategories.count > 0) {
      sqlite.exec(`
        INSERT INTO dashboard_grids (id, name, position, show_header)
        SELECT id, name, position, 1 FROM categories WHERE id != -1;
      `);
    }
  }

  // Aggiunta nuove colonne a services
  const hasGridId = columns.some((c) => c.name === "grid_id");
  if (!hasGridId) {
    sqlite.exec(
      `ALTER TABLE services ADD COLUMN grid_id INTEGER REFERENCES dashboard_grids(id);`,
    );
    // Imposta il grid_id uguale al vecchio category_id se esiste in dashboard_grids (ignoriamo la categoria fantasma)
    sqlite.exec(
      `UPDATE services SET grid_id = category_id WHERE category_id != -1;`,
    );
  }
  const hasX = columns.some((c) => c.name === "x");
  if (!hasX)
    sqlite.exec(
      `ALTER TABLE services ADD COLUMN x INTEGER DEFAULT 0 NOT NULL;`,
    );
  const hasY = columns.some((c) => c.name === "y");
  if (!hasY)
    sqlite.exec(
      `ALTER TABLE services ADD COLUMN y INTEGER DEFAULT 0 NOT NULL;`,
    );
  const hasW = columns.some((c) => c.name === "w");
  if (!hasW)
    sqlite.exec(
      `ALTER TABLE services ADD COLUMN w INTEGER DEFAULT 2 NOT NULL;`,
    );
  const hasH = columns.some((c) => c.name === "h");
  if (!hasH)
    sqlite.exec(
      `ALTER TABLE services ADD COLUMN h INTEGER DEFAULT 2 NOT NULL;`,
    );

  // Inizializza w, h basandosi su size se w è ancora 2 e size indica altro
  // size format: "gs-2x2", "2x1", etc.
  // We can just rely on the new frontend logic or set a basic default, we'll keep w/h as 2/2 initially.
} catch (e: any) {
  console.error("Migration error:", e.message);
}

export const db = drizzle(sqlite, { schema });
export const sqliteInstance = sqlite;
