import { Pool } from 'pg';

async function main(){
  const connectionString = process.env.DATABASE_URL || 'postgresql://root:rootpassword@127.0.0.1:5433/agency_master_db?schema=public';
  const pool = new Pool({ connectionString });

  const before = await pool.query('SELECT COUNT(*) FROM "Candidate" WHERE "communicationOptIn" = false OR "communicationOptIn" IS NULL');
  console.log('To update (before):', before.rows[0].count);

  const res = await pool.query('UPDATE "Candidate" SET "communicationOptIn" = true WHERE "communicationOptIn" = false OR "communicationOptIn" IS NULL');
  console.log('Updated rows:', res.rowCount);

  const after = await pool.query('SELECT COUNT(*) FROM "Candidate" WHERE "communicationOptIn" = false OR "communicationOptIn" IS NULL');
  console.log('Remaining to update (after):', after.rows[0].count);

  await pool.end();
}

main().catch(e=>{console.error(e); process.exit(1)});