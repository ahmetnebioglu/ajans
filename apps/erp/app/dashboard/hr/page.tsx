import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import HRDashboardClient from "./hr-client-page";

export default async function HRDashboardPage() {
  const session = await getServerSession(authOptions);
  
  const allowedRoles = ["ADMIN", "HR_MANAGER"];
  if (!allowedRoles.includes(session?.user?.role || "")) {
    redirect("/dashboard");
  }

  return <HRDashboardClient />;
}
