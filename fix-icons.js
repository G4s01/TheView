import Database from "better-sqlite3";
const db = new Database("data/sqlite.db");
const result = db.prepare(`UPDATE services SET icon = SUBSTR(icon, 2) WHERE icon LIKE '/http%'`).run();
console.log("Updated icons in database:", result.changes);
