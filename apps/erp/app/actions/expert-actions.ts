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
        workspaceUsers: {
          include: {
            workspace: true
          }
        }
      }
    });

    if (!userData) throw new Error("Uzman bulunamadı.");

    const companies = userData.workspaceUsers.map(access => ({
      id: access.workspace.id,
      name: access.workspace.name,
    }));

    return companies;
  });
}
