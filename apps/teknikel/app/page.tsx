import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";
import type { Session } from "next-auth";

export default async function DashboardPage() {
  const session = (await getServerSession(authOptions)) as Session | null;

  if (!session) {
    redirect("/login");
  }

  return <DashboardClient userName={session.user?.name || "Kullanıcı"} />;
}
