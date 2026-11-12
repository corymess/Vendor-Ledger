const form = document.getElementById('invoice-form');
const message = document.getElementById('message');
const vendorSelect = document.getElementById('vendor_id');
const list = document.getElementById('invoice-list');
const table = document.getElementById('invoice-table');
const emptyNote = document.getElementById('empty-note');

function formatMoney(cents) {
  return '$' + (cents / 100).toFixed(2);
}

function yesNo(value) {
  return value === 1 ? 'Yes' : 'No';
}

async function loadVendors() {
  try {
    const response = await fetch('/api/vendors');
    const vendors = await response.json();

    vendorSelect.innerHTML = '';
    if (vendors.length === 0) {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'Add a vendor first';
      vendorSelect.appendChild(option);
      return;
    }

    for (const vendor of vendors) {
      const option = document.createElement('option');
      option.value = vendor.id;
      option.textContent = vendor.name;
      vendorSelect.appendChild(option);
    }
  } catch (error) {
    message.textContent = 'Could not load vendors.';
  }
}

// Send a completed/approved change for one invoice to the server
async function updateInvoice(id, changes) {
  try {
    const response = await fetch(`/api/invoices/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(changes)
    });
    const result = await response.json();

    if (!response.ok) {
      message.textContent = result.error;
      return;
    }

    message.textContent = changes.approved
      ? `Invoice approved by ${result.approved_by}.`
      : 'Invoice marked completed.';
    loadInvoices();
  } catch (error) {
    message.textContent = 'Could not reach the server.';
  }
}

// Build the "Next step" cell for one invoice
function buildNextStep(invoice) {
  const cell = document.createElement('td');

  if (invoice.paid_date) {
    cell.textContent = `Paid ${invoice.paid_date}`;
  } else if (!invoice.completed) {
    const button = document.createElement('button');
    button.textContent = 'Mark completed';
    button.addEventListener('click', () => {
      updateInvoice(invoice.id, { completed: true });
    });
    cell.appendChild(button);
  } else if (!invoice.approved) {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Approved by';

    const button = document.createElement('button');
    button.textContent = 'Approve';
    button.addEventListener('click', () => {
      updateInvoice(invoice.id, { approved: true, approved_by: input.value });
    });

    cell.appendChild(input);
    cell.appendChild(button);
  } else {
    cell.textContent = 'Ready to pay';
  }

  return cell;
}

async function loadInvoices() {
  try {
    const response = await fetch('/api/invoices');
    const invoices = await response.json();

    list.innerHTML = '';
    table.hidden = invoices.length === 0;
    emptyNote.textContent = invoices.length === 0 ? 'No invoices yet.' : '';

    for (const invoice of invoices) {
      const row = document.createElement('tr');
      const cells = [
        invoice.vendor_name,
        invoice.description,
        formatMoney(invoice.amount),
        invoice.invoice_date,
        invoice.due_date,
        yesNo(invoice.completed),
        yesNo(invoice.approved)
      ];
      for (const text of cells) {
        const cell = document.createElement('td');
        cell.textContent = text;
        row.appendChild(cell);
      }
      row.appendChild(buildNextStep(invoice));
      list.appendChild(row);
    }
  } catch (error) {
    emptyNote.textContent = 'Could not load invoices.';
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const newInvoice = {
    vendor_id: Number(vendorSelect.value),
    description: document.getElementById('description').value,
    amount: document.getElementById('amount').value,
    invoice_date: document.getElementById('invoice_date').value,
    terms_days: document.getElementById('terms_days').value
  };

  try {
    const response = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newInvoice)
    });
    const result = await response.json();

    if (!response.ok) {
      message.textContent = result.error;
      return;
    }

    message.textContent = `Added invoice for ${result.vendor_name}: ${formatMoney(result.amount)}, due ${result.due_date}.`;
    document.getElementById('description').value = '';
    document.getElementById('amount').value = '';
    loadInvoices();
  } catch (error) {
    message.textContent = 'Could not reach the server.';
  }
});

loadVendors();
loadInvoices();
