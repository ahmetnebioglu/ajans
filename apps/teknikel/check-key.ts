import { unsecured_prisma as db } from '@ajans/db';

async function main() {
  const settings = await db.siteSettings.findFirst({
    where: { tenantId: 'mercan' },
    select: { googlePlacesApiKey: true }
  });
  console.log('KEY IN DB:', settings?.googlePlacesApiKey);
}
main().catch(console.error).finally(() => db.$disconnect());
