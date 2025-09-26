function el(id) { return document.getElementById(id); }
const API_URL = "/api";

// Lead form
if (el('leadForm')) {
  const form = el('leadForm');
  const resultDiv = el('result');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    resultDiv.innerHTML = '';

    const payload = {
      firstName: el('firstName').value.trim(),
      lastName: el('lastName').value.trim(),
      phone: el('phone').value.trim(),
      email: el('email').value.trim(),
      box_id: 28,
      offer_id: 5,
      countryCode: "GB",
      language: "en",
      password: "qwerty12",
      landingUrl: window.location.origin,
      ip: "0.0.0.0",
      clickId: el('clickId') ? el('clickId').value : ""
    };

    if (!payload.firstName || !payload.lastName || !payload.phone || !payload.email) {
      resultDiv.innerHTML = '<div class="error">Please fill required fields</div>';
      return;
    }

    try {
      resultDiv.innerHTML = 'Sending...';
      const resp = await fetch(`${API_URL}/addlead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await resp.json();
      if (data.status) {
        resultDiv.innerHTML = `<div class="success">✅ Lead sent! ID: ${data.id}</div>`;
        form.reset();
      } else {
        resultDiv.innerHTML = `<div class="error">❌ Error: ${data.error}</div>`;
      }
    } catch (err) {
      console.error(err);
      resultDiv.innerHTML = `<div class="error">⚠️ Network or server error</div>`;
    }
  });
}

// Statuses page
if (el('loadBtn')) {
  const loadBtn = el('loadBtn');
  const info = el('info');
  const tbody = document.querySelector('#statusesTable tbody');

  function formatDate(dt) {
    if (!dt) return '';
    const d = new Date(dt);
    const pad = n => String(n).padStart(2,'0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  }

  async function loadStatuses() {
    tbody.innerHTML = '';
    info.textContent = 'Loading...';

    const payload = {
      date_from: formatDate(el('dateFrom')?.value),
      date_to: formatDate(el('dateTo')?.value)
    };

    try {
      const resp = await fetch(`${API_URL}/getstatuses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await resp.json();
      if (!data.status) {
        info.innerHTML = `<div class="error">❌ ${data.error}</div>`;
        return;
      }

      if (!data.data.length) {
        info.textContent = 'No records found';
        return;
      }

      info.textContent = `✅ Loaded ${data.data.length} rows`;
      for (const r of data.data) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${r.id}</td>
          <td>${r.email}</td>
          <td>${r.status}</td>
          <td>${r.ftd}</td>
          <td>${r.createdAt}</td>
        `;
        tbody.appendChild(tr);
      }
    } catch(err) {
      console.error(err);
      info.innerHTML = '<div class="error">⚠️ Network or server error</div>';
    }
  }

  loadBtn.addEventListener('click', loadStatuses);
  loadStatuses();
}
