export default {
  schema: "./packages/db/prisma/schema.prisma",
  datasource: {
    url: process.env.CUSTOM_PRISMA_URL
  }
};
