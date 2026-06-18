import { unsecured_prisma as prisma } from "../src/client";
import * as dotenv from "dotenv";
import * as path from "path";

// Kök dizindeki .env dosyasını oku
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const TABLES_TO_PROTECT = [
  "Lead",
  "LeadActivity",
  "Folder",
  "Report",
  "AuditLog",
  "Classroom",
  "Student",
  "ParentStudent",
  "PermissionRequest",
  "JobPosting",
  "Candidate",
  "LeaveRequest",
  "ServiceAccount",
  "NewsletterSubscriber",
  "Page",
  "PageSection",
  "Service",
  "BlogCategory",
  "BlogPost",
  "Reference",
  "ReferenceSector",
  "ContactMessage",
  "ReferenceRequest",
  "SiteSettings",
  "HomepageSettings",
  "Newsletter",
  "IsgLibrary",
  "IsgCategory",
  "IsgDocument",
  "NaceCode"
];

async function setupRLS() {
  console.log("🚀 Row Level Security (RLS) kurulumu başlatılıyor...");

  try {
    for (const table of TABLES_TO_PROTECT) {
      console.log(`🛡️  ${table} tablosu koruma altına alınıyor...`);
      
      // SQL Komutları
      await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" FORCE ROW LEVEL SECURITY;`);
      
      // Mevcut politikayı sil ve yeniden oluştur
      await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS tenant_isolation ON "${table}";`);
      await prisma.$executeRawUnsafe(`
        CREATE POLICY tenant_isolation ON "${table}" 
        USING ("tenantId" = current_setting('app.current_tenant', TRUE));
      `);
      
      console.log(`✅ ${table} başarıyla izole edildi.`);
    }

    console.log("\n✨ Tüm kritik tablolar RLS ile koruma altına alındı.");

  } catch (error) {
    console.error("❌ RLS kurulumu sırasında hata oluştu:", error);
  } finally {
    await prisma.$disconnect();
  }
}

setupRLS();
