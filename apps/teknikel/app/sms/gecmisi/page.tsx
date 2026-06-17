import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import SmsGecmisiClient from "./SmsGecmisiClient";

export default async function SmsGecmisiPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return <SmsGecmisiClient />;
}
