
import { unsecured_prisma as prisma } from "@ajans/db";

async function checkUser() {
  const user = await prisma.user.findUnique({
    where: { email: "admin@mercan.com" }
  });
  console.log("User:", JSON.stringify(user, null, 2));
  process.exit(0);
}

checkUser();
