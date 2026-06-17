import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import SmsClient from "./SmsClient";

export default async function SmsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return <SmsClient />;
}
