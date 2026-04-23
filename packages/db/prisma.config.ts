import { defineConfig } from '@prisma/config'

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://root:rootpassword@localhost:5433/agency_master_db?schema=public",
  },
  migrations: {
    seed: "npx tsx prisma/seed.ts",
  },
})