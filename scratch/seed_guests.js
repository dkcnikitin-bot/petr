const fs = require('fs');
const https = require('https');
const path = require('path');

const guestsFilePath = path.join(__dirname, '..', 'public', 'guests.json');

if (!fs.existsSync(guestsFilePath)) {
  console.error('File guests.json not found in public/');
  process.exit(1);
}

const rawData = fs.readFileSync(guestsFilePath, 'utf8');
const guests = JSON.parse(rawData);

const dbGuests = guests.map(g => ({
  full_name: g.fullName,
  city: g.city || '',
  table_number: g.tableNumber || '',
  status: g.status || 'Silver',
  lat: parseFloat(g.lat) || 55.0,
  lng: parseFloat(g.lng) || 37.0,
  is_arrived: !!g.isArrived,
  payment: parseInt(g.payment) || 0
}));

const SUPABASE_URL = 'https://pkillhsdugnsevogizum.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5mfxOtyJRCNa1yFBgGBwsw_ykqwsmJ8';

const payload = JSON.stringify(dbGuests);

const options = {
  hostname: 'pkillhsdugnsevogizum.supabase.co',
  path: '/rest/v1/guests',
  method: 'POST',
  headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates'
  }
};

const req = https.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Response:', data);
    console.log('Successfully seeded database with guests!');
  });
});

req.on('error', (e) => {
  console.error('Error seeding guests:', e);
});

req.write(payload);
req.end();
