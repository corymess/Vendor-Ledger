const db = require('./db');

const resetAndSeed = db.transaction(() => {
  // Start clean: remove all rows and restart the id counters at 1
  db.exec(`
    DELETE FROM invoices;
    DELETE FROM vendors;
    DELETE FROM sqlite_sequence WHERE name IN ('invoices', 'vendors');
  `);

  const addVendor = db.prepare(
    'INSERT INTO vendors (name, goods_or_service, contact, address) VALUES (?, ?, ?, ?)'
  );
  addVendor.run('ACME Paper and Writing Implements', 'Office supplies', 'acme@example.com', '100 Main St, Springfield');
  addVendor.run('Bright Paper Supply', 'Printer paper', 'orders@example.com', '200 Oak Ave, Springfield');
  addVendor.run('Metro Cleaning Services', 'Office cleaning', '555-0100', '300 Pine Rd, Springfield');

  const addInvoice = db.prepare(`
    INSERT INTO invoices
      (vendor_id, description, amount, invoice_date, terms_days,
       completed, completed_date, approved, approved_date, approved_by,
       paid_date, payment_method)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Ready to pay: completed and approved, not paid
  addInvoice.run(1, 'Printer paper and pens', 25000, '2026-11-01', 30, 1, '2026-11-02', 1, '2026-11-03', 'Cory', null, null);
  addInvoice.run(2, 'Printer paper', 7550, '2026-11-09', 30, 1, '2026-11-10', 1, '2026-11-10', 'Cory', null, null);

  // Completed but not yet approved
  addInvoice.run(3, 'November cleaning', 12000, '2026-11-05', 15, 1, '2026-11-06', 0, null, null, null, null);

  // Not yet completed
  addInvoice.run(1, 'Toner', 4000, '2026-11-11', 30, 0, null, 0, null, null, null, null);

  // Already paid
  addInvoice.run(3, 'October cleaning', 12000, '2026-10-05', 15, 1, '2026-10-06', 1, '2026-10-07', 'Cory', '2026-10-18', 'ACH');
});

resetAndSeed();
console.log('Sample data loaded: 3 vendors, 5 invoices.');
