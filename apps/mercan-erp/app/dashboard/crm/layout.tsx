import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@ajans/auth";
import { redirect } from "next/navigation";

export default async function CRMLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  
  const allowedRoles = ["ADMIN", "EXPERT"];
  if (!allowedRoles.includes(session?.user?.role || "")) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
