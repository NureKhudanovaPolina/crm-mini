const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const LEADS_FILE = path.join(__dirname, 'leads.json');

app.post('/api/addlead', (req, res) => {
  const { firstName, lastName, phone, email, box_id, offer_id, countryCode, language, password, landingUrl, ip, clickId } = req.body;
  if (!firstName || !lastName || !phone || !email) {
    return res.status(400).json({ status: false, error: 'Missing required fields' });
  }

  const lead = {
    id: uuidv4(),
    firstName, lastName, phone, email,
    box_id, offer_id, countryCode, language, password,
    landingUrl, ip, clickId,
    status: 'new',
    ftd: false,
    createdAt: new Date().toISOString()
  };

  let leads = [];
  if (fs.existsSync(LEADS_FILE)) {
    leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
  }

  leads.push(lead);
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
  res.json({ status: true, ...lead });
});

app.post('/api/getstatuses', (req, res) => {
  const { date_from, date_to } = req.body;
  let leads = [];
  if (fs.existsSync(LEADS_FILE)) {
    leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
  }

  const filteredLeads = leads.filter(l => {
    const d = l.createdAt.split('T')[0];
    if (date_from && d < date_from) return false;
    if (date_to && d > date_to) return false;
    return true;
  });

  res.json({ status: true, data: filteredLeads });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
