const fs = require('fs');
const https = require('https');
const path = require('path');

const guestsFilePath = path.join(__dirname, '..', 'public', 'guests.json');

if (!fs.existsSync(guestsFilePath)) {
  console.error('File guests.json not found in public/');
  process.exit(1);
}

const rawData = fs.readFileSync(guestsFilePath, 'utf8');
const historicalGuests = JSON.parse(rawData);
const historicalNames = historicalGuests.map(g => g.fullName);

console.log('Historical names to delete:', historicalNames);

const SUPABASE_URL = 'https://pkillhsdugnsevogizum.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5mfxOtyJRCNa1yFBgGBwsw_ykqwsmJ8';

// Function to delete guests by name
function deleteGuestsByName(names) {
  return new Promise((resolve, reject) => {
    // We will build a query filter like `full_name=in.("Name 1","Name 2")`
    const encodedNames = names.map(n => `"${n}"`).join(',');
    const options = {
      hostname: 'pkillhsdugnsevogizum.supabase.co',
      path: `/rest/v1/guests?full_name=in.(${encodeURIComponent(encodedNames)})`,
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      console.log('Delete historical guests status:', res.statusCode);
      resolve();
    });

    req.on('error', reject);
    req.end();
  });
}

// Function to fetch all guests, find duplicates, and delete them
function cleanupDuplicates() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'pkillhsdugnsevogizum.supabase.co',
      path: '/rest/v1/guests?select=id,full_name,table_number',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', async () => {
        try {
          const guests = JSON.parse(data);
          const seen = new Set();
          const duplicates = [];

          guests.forEach(g => {
            const key = `${g.full_name.trim().toLowerCase()}_${(g.table_number || '').trim().toLowerCase()}`;
            if (seen.has(key)) {
              duplicates.push(g.id);
            } else {
              seen.add(key);
            }
          });

          console.log(`Found ${duplicates.length} duplicate records to delete.`);
          
          if (duplicates.length > 0) {
            // Delete duplicates by ID
            const idsFilter = duplicates.join(',');
            const delOptions = {
              hostname: 'pkillhsdugnsevogizum.supabase.co',
              path: `/rest/v1/guests?id=in.(${idsFilter})`,
              method: 'DELETE',
              headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
              }
            };
            const delReq = https.request(delOptions, (delRes) => {
              console.log('Delete duplicates status:', delRes.statusCode);
              resolve();
            });
            delReq.on('error', reject);
            delReq.end();
          } else {
            resolve();
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  try {
    await deleteGuestsByName(historicalNames);
    await cleanupDuplicates();
    console.log('Database cleanup completed successfully!');
  } catch (err) {
    console.error('Error during cleanup:', err);
  }
}

run();
