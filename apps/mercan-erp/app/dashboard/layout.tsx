
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

  // Redirect CUSTOMER users to their dedicated portal
  if (user.role === "CUSTOMER") {
    redirect("/customer-portal");
  }

  // RBAC Check: Ensure only authorized roles access the admin dashboard
  const allowedRoles = ["ADMIN", "EXPERT", "HR_MANAGER"];
  if (!allowedRoles.includes(user.role)) {
    redirect("/unauthorized");
  }

  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}
