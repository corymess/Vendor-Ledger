const express = require('express');
const db = require('./db');

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// List all vendors
app.get('/api/vendors', (req, res) => {
  const vendors = db.prepare('SELECT * FROM vendors ORDER BY name').all();
  res.json(vendors);
});

// Add a vendor
app.post('/api/vendors', (req, res) => {
  const { name, goods_or_service, contact, address } = req.body;

  if (!name || !name.trim() || !goods_or_service || !goods_or_service.trim()) {
    return res
      .status(400)
      .json({ error: 'Vendor name and what they provide are required.' });
  }

  const result = db
    .prepare(
      'INSERT INTO vendors (name, goods_or_service, contact, address) VALUES (?, ?, ?, ?)'
    )
    .run(name.trim(), goods_or_service.trim(), contact || null, address || null);

  const vendor = db
    .prepare('SELECT * FROM vendors WHERE id = ?')
    .get(result.lastInsertRowid);
  res.status(201).json(vendor);
});

app.listen(PORT, () => {
  console.log(`Vendor Ledger running at http://localhost:${PORT}`);
});
