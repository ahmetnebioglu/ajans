export default {
  schema: "./packages/db/prisma/schema.prisma",
  ...(process.env.DATABASE_URL ? {
    datasource: {
      url: process.env.DATABASE_URL
    }
  } : {})
};
