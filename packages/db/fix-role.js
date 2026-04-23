const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = "ahmetnebioglu89@gmail.com";
  const user = await prisma.user.upsert({
    where: { email: email },
    update: { role: 'ADMIN' },
    create: {
      email: email,
      name: 'Ahmet Nebioğlu',
      role: 'ADMIN'
    }
  });
  console.log("Kullanıcı başarıyla ADMIN olarak ayarlandı:", user);
}

main().catch(console.error).finally(() => prisma.$disconnect());
