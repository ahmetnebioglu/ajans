import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import SmsGonderClient from "./SmsGonderClient";

export default async function SmsGonderPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return <SmsGonderClient />;
}
