import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. Master Admin (Sizin Hesabınız)
  const masterEmail = "ahmetnebioglu89@gmail.com";
  const masterUser = await prisma.user.upsert({
    where: { email: masterEmail },
    update: { role: "ADMIN" },
    create: { email: masterEmail, name: "Ahmet Admin", role: "ADMIN" }
  });
  console.log(`✅ Ana Admin: ${masterEmail}`);

  // 2. Test Kullanıcıları Seti
  const testUsers = [
    { email: "admin@mercan.com", name: "Mercan Sistem Admin", role: "ADMIN" },
    { email: "uzman1@mercan.com", name: "Murat Uzman", role: "EXPERT" },
    { email: "uzman2@mercan.com", name: "Selma Uzman", role: "EXPERT" },
    { email: "musteri1@mercan.com", name: "Müşteri 1 (Test)", role: "CLIENT" },
    { email: "musteri2@mercan.com", name: "Müşteri 2 (Test)", role: "CLIENT" },
  ] as const;

  const usersMap: Record<string, any> = {};

  for (const u of testUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { role: u.role, name: u.name },
      create: { email: u.email, name: u.name, role: u.role }
    });
    usersMap[u.email] = user;
    console.log(`✅ Kullanıcı Hazır: ${u.email} [${u.role}]`);
  }

  // 3. Test Firması Kontrolü (Linkleme için en az bir firma lazım)
  let companies = await prisma.company.findMany();
  
  if (companies.length === 0) {
    console.log("ℹ️ Firma bulunamadı, bir adet örnek firma oluşturuluyor...");
    const sample = await prisma.company.create({
      data: {
        name: "Örnek Test Firması",
        driveFolderId: "1pMypL9S9O0_test_folder_id",
        createdById: masterUser.id
      }
    });
    companies = [sample];
  }

  // 4. Yetki ve Erişim Atamaları (Linking)
  console.log("🔗 Yetkiler bağlanıyor...");

  // Müşteri 1 -> İlk Firmaya Bağla
  const m1 = usersMap["musteri1@mercan.com"];
  if (m1 && companies[0]) {
    await prisma.userCompanyAccess.upsert({
      where: { userId_companyId: { userId: m1.id, companyId: companies[0].id } },
      create: { userId: m1.id, companyId: companies[0].id },
      update: {}
    });
    console.log(`   [CLIENT] ${m1.email} -> ${companies[0].name} (BAĞLANDI)`);
  }

  // Müşteri 2 -> İkinci Firma (varsa) yoksa İlk Firma
  const m2 = usersMap["musteri2@mercan.com"];
  const targetComp = companies[1] || companies[0];
  if (m2 && targetComp) {
    await prisma.userCompanyAccess.upsert({
      where: { userId_companyId: { userId: m2.id, companyId: targetComp.id } },
      create: { userId: m2.id, companyId: targetComp.id },
      update: {}
    });
    console.log(`   [CLIENT] ${m2.email} -> ${targetComp.name} (BAĞLANDI)`);
  }

  // Uzman 1 -> Tüm Firmalar
  const u1 = usersMap["uzman1@mercan.com"];
  if (u1) {
    for (const comp of companies) {
      await prisma.userCompanyAccess.upsert({
        where: { userId_companyId: { userId: u1.id, companyId: comp.id } },
        create: { userId: u1.id, companyId: comp.id },
        update: {}
      });
    }
    console.log(`   [EXPERT] ${u1.email} -> Tüm firmalara atandı.`);
  }

  console.log("\n🚀 SEED TAMAMLANDI. Test kullanıcıları hazır.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
