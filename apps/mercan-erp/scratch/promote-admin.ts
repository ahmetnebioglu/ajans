import { PrismaClient } from "@prisma/client";

// Not: Prisma client packages/db içinde generate edildiği için direkt oradan çekmeye çalışıyoruz.
// Eğer bulunamazsa standart PrismaClient deneyeceğiz.
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: "ahmetnebioglu89@gmail.com" }
  });

  if (!user) {
    console.error("HATA: ahmetnebioglu89@gmail.com kullanıcısı bulunamadı. Lütfen önce giriş yapın.");
    return;
  }

  // 1. Kullanıcıyı ADMIN yap
  await prisma.user.update({
    where: { id: user.id },
    data: { role: "ADMIN" }
  });
  console.log(`✅ ${user.email} artık ADMIN oldu.`);

  // 2. Firmaları Admin'e bağla
  const companyUpdate = await prisma.company.updateMany({
    data: { createdById: user.id }
  });
  console.log(`✅ ${companyUpdate.count} adet firma admin üzerine kaydedildi.`);

  // 3. Raporları Admin'e bağla
  const reportUpdate = await prisma.report.updateMany({
    data: { uploadedById: user.id }
  });
  console.log(`✅ ${reportUpdate.count} adet rapor admin üzerine kaydedildi.`);
  
  // 4. Firmalara Erişim Yetkisi Tanı (Many-to-Many)
  const companies = await prisma.company.findMany();
  for (const company of companies) {
    await prisma.userCompanyAccess.upsert({
       where: { userId_companyId: { userId: user.id, companyId: company.id } },
       create: { userId: user.id, companyId: company.id },
       update: {}
    });
  }
  console.log("✅ Admin tüm firmalara atanmış uzman olarak tanımlandı.");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
