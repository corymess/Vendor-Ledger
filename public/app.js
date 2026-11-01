const form = document.getElementById('vendor-form');
const message = document.getElementById('message');
const list = document.getElementById('vendor-list');
const emptyNote = document.getElementById('empty-note');

async function loadVendors() {
  try {
    const response = await fetch('/api/vendors');
    const vendors = await response.json();

    list.innerHTML = '';
    emptyNote.textContent = vendors.length === 0 ? 'No vendors yet.' : '';

    for (const vendor of vendors) {
      const item = document.createElement('li');
      item.textContent = `${vendor.name} - ${vendor.goods_or_service}`;
      list.appendChild(item);
    }
  } catch (error) {
    emptyNote.textContent = 'Could not load vendors.';
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const newVendor = {
    name: document.getElementById('name').value,
    goods_or_service: document.getElementById('goods_or_service').value,
    contact: document.getElementById('contact').value,
    address: document.getElementById('address').value
  };

  try {
    const response = await fetch('/api/vendors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newVendor)
    });
    const result = await response.json();

    if (!response.ok) {
      message.textContent = result.error;
      return;
    }

    message.textContent = `Added ${result.name}.`;
    form.reset();
    loadVendors();
  } catch (error) {
    message.textContent = 'Could not reach the server.';
  }
});

loadVendors();
