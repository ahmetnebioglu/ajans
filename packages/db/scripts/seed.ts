import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = "postgresql://root:rootpassword@localhost:5433/agency_master_db?schema=public";
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Safe Seeding started with PrismaPg adapter...");

  // 1. Şirket Oluştur (Mercan Grup)
  const company = await prisma.company.upsert({
    where: { id: "mercan-grup-id" },
    update: {},
    create: {
      id: "mercan-grup-id",
      name: "Mercan Grup",
      driveFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID || "1RZDr4xQnqu4e374KobCwOc4fInttWKtQ",
    },
  });

  // 2. Saha Uzmanı Oluştur
  const expert = await prisma.user.upsert({
    where: { email: "uzman@mercan.com" },
    update: {},
    create: {
      email: "uzman@mercan.com",
      name: "Saha Uzmanı Ahmet",
      role: "EXPERT",
    },
  });

  // 3. Yetki Tanımla (Uzmanı Şirkete Bağla)
  await prisma.userCompanyAccess.upsert({
    where: {
      userId_companyId: {
        userId: expert.id,
        companyId: company.id,
      },
    },
    update: {},
    create: {
      userId: expert.id,
      companyId: company.id,
    },
  });

  console.log("Safe Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
