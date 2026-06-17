"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Divider,
  Row,
  Col,
  Flex,
  Table,
  Badge,
  Popconfirm,
  message,
  Spin,
} from "antd";
import {
  ArrowLeftOutlined,
  FileTextOutlined,
  UserOutlined,
  BankOutlined,
  HomeOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import Link from "next/link";

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

const getFaturaTuruColor = (tur: string | undefined) => {
  if (!tur) return "default";
  const t = tur.toUpperCase();
  if (t.includes("SATIŞ")) return "green";
  if (t.includes("ALIM") || t.includes("ALIŞ")) return "blue";
  if (t.includes("İADE") || t.includes("IADE")) return "orange";
  return "default";
};

const formatCurrencyInner = (amount: number | null | undefined) => {
  if (amount == null) return "-";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(amount);
};

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
    render: (val: number) => formatCurrencyInner(val),
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
        {formatCurrencyInner(
          val ?? (record.miktar || 0) * (record.birimFiyat || 0)
        )}
      </span>
    ),
  },
];

export function FaturaDetailContent({
  safeFatura,
  isEFatura,
}: {
  safeFatura: any;
  isEFatura: boolean;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteInvoice = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch("/api/bilsoft/invoice/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceId: safeFatura.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        message.error(result.message || "Fatura silinemedi");
        return;
      }

      message.success("Fatura başarıyla silindi");
      setTimeout(() => {
        router.push("/faturalar");
      }, 1000);
    } catch (error) {
      console.error("Silme hatası:", error);
      message.error("Fatura silinirken hata oluştu");
    } finally {
      setIsDeleting(false);
    }
  };

  const canDelete = !isEFatura;

  return (
    <Spin spinning={isDeleting} tip="Fatura siliniyor...">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Başlık */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/faturalar">
              <Button icon={<ArrowLeftOutlined />} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-0">
                {safeFatura.unvan || "İsimsiz Fatura"}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-slate-400 text-sm">
                  Fiş No: {safeFatura.fisno || "-"}
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-400 text-sm">
                  {formatDate(safeFatura.fatTarih)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isEFatura && (
              <Tag
                icon={<CheckCircleOutlined />}
                color="success"
                className="font-bold"
              >
                E-Fatura
              </Tag>
            )}
            {safeFatura.faturaTuru && (
              <Tag
                color={getFaturaTuruColor(safeFatura.faturaTuru)}
                className="font-bold"
              >
                {safeFatura.faturaTuru}
              </Tag>
            )}
            {canDelete && (
              <Popconfirm
                title="Faturayı Sil"
                description="Bu faturayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
                onConfirm={handleDeleteInvoice}
                okText="Evet, Sil"
                cancelText="İptal"
                okButtonProps={{ danger: true }}
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  loading={isDeleting}
                >
                  Faturayı Sil
                </Button>
              </Popconfirm>
            )}
          </div>
        </div>

        {/* Özet Kart */}
        <div
          className="rounded-xl p-6 mb-6 text-white"
          style={{
            background: "linear-gradient(135deg, #667eeadd 0%, #764ba2 100%)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <FileTextOutlined style={{ fontSize: 40 }} />
              <div>
                <div className="text-xl font-bold">{safeFatura.unvan}</div>
                <div className="text-sm opacity-80">
                  Fiş No: {safeFatura.fisno} | {formatDate(safeFatura.fatTarih)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black">
                {formatCurrency(safeFatura.gtoplam || safeFatura.toplam)}
              </div>
              <div className="text-sm opacity-80">Genel Toplam</div>
            </div>
          </div>
        </div>

        <Row gutter={[24, 24]}>
          {/* Sol Kolon */}
          <Col xs={24} lg={16}>
            <Flex vertical gap={24}>
              {/* Fatura Bilgileri */}
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <FileTextOutlined /> Fatura Bilgileri
                  </div>
                }
                className="shadow-sm"
              >
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="Fiş No">
                    {safeFatura.fisno || "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Fatura Tarihi">
                    {formatDate(safeFatura.fatTarih)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Fatura Türü">
                    {safeFatura.faturaTuru ? (
                      <Tag color={getFaturaTuruColor(safeFatura.faturaTuru)}>
                        {safeFatura.faturaTuru}
                      </Tag>
                    ) : (
                      "-"
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ödeme Şekli">
                    {safeFatura.odemeSekli || "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Şube">
                    {safeFatura.subeAdi || "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Kullanıcı">
                    {safeFatura.kullaniciAdi || "-"}
                  </Descriptions.Item>
                  {safeFatura.aciklama && (
                    <Descriptions.Item label="Açıklama" span={2}>
                      {safeFatura.aciklama}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>

              {/* Cari Bilgileri */}
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <UserOutlined /> Cari Bilgileri
                  </div>
                }
                className="shadow-sm"
              >
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="Ünvan" span={2}>
                    {safeFatura.unvan || "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Cari Kodu">
                    {safeFatura.cariKod || "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Cari Grup">
                    {safeFatura.cariGrup || "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Vergi Dairesi">
                    {safeFatura.vd || "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Vergi No">
                    {safeFatura.vn || "-"}
                  </Descriptions.Item>
                  {safeFatura.tel && (
                    <Descriptions.Item label="Telefon">
                      {safeFatura.tel}
                    </Descriptions.Item>
                  )}
                  {safeFatura.cep && (
                    <Descriptions.Item label="Cep">
                      {safeFatura.cep}
                    </Descriptions.Item>
                  )}
                  {safeFatura.cariMail && (
                    <Descriptions.Item label="E-posta" span={2}>
                      {safeFatura.cariMail}
                    </Descriptions.Item>
                  )}
                </Descriptions>
                {safeFatura.cariId && (
                  <div className="mt-3">
                    <Link href={`/cariler/${safeFatura.cariId}`}>
                      <Button size="small" type="dashed">
                        Cari Detayına Git →
                      </Button>
                    </Link>
                  </div>
                )}
              </Card>

              {/* Adres Bilgileri */}
              {(safeFatura.adres || safeFatura.il || safeFatura.ilce) && (
                <Card
                  title={
                    <div className="flex items-center gap-2">
                      <HomeOutlined /> Adres Bilgileri
                    </div>
                  }
                  className="shadow-sm"
                >
                  <Descriptions column={2} bordered size="small">
                    {safeFatura.adres && (
                      <Descriptions.Item label="Adres" span={2}>
                        {safeFatura.adres}
                      </Descriptions.Item>
                    )}
                    {safeFatura.il && (
                      <Descriptions.Item label="İl">
                        {safeFatura.il}
                      </Descriptions.Item>
                    )}
                    {safeFatura.ilce && (
                      <Descriptions.Item label="İlçe">
                        {safeFatura.ilce}
                      </Descriptions.Item>
                    )}
                    {safeFatura.sevkAdresi && (
                      <Descriptions.Item label="Sevk Adresi" span={2}>
                        {safeFatura.sevkAdresi}
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>
              )}

              {/* E-Fatura Bilgileri */}
              {isEFatura && (
                <Card
                  title={
                    <div className="flex items-center gap-2">
                      <CheckCircleOutlined className="text-emerald-500" /> E-Fatura
                      Bilgileri
                    </div>
                  }
                  className="shadow-sm border-emerald-100"
                >
                  <Descriptions column={2} bordered size="small">
                    <Descriptions.Item label="E-Fatura No" span={2}>
                      <span className="font-mono text-xs">
                        {safeFatura.eFaturaNo}
                      </span>
                    </Descriptions.Item>
                    {safeFatura.eFaturaSenaryo && (
                      <Descriptions.Item label="Senaryo">
                        {safeFatura.eFaturaSenaryo}
                      </Descriptions.Item>
                    )}
                    {safeFatura.eFaturaTipi && (
                      <Descriptions.Item label="Tipi">
                        {safeFatura.eFaturaTipi}
                      </Descriptions.Item>
                    )}
                    {safeFatura.eFaturaDurum && (
                      <Descriptions.Item label="Durum">
                        <Badge
                          status="success"
                          text={safeFatura.eFaturaDurum}
                        />
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>
              )}

              {/* Fatura Kalemleri */}
              {safeFatura.fatIsl && safeFatura.fatIsl.length > 0 && (
                <Card
                  title={
                    <div className="flex items-center gap-2">
                      <FileTextOutlined /> Fatura Kalemleri (
                      {safeFatura.fatIsl.length} Adet)
                    </div>
                  }
                  className="shadow-sm"
                >
                  <Table
                    columns={kalemColumns}
                    dataSource={safeFatura.fatIsl}
                    rowKey={(r: any, i: any) => r.id ?? i}
                    size="small"
                    pagination={false}
                    summary={() => (
                      <Table.Summary fixed>
                        <Table.Summary.Row className="bg-slate-50">
                          <Table.Summary.Cell index={0} colSpan={8} align="right">
                            <span className="font-semibold">Ara Toplam:</span>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={1} align="right">
                            <span className="font-semibold">
                              {formatCurrency(safeFatura.toplam)}
                            </span>
                          </Table.Summary.Cell>
                        </Table.Summary.Row>
                        <Table.Summary.Row className="bg-slate-50">
                          <Table.Summary.Cell index={0} colSpan={8} align="right">
                            <span className="font-semibold">KDV:</span>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={1} align="right">
                            <span className="font-semibold">
                              {formatCurrency(safeFatura.kdv)}
                            </span>
                          </Table.Summary.Cell>
                        </Table.Summary.Row>
                        <Table.Summary.Row className="bg-blue-50">
                          <Table.Summary.Cell index={0} colSpan={8} align="right">
                            <span className="font-bold text-base text-blue-700">
                              Genel Toplam:
                            </span>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={1} align="right">
                            <span className="font-bold text-base text-blue-700">
                              {formatCurrency(safeFatura.gtoplam)}
                            </span>
                          </Table.Summary.Cell>
                        </Table.Summary.Row>
                      </Table.Summary>
                    )}
                  />
                </Card>
              )}
            </Flex>
          </Col>

          {/* Sağ Kolon – Finansal Özet */}
          <Col xs={24} lg={8}>
            <div className="sticky top-24">
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <DollarOutlined /> Finansal Özet
                  </div>
                }
                className="shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500 text-sm">Tutar (KDV Hariç)</span>
                    <span className="font-semibold text-slate-700">
                      {formatCurrency(safeFatura.toplam)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500 text-sm">KDV</span>
                    <span className="font-semibold text-slate-700">
                      {formatCurrency(safeFatura.kdv)}
                    </span>
                  </div>
                  {safeFatura.iskonto > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-500 text-sm">İskonto</span>
                      <span className="font-semibold text-orange-500">
                        -{formatCurrency(safeFatura.iskonto)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-3 bg-slate-50 rounded-lg px-3">
                    <span className="font-bold text-slate-700">Genel Toplam</span>
                    <span className="font-black text-xl text-slate-800">
                      {formatCurrency(safeFatura.gtoplam)}
                    </span>
                  </div>
                  <Divider className="my-2" />
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500 text-sm">Ödenen</span>
                    <span className="font-semibold text-emerald-600">
                      {formatCurrency(safeFatura.odenen)}
                    </span>
                  </div>
                  {safeFatura.alinan != null && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-500 text-sm">Alınan</span>
                      <span className="font-semibold text-slate-700">
                        {formatCurrency(safeFatura.alinan)}
                      </span>
                    </div>
                  )}
                  {safeFatura.maliyet != null && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-500 text-sm">Maliyet</span>
                      <span className="font-semibold text-slate-700">
                        {formatCurrency(safeFatura.maliyet)}
                      </span>
                    </div>
                  )}
                </div>

                {safeFatura.yazi && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-400 mb-1">Yazı ile:</div>
                    <div className="text-sm font-medium text-slate-600 italic">
                      {safeFatura.yazi}
                    </div>
                  </div>
                )}
              </Card>

              {/* Diğer Bilgiler */}
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <BankOutlined /> Diğer Bilgiler
                  </div>
                }
                className="shadow-sm mt-6"
              >
                <Descriptions column={1} size="small">
                  {safeFatura.siparisNo && (
                    <Descriptions.Item label="Sipariş No">
                      {safeFatura.siparisNo}
                    </Descriptions.Item>
                  )}
                  {safeFatura.irsaliyeNo && (
                    <Descriptions.Item label="İrsaliye No">
                      {safeFatura.irsaliyeNo}
                    </Descriptions.Item>
                  )}
                  {safeFatura.evrakNo && (
                    <Descriptions.Item label="Evrak No">
                      {safeFatura.evrakNo}
                    </Descriptions.Item>
                  )}
                  {safeFatura.dokumanNo && (
                    <Descriptions.Item label="Doküman No">
                      {safeFatura.dokumanNo}
                    </Descriptions.Item>
                  )}
                  {safeFatura.ticaretsicilno && (
                    <Descriptions.Item label="Ticaret Sicil No">
                      {safeFatura.ticaretsicilno}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </Spin>
  );
}
