import { Pool } from 'pg';

async function main() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://root:rootpassword@127.0.0.1:5433/agency_master_db?schema=public';
  const pool = new Pool({ connectionString });

  try {
    const result = await pool.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'Lead' AND column_name = 'placeId'`
    );

    if (result.rowCount > 0) {
      console.log('Column Lead.placeId already exists. Nothing to do.');
      return;
    }

    console.log('Adding missing column Lead.placeId...');
    await pool.query('ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "placeId" TEXT');
    await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS "Lead_placeId_key" ON "Lead"("placeId")');
    console.log('Column Lead.placeId created successfully.');
  } catch (error) {
    console.error('Error ensuring Lead.placeId column:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
