import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@ajans/auth";
import { redirect } from "next/navigation";
import HRDashboardClient from "./hr-client-page";

export default async function HRDashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return <HRDashboardClient />;
}
