import { unsecured_prisma as prisma } from "../src/client";
import { v4 as uuidv4 } from "uuid";

async function main() {
  console.log(">>> [STRESS SEED] Started - Deep module population...");

  // 1. USERS
  const admin = await prisma.user.upsert({
    where: { email: "admin@mercan.test" },
    update: { id: "test-admin-id" },
    create: { 
      id: "test-admin-id",
      email: "admin@mercan.test", 
      name: "Mercan Admin", 
      role: "ADMIN", 
      tenantId: "mercan" 
    },
  });

  const expert = await prisma.user.upsert({
    where: { email: "uzman@mercan.test" },
    update: { id: "test-uzman-id" },
    create: { 
      id: "test-uzman-id",
      email: "uzman@mercan.test", 
      name: "İSG Uzmanı Ahmet", 
      role: "EXPERT", 
      tenantId: "mercan" 
    },
  });

  const hrManager = await prisma.user.upsert({
    where: { email: "hr@mercan.test" },
    update: { id: "test-hr-id" },
    create: { 
      id: "test-hr-id",
      email: "hr@mercan.test", 
      name: "İK Müdürü Selin", 
      role: "HR_MANAGER", 
      tenantId: "mercan" 
    },
  });

  // 2. COMPANIES (Pagination Test - 25 Companies)
  console.log(">>> Seeding 25 Companies...");
  for (let i = 1; i <= 25; i++) {
    await prisma.company.upsert({
      where: { id: `stress-comp-${i}` },
      update: {},
      create: {
        id: `stress-comp-${i}`,
        name: `${["Tekno", "Global", "Mega", "Artı", "Öncü"][i % 5]} ${["Lojistik", "İnşaat", "Tekstil", "Gıda", "Metal"][i % 5]} Ltd. Şti.`,
        taxNumber: `10000000${i.toString().padStart(2, '0')}`,
        address: `${["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya"][i % 5]}, Türkiye`,
        tenantId: "mercan",
      },
    });
  }

  // 3. JOB POSTINGS (10 Jobs)
  console.log(">>> Seeding 10 Job Postings...");
  const jobTitles = ["İSG Uzmanı", "İşyeri Hekimi", "Sağlık Memuru", "Satış Temsilcisi", "Operasyon Müdürü"];
  const jobs = [];
  for (let i = 1; i <= 10; i++) {
    const job = await prisma.jobPosting.create({
      data: {
        title: `${jobTitles[i % 5]} - Grup ${Math.ceil(i / 2)}`,
        description: "Pozisyon detayları ve beklentiler...",
        status: i % 3 === 0 ? "DRAFT" : "ACTIVE",
        tenantId: "mercan",
      }
    });
    jobs.push(job);
  }

  // 4. CANDIDATES (Pagination Test - 20 Candidates)
  console.log(">>> Seeding 20 Candidates...");
  for (let i = 1; i <= 20; i++) {
    await prisma.candidate.create({
      data: {
        firstName: ["Ali", "Ayşe", "Mehmet", "Fatma", "Can", "Zeynep"][i % 6],
        lastName: ["Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Öztürk"][i % 6],
        email: `candidate${i}@test.com`,
        phone: `0500 000 00 ${i.toString().padStart(2, '0')}`,
        appliedForId: jobs[i % jobs.length].id,
        status: ["NEW", "REVIEW", "INTERVIEW", "REJECTED", "HIRED"][i % 5] as any,
        tenantId: "mercan",
      }
    });
  }

  // 5. LEAVE REQUESTS (Pagination Test - 18 Requests)
  console.log(">>> Seeding 18 Leave Requests...");
  for (let i = 1; i <= 18; i++) {
    await prisma.leaveRequest.create({
      data: {
        userId: i % 2 === 0 ? expert.id : hrManager.id,
        startDate: new Date(2026, 5, i),
        endDate: new Date(2026, 5, i + 3),
        type: ["ANNUAL", "SICK", "EXCUSE"][i % 3] as any,
        status: ["PENDING", "APPROVED", "REJECTED"][i % 3] as any,
        tenantId: "mercan",
      }
    });
  }

  // 6. CRM LEADS (15 Leads)
  console.log(">>> Seeding 15 Leads...");
  for (let i = 1; i <= 15; i++) {
    await prisma.lead.create({
      data: {
        fullName: `Müşteri Adayı ${i}`,
        email: `lead${i}@company.com`,
        source: i % 2 === 0 ? "MERCAN_WEBSITE" : "REFERRAL",
        message: "Hizmetleriniz hakkında bilgi almak istiyoruz.",
        status: ["NEW", "CONTACTED", "PROPOSAL_SENT", "CLOSED_WON"][i % 4],
        tenantId: "mercan",
      }
    });
  }

  // 7. AUDIT LOGS (Pagination Test - 40 Logs)
  console.log(">>> Seeding 40 Audit Logs...");
  const actions = ["USER_LOGIN", "REPORT_UPLOAD", "LEAVE_REQUEST_CREATED", "CANDIDATE_STATUS_UPDATED", "COMPANY_CREATED"];
  for (let i = 1; i <= 40; i++) {
    await prisma.auditLog.create({
      data: {
        userId: i % 3 === 0 ? expert.id : (i % 3 === 1 ? hrManager.id : admin.id),
        action: actions[i % actions.length],
        details: `Sistem işlemi #${i} başarıyla gerçekleştirildi.`,
        tenantId: "mercan",
        createdAt: new Date(Date.now() - i * 3600000), // Her biri 1 saat arayla
      }
    });
  }

  // 8. REPORTS (Pagination Test - 40 Reports)
  console.log(">>> Seeding 40 Reports...");
  const reportCategories = ["İSG Denetim", "Eğitim Katılım", "Ramak Kala", "Periyodik Kontrol", "Yıllık Değerlendirme"];
  const reportStatuses = ["BEKLEMEDE", "AKSIYON_GEREKLI", "COZULDU"];
  for (let i = 1; i <= 40; i++) {
    await prisma.report.create({
      data: {
        title: `${reportCategories[i % reportCategories.length]} Raporu - ${2025 + (i % 2)} / ${i}`,
        category: reportCategories[i % reportCategories.length],
        status: reportStatuses[i % reportStatuses.length] as any,
        companyId: `stress-comp-${(i % 25) + 1}`,
        uploadedById: expert.id,
        fileUrl: `https://drive.google.com/file/d/dummy-${uuidv4()}`,
        tenantId: "mercan",
        createdAt: new Date(Date.now() - i * 86400000), // Her gün bir rapor
      }
    });
  }

  console.log(">>> [STRESS SEED] Completed - All modules populated for pagination testing!");
}

main()
  .catch((e) => {
    console.error(">>> Stress seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
