import { unsecured_prisma as prisma } from "../packages/db/src/client";

async function main() {
  console.log('Counting candidates needing opt-in...');
  const needOptIn = await prisma.candidate.count({
    where: {
      OR: [
        { communicationOptIn: false },
        { communicationOptIn: null as any }
      ]
    }
  });

  console.log(`Candidates to update: ${needOptIn}`);

  if (needOptIn === 0) {
    console.log('No candidates require update.');
    return;
  }

  const res = await prisma.candidate.updateMany({
    where: {
      OR: [
        { communicationOptIn: false },
        { communicationOptIn: null as any }
      ]
    },
    data: {
      communicationOptIn: true
    }
  });

  console.log(`Updated ${res.count} candidates to communicationOptIn = true`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
