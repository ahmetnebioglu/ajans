
import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@ajans/auth";
import { redirect } from "next/navigation";
import DashboardClientLayout from "./dashboard-client-layout";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/login");
  }

  const user = session.user as any;
  if (user.tenantId !== "mercan") {
    redirect("/login?error=TenantMismatch");
  }

  // RBAC Check: Only ADMIN can access /dashboard and its sub-routes
  if (user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}
