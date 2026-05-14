import { unsecured_prisma as prisma } from "../packages/db/src/client";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Teknikel admin test kullanıcısı oluşturuluyor...");

  const email = "admin@teknikel.com";
  const password = "Test1234!";
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: "ADMIN",
      tenantId: "teknikel",
      password: hashedPassword
    },
    create: {
      email,
      name: "Admin Teknikel",
      role: "ADMIN" as any,
      tenantId: "teknikel",
      password: hashedPassword,
      emailVerified: new Date()
    }
  });

  console.log(`✓ Admin kullanıcı oluşturuldu/güncellendi:`);
  console.log(`  E-posta: ${user.email}`);
  console.log(`  Ad: ${user.name}`);
  console.log(`  Rol: ${user.role}`);
  console.log(`  Tenant: ${user.tenantId}`);
  console.log(`\n✓ Giriş bilgileri:`);
  console.log(`  E-posta: ${email}`);
  console.log(`  Şifre: ${password}`);
}

main()
  .catch((e) => {
    console.error("Hata:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
