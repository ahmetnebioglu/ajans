const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("IsgCategory model check:");
  console.log(prisma.isgCategory ? "EXISTS" : "MISSING");
  console.log("IsgDocument model check:");
  console.log(prisma.isgDocument ? "EXISTS" : "MISSING");
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
