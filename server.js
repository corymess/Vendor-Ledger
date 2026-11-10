const express = require('express');
const db = require('./db');

const app = express();
const PORT = 3000;

app.use(express.json());

app.use(express.static('public'));

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

// Shared query: an invoice with its vendor name and calculated due date
const INVOICE_SELECT = `
  SELECT invoices.*,
         vendors.name AS vendor_name,
         date(invoices.invoice_date, '+' || invoices.terms_days || ' days') AS due_date
  FROM invoices
  JOIN vendors ON vendors.id = invoices.vendor_id
`;

// List all invoices
app.get('/api/invoices', (req, res) => {
  const invoices = db
    .prepare(`${INVOICE_SELECT} ORDER BY invoices.invoice_date DESC, invoices.id DESC`)
    .all();
  res.json(invoices);
});

// Add an invoice
app.post('/api/invoices', (req, res) => {
  const { vendor_id, description, amount, invoice_date, terms_days } = req.body;

  const vendor = db.prepare('SELECT id FROM vendors WHERE id = ?').get(vendor_id);
  if (!vendor) {
    return res.status(400).json({ error: 'Please choose a vendor from the list.' });
  }

  if (!description || !description.trim()) {
    return res.status(400).json({ error: 'Please enter a description.' });
  }

  const amountText = String(amount ?? '').trim();
  if (!/^\d+(\.\d{1,2})?$/.test(amountText) || Number(amountText) <= 0) {
    return res.status(400).json({
      error: 'Amount must be a positive number with at most two decimals, like 250.00.'
    });
  }
  const cents = Math.round(Number(amountText) * 100);

  const dateText = String(invoice_date ?? '');
  const parsed = new Date(`${dateText}T00:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(dateText) ||
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== dateText
  ) {
    return res.status(400).json({ error: 'Please enter a valid invoice date.' });
  }

  const terms =
    terms_days === undefined || terms_days === '' ? 30 : Number(terms_days);
  if (!Number.isInteger(terms) || terms < 0) {
    return res.status(400).json({ error: 'Terms must be a whole number of days.' });
  }

  const result = db
    .prepare(
      'INSERT INTO invoices (vendor_id, description, amount, invoice_date, terms_days) VALUES (?, ?, ?, ?, ?)'
    )
    .run(vendor_id, description.trim(), cents, dateText, terms);

  const invoice = db
    .prepare(`${INVOICE_SELECT} WHERE invoices.id = ?`)
    .get(result.lastInsertRowid);
  res.status(201).json(invoice);
});

app.listen(PORT, () => {
  console.log(`Vendor Ledger running at http://localhost:${PORT}`);
});
