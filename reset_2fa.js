import Database from 'better-sqlite3';
const db = new Database('data/sqlite.db');
db.prepare("UPDATE settings SET value = 'false' WHERE key = 'totp_enabled'").run();
db.prepare("DELETE FROM settings WHERE key = 'totp_secret'").run();
console.log("2FA è stato disattivato. Puoi ora ricrearlo dalla dashboard.");
