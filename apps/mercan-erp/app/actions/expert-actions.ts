"use server";

import { protectedAction } from "@ajans/core/server";

/**
 * Saha uzmanının yetkisi olduğu firmaları getirir.
 */
export async function getExpertCompanies() {
  return protectedAction(async ({ db, user }) => {
    const userData = await db.user.findUnique({
      where: { id: user.id },
      include: {
        companyAccess: {
          include: {
            company: true
          }
        }
      }
    });

    if (!userData) throw new Error("Uzman bulunamadı.");

    const companies = userData.companyAccess.map(access => ({
      id: access.company.id,
      name: access.company.name,
      driveFolderId: access.company.driveFolderId
    }));

    return companies;
  });
}
