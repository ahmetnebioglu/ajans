import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import pg from "pg";
import { seedIsgLibrary } from "../seed-isg-library";
import { seedNaceCodes } from "../seed-nace-codes";

const connectionString =
  "postgresql://root:rootpassword@localhost:5433/agency_master_db?schema=public";
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEV_ADMIN_PASSWORD = "Test1234!";

const tenantAdmins = [
  {
    id: "admin-mercan-id",
    email: "admin@mercan.com",
    name: "Mercan Admin",
    tenantId: "mercan",
    withPassword: false,
  },
  {
    id: "admin-teknikel-id",
    email: "admin@teknikel.com",
    name: "Admin Teknikel",
    tenantId: "teknikel",
    withPassword: true,
  },
  {
    id: "admin-okul-id",
    email: "admin@okul.com",
    name: "Admin Okul",
    tenantId: "okul",
    withPassword: true,
  },
] as const;

async function main() {
  console.log("Safe Seeding started with PrismaPg adapter...");

  const hashedPassword = await bcrypt.hash(DEV_ADMIN_PASSWORD, 10);

  // 1. Her proje için admin kullanıcısı oluştur
  for (const admin of tenantAdmins) {
    await prisma.user.upsert({
      where: { email: admin.email },
      update: {
        role: "ADMIN",
        tenantId: admin.tenantId,
        ...(admin.withPassword ? { password: hashedPassword } : {}),
      },
      create: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: "ADMIN",
        tenantId: admin.tenantId,
        ...(admin.withPassword
          ? { password: hashedPassword, emailVerified: new Date() }
          : {}),
      },
    });
    console.log(`Admin oluşturuldu: ${admin.email} (${admin.tenantId})`);
  }

  // 2. Şirket Oluştur (Mercan Grup)
  const company = await prisma.company.upsert({
    where: { id: "mercan-grup-id" },
    update: {},
    create: {
      id: "mercan-grup-id",
      name: "Mercan Grup",
      driveFolderId:
        process.env.GOOGLE_DRIVE_FOLDER_ID ||
        "1RZDr4xQnqu4e374KobCwOc4fInttWKtQ",
    },
  });

  // 3. Saha Uzmanı Oluştur
  const expert = await prisma.user.upsert({
    where: { email: "uzman@mercan.com" },
    update: {},
    create: {
      email: "uzman@mercan.com",
      name: "Saha Uzmanı Ahmet",
      role: "EXPERT",
    },
  });

  // 4. Yetki Tanımla (Uzmanı Şirkete Bağla)
  await prisma.workspaceUser.upsert({
    where: {
      userId_workspaceId: {
        userId: expert.id,
        workspaceId: company.id,
      },
    },
    update: {},
    create: {
      userId: expert.id,
      workspaceId: company.id,
    },
  });

  // 5. İSG Kütüphanesi (mercan-website /isg-evrak-destegi)
  await seedIsgLibrary(prisma);

  // 6. NACE Kodları (mercan-website /tehlike-siniflari)
  await seedNaceCodes(prisma);

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
