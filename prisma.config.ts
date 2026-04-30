export default {
  schema: "./packages/db/prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_POSTGRES_PRISMA_URL
  }
};
