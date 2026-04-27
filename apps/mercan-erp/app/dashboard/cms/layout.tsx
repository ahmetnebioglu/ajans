import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@ajans/auth";
import { redirect } from "next/navigation";

export default async function CMSLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
