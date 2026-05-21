import { Pool } from 'pg';

async function main(){
  const connectionString = process.env.DATABASE_URL || 'postgresql://root:rootpassword@127.0.0.1:5433/agency_master_db?schema=public';
  const pool = new Pool({ connectionString });

  const select = await pool.query("SELECT id, email FROM \"Candidate\" WHERE email LIKE 'test.candidate.%' OR email LIKE 'test.candidate.%@example.com'");
  console.log('Found test candidates:', select.rowCount);
  select.rows.forEach(r => console.log('-', r.id, r.email));

  if (select.rowCount === 0) {
    await pool.end();
    return;
  }

  const res = await pool.query("DELETE FROM \"Candidate\" WHERE email LIKE 'test.candidate.%' OR email LIKE 'test.candidate.%@example.com'");
  console.log('Deleted rows:', res.rowCount);

  await pool.end();
}

main().catch(e=>{console.error(e); process.exit(1)});