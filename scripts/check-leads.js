const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://root:rootpassword@127.0.0.1:5433/agency_master_db' });
c.connect()
  .then(() => c.query('SELECT count(*) FROM "Lead"'))
  .then(r => { console.log('Total Lead count:', r.rows[0].count); return c.query('SELECT "tenantId", count(*) FROM "Lead" GROUP BY "tenantId"'); })
  .then(r => { console.log('By tenant:', JSON.stringify(r.rows, null, 2)); return c.query('SELECT id, name, "companyName", phone, "tenantId", "createdAt", source, status FROM "Lead" ORDER BY "createdAt" DESC LIMIT 5'); })
  .then(r => { console.log('Latest 5 leads:'); console.log(JSON.stringify(r.rows, null, 2)); c.end(); })
  .catch(e => { console.error(e.message); c.end(); });
