import { unsecured_prisma as prisma } from "../packages/db/src/client";

async function main() {
  const c = await prisma.candidate.create({
    data: {
      firstName: "Test",
      lastName: "Candidate",
      email: `test.candidate.${Date.now()}@example.com`,
      phone: "05001234567",
      cvUrl: null,
      status: "NEW",
      communicationOptIn: true,
      appliedForId: (await prisma.jobPosting.findFirst({ where: { tenantId: 'mercan' } }))?.id || (await prisma.jobPosting.create({ data: { title: 'Test Job', description: 'Auto-created', status: 'ACTIVE', tenantId: 'mercan' } })).id,
      tenantId: "mercan",
    },
  });

  console.log("Created candidate:", c);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
