const message = document.getElementById('message');
const totalLabel = document.getElementById('total');
const list = document.getElementById('to-pay-list');
const table = document.getElementById('to-pay-table');
const emptyNote = document.getElementById('empty-note');

function formatMoney(cents) {
  return '$' + (cents / 100).toFixed(2);
}

function todayString() {
  return new Date().toLocaleDateString('en-CA');
}

// Send a payment for one invoice to the server
async function recordPayment(invoice, paymentDate, paymentMethod) {
  try {
    const response = await fetch(`/api/invoices/${invoice.id}/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payment_date: paymentDate,
        payment_method: paymentMethod
      })
    });
    const result = await response.json();

    if (!response.ok) {
      message.textContent = result.error;
      return;
    }

    message.textContent =
      `Recorded payment of ${formatMoney(result.amount)} to ${result.vendor_name} ` +
      `by ${result.payment_method} on ${result.paid_date}.`;
    loadToPay();
  } catch (error) {
    message.textContent = 'Could not reach the server.';
  }
}

// Build the payment cell (date, method, Pay button) for one invoice
function buildPaymentCell(invoice) {
  const cell = document.createElement('td');

  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.value = todayString();

  const methodSelect = document.createElement('select');
  for (const method of ['Check', 'ACH', 'Wire', 'Card', 'Cash']) {
    const option = document.createElement('option');
    option.value = method;
    option.textContent = method;
    methodSelect.appendChild(option);
  }

  const button = document.createElement('button');
  button.textContent = 'Pay';
  button.addEventListener('click', () => {
    recordPayment(invoice, dateInput.value, methodSelect.value);
  });

  cell.appendChild(dateInput);
  cell.appendChild(methodSelect);
  cell.appendChild(button);
  return cell;
}

async function loadToPay() {
  try {
    const response = await fetch('/api/invoices/to-pay');
    const data = await response.json();

    list.innerHTML = '';
    totalLabel.textContent = `Total to pay: ${formatMoney(data.total)}`;
    table.hidden = data.invoices.length === 0;
    emptyNote.textContent =
      data.invoices.length === 0 ? 'Nothing is ready to pay right now.' : '';

    for (const invoice of data.invoices) {
      const row = document.createElement('tr');
      const cells = [
        invoice.vendor_name,
        invoice.description,
        formatMoney(invoice.amount),
        invoice.due_date
      ];
      for (const text of cells) {
        const cell = document.createElement('td');
        cell.textContent = text;
        row.appendChild(cell);
      }
      row.appendChild(buildPaymentCell(invoice));
      list.appendChild(row);
    }
  } catch (error) {
    emptyNote.textContent = 'Could not load invoices.';
  }
}

loadToPay();
