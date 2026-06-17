import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { getBilsoftFaturaById } from "@/src/services/bilsoft";
import { FaturaDetailContent } from "./FaturaDetailClient";

export default async function FaturaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const fatura = await getBilsoftFaturaById(id);

  if (!fatura) {
    notFound();
  }

  // Veriyi sterilize et
  const safeFatura = JSON.parse(JSON.stringify(fatura));

  const isEFatura = safeFatura.eFaturaNo && safeFatura.eFaturaNo.trim() !== "";

  return (
    <FaturaDetailContent
      safeFatura={safeFatura}
      isEFatura={isEFatura}
    />
  );
}
