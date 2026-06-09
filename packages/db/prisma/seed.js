const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding started (JS)...");

  // 1. Temizleme
  await prisma.leadActivity.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.permissionRequest.deleteMany();
  await prisma.parentStudent.deleteMany();
  await prisma.student.deleteMany();
  await prisma.classroom.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.report.deleteMany();
  await prisma.folder.deleteMany();
  await prisma.workspaceUser.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  // 2. Kullanıcılar
  const admin = await prisma.user.create({
    data: {
      name: "Ahmet Admin",
      email: "ahmet@ajans.com",
      role: "ADMIN",
      tenantId: "mercan",
    },
  });

  const mercanExpert = await prisma.user.create({
    data: {
      name: "Mercan Uzman",
      email: "uzman@mercan.com",
      role: "EXPERT",
      tenantId: "mercan",
    },
  });

  const okulTeacher = await prisma.user.create({
    data: {
      name: "Fatma Öğretmen",
      email: "fatma@okul.com",
      role: "USER",
      tenantId: "okul",
    },
  });

  const okulParent = await prisma.user.create({
    data: {
      name: "Mehmet Veli",
      email: "mehmet@veli.com",
      role: "USER",
      tenantId: "okul",
    },
  });

  console.log("Users created.");

  // 3. Mercan ERP (CRM & Lead)
  await prisma.lead.create({
    data: {
      fullName: "Kadir Yılmaz",
      email: "kadir@example.com",
      phone: "0532 123 45 67",
      source: "MERCAN_WEBSITE",
      message: "İSG danışmanlığı hakkında bilgi almak istiyorum.",
      status: "NEW",
      tenantId: "mercan",
      activities: {
        create: [
          {
            type: "NOTE",
            description: "İlk başvuru alındı, web sitesi formu üzerinden.",
            createdById: admin.id,
            tenantId: "mercan",
          },
        ],
      },
    },
  });

  console.log("Leads created.");

  // 4. Okul ERP
  const classroom = await prisma.classroom.create({
    data: {
      name: "1-A Sınıfı",
      teacherId: okulTeacher.id,
      tenantId: "okul",
    },
  });

  const student = await prisma.student.create({
    data: {
      firstName: "Ali",
      lastName: "Veli",
      studentNumber: "101",
      classroomId: classroom.id,
      tenantId: "okul",
    },
  });

  await prisma.parentStudent.create({
    data: {
      parentId: okulParent.id,
      studentId: student.id,
      relationType: "Baba",
      tenantId: "okul",
    },
  });

  console.log("Okul ERP data created.");

  // 5. Şirketler
  const company = await prisma.company.create({
    data: {
      name: "Arçelik A.Ş.",
      taxNumber: "1234567890",
      address: "İstanbul",
      createdById: admin.id,
    },
  });

  await prisma.workspaceUser.create({
    data: { userId: mercanExpert.id, workspaceId: company.id }
  });

  await prisma.report.create({
    data: {
      title: "Yıllık Risk Değerlendirmesi",
      workspaceId: company.id,
      status: "ONAYLANDI",
      category: "Risk Analizi",
      uploadedById: mercanExpert.id,
    },
  });

  console.log("Company & Reports created.");
  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
