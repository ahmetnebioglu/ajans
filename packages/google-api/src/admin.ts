import { google } from "googleapis";
import { getGoogleAuth } from "./index";

export async function resetUserPassword(userEmail: string, newPassword: string) {
  const auth = await getGoogleAuth();
  // Admin SDK uses subject for impersonation in some cases, service accounts need wide-domain delegation
  const admin = google.admin({ version: "directory_v1", auth });

  await admin.users.update({
    userKey: userEmail,
    requestBody: {
      password: newPassword,
    },
  });

  return { success: true };
}

export async function suspendAccount(userEmail: string, suspended: boolean) {
  const auth = await getGoogleAuth();
  const admin = google.admin({ version: "directory_v1", auth });

  await admin.users.update({
    userKey: userEmail,
    requestBody: {
      suspended: suspended,
    },
  });

  return { success: true };
}
