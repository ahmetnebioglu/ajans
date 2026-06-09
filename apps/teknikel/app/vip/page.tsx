import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import VipClient from "./VipClient";
import type { Session } from "next-auth";

export default async function VipLeadsPage() {
  const session = (await getServerSession(authOptions)) as Session | null;

  if (!session) {
    redirect("/login");
  }

  return <VipClient />;
}
