import { Pool } from 'pg';

async function main(){
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://root:rootpassword@127.0.0.1:5433/agency_master_db?schema=public'
  });

  const res = await pool.query("SELECT table_name, column_name, column_default, is_nullable, data_type FROM information_schema.columns WHERE column_name='communicationOptIn' OR column_name='communication_opt_in';");
  console.log(res.rows);
  await pool.end();
}

main().catch(e=>{console.error(e); process.exit(1)});
