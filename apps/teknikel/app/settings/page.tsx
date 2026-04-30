import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import SettingsClient from "./settings-client";

export const metadata = {
  title: "Sistem Ayarları | Teknikel CRM",
};

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    console.log("Eksik Session Tespit Edildi:", session);
    redirect("/login");
  }

  return <SettingsClient />;
}
