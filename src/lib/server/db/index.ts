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
} catch (e: any) {
  console.error("Migration error:", e.message);
}

export const db = drizzle(sqlite, { schema });
