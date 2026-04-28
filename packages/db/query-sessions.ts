import { unsecured_prisma as prisma } from "./src";

async function main() {
  const sessions = await prisma.session.findMany({
    include: { user: true }
  });
  console.log("SESSIONS IN DB:", JSON.stringify(sessions, null, 2));
}

main().catch(console.error);
