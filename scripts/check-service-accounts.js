const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://root:rootpassword@127.0.0.1:5433/agency_master_db' });
c.connect()
  .then(() => c.query('SELECT count(*) FROM "ServiceAccount"'))
  .then(r => { console.log('ServiceAccount count:', r.rows[0].count); return c.query('SELECT count(*) FROM "Lead"'); })
  .then(r => { console.log('Lead count:', r.rows[0].count); c.end(); })
  .catch(e => { console.error(e.message); c.end(); });
