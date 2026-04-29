import { getServerSession } from "next-auth";
import { authOptions } from "@ajans/auth/options";
import { redirect } from "next/navigation";
import SettingsClient from "./settings-client";

export const metadata = {
  title: "Sistem Ayarları | Teknikel CRM",
};

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return <SettingsClient />;
}
