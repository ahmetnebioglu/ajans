import { unsecured_prisma as prisma } from "../packages/db/src/client";
import { Role } from "@prisma/client";

async function main() {
  console.log("Seeding customer test data...");

  // 1. Create Test Companies
  const company1 = await prisma.company.upsert({
    where: { driveFolderId: "test-folder-1" },
    update: {},
    create: {
      name: "Mercan Grup Lojistik A.Ş.",
      taxNumber: "1234567890",
      taxOffice: "İkitelli",
      address: "İstanbul",
      phone: "0212 555 00 00",
      driveFolderId: "test-folder-1",
      tenantId: "mercan"
    }
  });

  const company2 = await prisma.company.upsert({
    where: { driveFolderId: "test-folder-2" },
    update: {},
    create: {
      name: "Tekno Lojistik Limited Şirketi",
      taxNumber: "0987654321",
      taxOffice: "Çiğli",
      address: "İzmir",
      phone: "0232 444 00 00",
      driveFolderId: "test-folder-2",
      tenantId: "mercan"
    }
  });

  console.log("Companies created/verified.");

  // 2. Create Customer User
  const customerEmail = "customer@mercan.test";
  const customer = await prisma.user.upsert({
    where: { email: customerEmail },
    update: {
      role: Role.CUSTOMER,
      tenantId: "mercan"
    },
    create: {
      email: customerEmail,
      name: "Müşteri Ahmet",
      role: Role.CUSTOMER,
      tenantId: "mercan",
      emailVerified: new Date()
    }
  });

  console.log(`Customer user created: ${customerEmail}`);

  // 3. Grant Access
  await prisma.companyAccess.upsert({
    where: { userId_companyId: { userId: customer.id, companyId: company1.id } },
    update: {},
    create: { userId: customer.id, companyId: company1.id }
  });

  await prisma.companyAccess.upsert({
    where: { userId_companyId: { userId: customer.id, companyId: company2.id } },
    update: {},
    create: { userId: customer.id, companyId: company2.id }
  });

  console.log("Company access granted.");
  console.log("Done. You can now login with customer@mercan.test (password: test in dev mode).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
