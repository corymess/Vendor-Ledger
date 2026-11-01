const Database = require('better-sqlite3');

const db = new Database('vendor-ledger.db');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS vendors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    goods_or_service TEXT NOT NULL,
    contact TEXT,
    address TEXT
  )
`);

module.exports = db;
