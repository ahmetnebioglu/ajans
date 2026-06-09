import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { getBilsoftFaturaById } from "@/src/services/bilsoft";
import { FaturaDetailContent } from "./FaturaDetailClient";

const formatCurrency = (amount: number | null | undefined) => {
  if (amount == null) return "-";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

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

  // Fatura kalemleri tablosu için kolonlar
  const kalemColumns = [
    {
      title: "Sıra",
      dataIndex: "sira",
      key: "sira",
      width: 60,
      render: (val: any, _: any, idx: number) => val ?? idx + 1,
    },
    {
      title: "Stok Kodu",
      dataIndex: "stokKodu",
      key: "stokKodu",
      render: (val: string) => (
        <span className="font-mono text-xs font-semibold text-slate-600">
          {val || "-"}
        </span>
      ),
    },
    {
      title: "Ürün Adı",
      dataIndex: "stokAdi",
      key: "stokAdi",
      render: (val: string, record: any) => val || record.aciklama || "-",
    },
    {
      title: "Miktar",
      dataIndex: "miktar",
      key: "miktar",
      align: "right" as const,
      render: (val: number) =>
        val != null
          ? new Intl.NumberFormat("tr-TR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(val)
          : "-",
    },
    {
      title: "Birim",
      dataIndex: "birim",
      key: "birim",
      render: (val: string) => val || "-",
    },
    {
      title: "Birim Fiyat",
      dataIndex: "birimFiyat",
      key: "birimFiyat",
      align: "right" as const,
      render: (val: number) => formatCurrency(val),
    },
    {
      title: "İskonto %",
      dataIndex: "iskontoOran",
      key: "iskontoOran",
      align: "right" as const,
      render: (val: number, record: any) => {
        const oran = val ?? record.iskonto;
        return oran != null ? `%${oran}` : "-";
      },
    },
    {
      title: "KDV %",
      dataIndex: "kdvOran",
      key: "kdvOran",
      align: "right" as const,
      render: (val: number) => (val != null ? `%${val}` : "-"),
    },
    {
      title: "Tutar",
      dataIndex: "tutar",
      key: "tutar",
      align: "right" as const,
      render: (val: number, record: any) => (
        <span className="font-semibold">
          {formatCurrency(
            val ?? (record.miktar || 0) * (record.birimFiyat || 0)
          )}
        </span>
      ),
    },
  ];

  return (
    <FaturaDetailContent
      safeFatura={safeFatura}
      isEFatura={isEFatura}
      kalemColumns={kalemColumns}
    />
  );
}
