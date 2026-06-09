import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import NotificationsClient from "./NotificationsClient";
import type { Session } from "next-auth";

export default async function NotificationsPage() {
  const session = (await getServerSession(authOptions)) as Session | null;

  if (!session) {
    redirect("/login");
  }

  return <NotificationsClient />;
}
