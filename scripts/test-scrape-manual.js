const { Client } = require('pg');

const c = new Client({ connectionString: 'postgresql://root:rootpassword@127.0.0.1:5433/agency_master_db' });

c.connect()
  .then(() => {
    console.log('✅ DB bağlantısı başarılı');
    return c.query('SELECT COUNT(*) FROM "Lead" WHERE "tenantId" = \'teknikel\'');
  })
  .then(r => {
    console.log(`📊 Teknikel Lead sayısı: ${r.rows[0].count}`);
    return c.query('SELECT id, name, "companyName", phone, "tenantId", source FROM "Lead" WHERE "tenantId" = \'teknikel\' ORDER BY "createdAt" DESC LIMIT 10');
  })
  .then(r => {
    console.log(`\n📋 Teknikel Leads (son 10):`);
    console.log(JSON.stringify(r.rows, null, 2));
    c.end();
  })
  .catch(e => {
    console.error('❌ Hata:', e.message);
    c.end();
  });
