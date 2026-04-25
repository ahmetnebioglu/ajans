import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

import { unsecured_prisma as prisma } from "../src/client";

async function main() {
  console.log("Seeding started...");

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
  await prisma.companyAccess.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  // 2. Kullanıcılar (Global & Tenant Bazlı)
  const mercanAdmin = await prisma.user.create({
    data: {
      name: "Mercan Admin",
      email: "admin@mercan.com",
      role: "ADMIN",
      tenantId: "mercan",
    },
  });

  const systemUser = await prisma.user.create({
    data: {
      id: "system-user-id",
      name: "Sistem",
      email: "system@ajans.com",
      role: "ADMIN",
      tenantId: "global",
    },
  });

  const okulAdmin = await prisma.user.create({
    data: {
      name: "Okul Admin",
      email: "admin@okul.com",
      role: "ADMIN",
      tenantId: "okul",
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

  // 3. Mercan ERP (CRM & Lead) Verileri
  const lead1 = await prisma.lead.create({
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
            createdById: mercanAdmin.id,
            tenantId: "mercan",
          },
        ],
      },
    },
  });

  const lead2 = await prisma.lead.create({
    data: {
      fullName: "Zeynep Kaya",
      email: "zeynep@isletme.com",
      phone: "0544 987 65 43",
      source: "OKUL_LANDING",
      message: "Okulumuz için İSG denetimi yaptırmak istiyoruz.",
      status: "CONTACTED",
      tenantId: "mercan",
    },
  });

  console.log("Leads created.");

  // 4. Okul ERP Verileri
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

  await prisma.permissionRequest.create({
    data: {
      studentId: student.id,
      requestedById: okulParent.id,
      type: "ABSENCE",
      reason: "Hastalık nedeniyle gelemedi.",
      status: "APPROVED",
      date: new Date(),
      tenantId: "okul",
      approvedById: okulTeacher.id,
    },
  });

  console.log("Okul ERP data created.");

  // 5. Şirketler & Raporlar (Mercan ERP)
  const company = await prisma.company.create({
    data: {
      name: "Arçelik A.Ş.",
      taxNumber: "1234567890",
      address: "İstanbul",
      createdById: mercanAdmin.id,
    },
  });

  await prisma.companyAccess.create({
    data: {
       userId: mercanAdmin.id,
       companyId: company.id
    }
  });

  await prisma.report.create({
    data: {
      title: "Yıllık Risk Değerlendirmesi",
      companyId: company.id,
      status: "ONAYLANDI",
      category: "Risk Analizi",
      uploadedById: mercanAdmin.id,
    },
  });

  console.log("Company & Reports created.");

  // 6. Bildirimler
  await prisma.notification.createMany({
    data: [
      { userId: mercanAdmin.id, message: "Sisteme yeni bir lead girişi yapıldı.", type: "SUCCESS" },
      { userId: okulTeacher.id, message: "Ali Veli için yeni bir izin talebi var.", type: "INFO" },
    ],
  });

  console.log("Notifications created.");
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
