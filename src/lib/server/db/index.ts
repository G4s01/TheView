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
    container_id TEXT,
    widget_type TEXT,
    ping_enabled INTEGER DEFAULT 1 NOT NULL,
    position INTEGER DEFAULT 0
  );
`);

// Eseguiamo la migrazione in modo sicuro se la colonna non esiste
try {
  sqlite.exec(`ALTER TABLE services ADD COLUMN container_id TEXT;`);
} catch (e: any) {
  // Ignora se la colonna esiste già (errore "duplicate column name")
}

export const db = drizzle(sqlite, { schema });
