import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import SettingsClient from "./settings-client";
import type { Session } from "next-auth";

export default async function SettingsPage() {
  const session = (await getServerSession(authOptions)) as Session | null;

  if (!session) {
    redirect("/login");
  }

  return <SettingsClient />;
}
