const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://root:rootpassword@127.0.0.1:5433/agency_master_db' });
c.connect()
  .then(() => c.query(`SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public' AND tablename IN ('Lead','LeadInteraction','Customer','Order','User','SiteSettings') ORDER BY tablename`))
  .then(r => { console.log('--- RLS durumu ---'); console.log(JSON.stringify(r.rows, null, 2)); return c.query(`SELECT schemaname, tablename, policyname, cmd, qual FROM pg_policies WHERE schemaname='public' ORDER BY tablename`); })
  .then(r => { console.log('\n--- RLS Policies ---'); console.log(JSON.stringify(r.rows, null, 2)); c.end(); })
  .catch(e => { console.error(e.message); c.end(); });
