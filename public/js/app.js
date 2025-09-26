function el(id) { return document.getElementById(id); }

const API_URL = "/api"; 

// LEAD FORM LOGIC

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
      clickId: el('clickId') ? el('clickId').value : ''
    };

    if (!payload.firstName || !payload.lastName || !payload.phone || !payload.email) {
      resultDiv.innerHTML = '<div class="error">Please fill required fields.</div>';
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
      console.log("AddLead response:", data);

      if (data.status === true) {
        resultDiv.innerHTML = `<div class="success">
          ✅ Lead sent! <br>
          ID: ${data.id || '-'} <br>
          Email: ${data.email || '-'} <br>
        </div>`;
        form.reset();
      } else {
        resultDiv.innerHTML = `<div class="error">❌ Error: ${data.error || 'unknown error'}</div>`;
      }
    } catch (err) {
      console.error(err);
      resultDiv.innerHTML = `<div class="error">⚠️ Network or server error</div>`;
    }
  });
}

// STATUSES PAGE LOGIC

if (el('loadBtn')) {
  const loadBtn = el('loadBtn');
  const info = el('info');
  const tbody = document.querySelector('#statusesTable tbody');

  function formatDateTimeLocal(dtValue) {
    if (!dtValue) return '';
    const d = new Date(dtValue);
    const pad = n => String(n).padStart(2,'0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
  }

  async function loadStatuses() {
    tbody.innerHTML = '';
    info.textContent = 'Loading...';

    const payload = {
      date_from: el('dateFrom').value ? formatDateTimeLocal(el('dateFrom').value) : '',
      date_to: el('dateTo').value ? formatDateTimeLocal(el('dateTo').value) : '',
      page: 0,
      limit: 100
    };

    console.log('Loading statuses with payload:', payload);

    try {
      const resp = await fetch(`${API_URL}/getstatuses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await resp.json();
      console.log("GetStatuses response:", data);

      if (!data.status) {
        info.innerHTML = `<div class="error">❌ Error: ${data.error || 'unknown'}</div>`;
        return;
      }

      if (!Array.isArray(data.data) || data.data.length === 0) {
        info.textContent = 'No records found';
        return;
      }

      const filteredRows = data.data; 

      if (filteredRows.length === 0) {
        info.textContent = 'No filtered records found';
        return;
      }

      info.textContent = `✅ Loaded ${filteredRows.length} rows`;

      for (const r of filteredRows) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${r.id}</td><td>${r.email}</td><td>${r.status}</td><td>${r.ftd}</td>`;
        tbody.appendChild(tr);
      }

    } catch (err) {
      console.error(err);
      info.innerHTML = `<div class="error">⚠️ Network or server error</div>`;
    }
  }

  loadBtn.addEventListener('click', loadStatuses);

  loadStatuses();
}
