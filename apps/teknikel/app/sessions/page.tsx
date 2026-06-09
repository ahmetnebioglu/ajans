import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import SessionsClient from "./SessionsClient";
import type { Session } from "next-auth";

export default async function SessionsPage() {
  const session = (await getServerSession(authOptions)) as Session | null;

  if (!session) {
    redirect("/login");
  }

  return <SessionsClient />;
}
