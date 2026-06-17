import { defineConfig } from 'prisma/config';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.DATABASE_POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.CUSTOM_PRISMA_URL;

if (databaseUrl) {
  process.env.DATABASE_URL = databaseUrl;
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'npx tsx ./prisma/seed.ts',
  },
  datasource: {
    url: databaseUrl as string,
  },
});
