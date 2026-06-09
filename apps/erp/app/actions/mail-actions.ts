"use server";

// import { resetUserPassword, suspendAccount } from "@ajans/google-api";

export async function handleResetPassword(email: string) {
  console.log(`Resetting password for: ${email}`);
  // Google Admin SDK call will go here
  return { success: true, message: "Şifre sıfırlama bağlantısı gönderildi." };
}

export async function handleToggleAccount(email: string, active: boolean) {
  console.log(`${active ? "Activating" : "Suspending"} account: ${email}`);
  // Google Admin SDK call will go here
  return { success: true };
}
