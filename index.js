// index.js
const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// ====== Настройки ======
const CRM_BASE = 'https://crm.belmar.pro/api/v1';
const TOKEN = process.env.CRM_TOKEN || 'ba67df6a-a17c-476f-8e95-bcdb75ed3958';

const STATIC = {
  box_id: 28,
  offer_id: 5,
  countryCode: 'GB',
  language: 'en',
  password: 'qwerty12'
};
// =====================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статичні файли
app.use(express.static(path.join(__dirname, 'public')));

// Отримати IP користувача
function getClientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (xff) return xff.split(',')[0].trim();
  return (req.ip || req.connection.remoteAddress || '').replace('::ffff:', '');
}

// Proxy для addlead
app.post('/api/addlead', async (req, res) => {
  try {
    const { firstName, lastName, phone, email, clickId, custom1, custom2, custom3, quizAnswers } = req.body;

    if (!firstName || !lastName || !phone || !email) {
      return res.status(400).json({ status: false, error: 'missing required fields' });
    }

    // для тесту локально підставляємо реальний IP
    const ip = getClientIp(req) || '8.8.8.8';
    const landingUrl = req.get('origin') || req.get('referer') || 'http://localhost:3000';

    const payload = {
      firstName,
      lastName,
      phone,
      email,
      countryCode: STATIC.countryCode,
      box_id: STATIC.box_id,
      offer_id: STATIC.offer_id,
      landingUrl,
      ip,
      password: STATIC.password,
      language: STATIC.language,
      clickId: clickId || '',
      quizAnswers: quizAnswers || '',
      custom1: custom1 || '',
      custom2: custom2 || '',
      custom3: custom3 || ''
    };

    const response = await axios.post(`${CRM_BASE}/addlead`, payload, {
      headers: { token: TOKEN, 'Content-Type': 'application/json' },
      timeout: 15000
    });

    return res.json(response.data);
  } catch (err) {
    console.error('Error /api/addlead:', err?.response?.data || err.message || err);
    const msg = (err?.response?.data) ? err.response.data : { status: false, error: 'server error' };
    return res.status(500).json(msg);
  }
});

// Proxy для getstatuses
app.post('/api/getstatuses', async (req, res) => {
  try {
    const { date_from, date_to, page = 0, limit = 100 } = req.body;

    const payload = {
      date_from: date_from || '',
      date_to: date_to || '',
      page,
      limit
    };

    const response = await axios.post(`${CRM_BASE}/getstatuses`, payload, {
      headers: { token: TOKEN, 'Content-Type': 'application/json' },
      timeout: 15000
    });

    let respData = response.data;
    if (respData && respData.data && typeof respData.data === 'string') {
      try { respData.data = JSON.parse(respData.data); } catch(e) {}
    }

    return res.json(respData);
  } catch (err) {
    console.error('Error /api/getstatuses:', err?.response?.data || err.message || err);
    const msg = (err?.response?.data) ? err.response.data : { status: false, error: 'server error' };
    return res.status(500).json(msg);
  }
});

// Catch-all для index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
