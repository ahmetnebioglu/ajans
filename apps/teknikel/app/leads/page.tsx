import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import LeadsClient from "./LeadsClient";
import type { Session } from "next-auth";

export default async function LeadsPage() {
  const session = (await getServerSession(authOptions)) as Session | null;

  if (!session) {
    redirect("/login");
  }

  return <LeadsClient />;
}
