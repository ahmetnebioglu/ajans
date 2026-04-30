export default {
  schema: "./packages/db/prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL
  }
};
