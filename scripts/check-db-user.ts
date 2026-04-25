
import { unsecured_prisma as prisma } from "../packages/db/src/client";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("E-posta belirtilmedi.");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log("Kullanıcı bulunamadı.");
  } else {
    console.log(JSON.stringify(user, null, 2));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
