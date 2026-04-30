import { defineConfig } from "@prisma/config";

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_POSTGRES_PRISMA_URL,
  },
  migrations: {
    seed: "npx tsx prisma/seed.ts",
  },
});

