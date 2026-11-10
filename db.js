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
  );

  CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_id INTEGER NOT NULL REFERENCES vendors(id),
    description TEXT NOT NULL,
    amount INTEGER NOT NULL CHECK (amount > 0),
    invoice_date TEXT NOT NULL,
    terms_days INTEGER NOT NULL DEFAULT 30,
    completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
    completed_date TEXT,
    approved INTEGER NOT NULL DEFAULT 0 CHECK (approved IN (0, 1)),
    approved_date TEXT,
    approved_by TEXT,
    paid_date TEXT,
    payment_method TEXT
  );
`);

module.exports = db;
