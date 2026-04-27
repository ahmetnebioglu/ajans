import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@ajans/auth";
import { redirect } from "next/navigation";

export default async function HRLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  
  const allowedRoles = ["ADMIN", "HR_MANAGER"];
  if (!allowedRoles.includes(session?.user?.role || "")) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
