import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { getBilsoftStokById } from "@/src/services/bilsoft";
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Divider,
  Row,
  Col,
  Flex,
  Badge,
} from "antd";
import {
  ArrowLeftOutlined,
  BarcodeOutlined,
  ShoppingOutlined,
  DollarOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
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

const parseNumber = (v: any): number => {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return isNaN(v) ? 0 : v;
  try {
    const cleaned = String(v).replace(/\./g, "").replace(",", ".");
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  } catch {
    return 0;
  }
};

const getStockStatus = (bakiye: number) => {
  if (bakiye <= 0)
    return { color: "error" as const, label: "Tükendi", tagColor: "red" };
  if (bakiye <= 5)
    return { color: "warning" as const, label: "Kritik Stok", tagColor: "orange" };
  return { color: "success" as const, label: "Stokta", tagColor: "green" };
};

export default async function StokDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // URL encode edilmiş stok kodunu decode et
  const kod = decodeURIComponent(id);
  const stok = await getBilsoftStokById(kod);

  if (!stok) {
    notFound();
  }

  // Veriyi sterilize et
  const safeStok = JSON.parse(JSON.stringify(stok));

  const bakiye = parseNumber(safeStok.bakiye);
  const stockStatus = getStockStatus(bakiye);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Başlık */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/stoklar">
            <Button icon={<ArrowLeftOutlined />} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-0">
              {safeStok.ad || "İsimsiz Stok Kartı"}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="font-mono text-sm text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                {safeStok.kod}
              </span>
              {safeStok.stokMarka && (
                <span className="text-slate-400 text-sm">{safeStok.stokMarka}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Tag color={stockStatus.tagColor} className="font-bold text-sm px-3 py-1">
            {stockStatus.label}: {bakiye} {safeStok.birim || "Adet"}
          </Tag>
          {safeStok.grup && (
            <Tag color="blue" className="font-bold uppercase">
              {safeStok.grup}
            </Tag>
          )}
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {/* Sol Kolon */}
        <Col xs={24} lg={16}>
          <Flex vertical gap={24}>
            {/* Genel Bilgiler */}
            <Card
              title={
                <div className="flex items-center gap-2">
                  <InfoCircleOutlined /> Genel Bilgiler
                </div>
              }
              className="shadow-sm"
            >
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="Stok Kodu">
                  <span className="font-mono font-semibold">{safeStok.kod}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Stok Adı">
                  {safeStok.ad || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Barkod">
                  {safeStok.barkod ? (
                    <div className="flex items-center gap-1">
                      <BarcodeOutlined />
                      <span className="font-mono">{safeStok.barkod}</span>
                    </div>
                  ) : (
                    "-"
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Birim">
                  {safeStok.birim || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Grup">
                  {safeStok.grup ? (
                    <Tag color="blue">{safeStok.grup}</Tag>
                  ) : (
                    "-"
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Marka">
                  {safeStok.stokMarka || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Şube">
                  {safeStok.subeAdi || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Kullanıcı">
                  {safeStok.kullaniciAdi || "-"}
                </Descriptions.Item>
                {safeStok.stokRafi && (
                  <Descriptions.Item label="Raf">
                    {safeStok.stokRafi}
                  </Descriptions.Item>
                )}
                {safeStok.aliciUrunKodu && (
                  <Descriptions.Item label="Alıcı Ürün Kodu">
                    {safeStok.aliciUrunKodu}
                  </Descriptions.Item>
                )}
                {safeStok.saticiUrunKodu && (
                  <Descriptions.Item label="Satıcı Ürün Kodu">
                    {safeStok.saticiUrunKodu}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            {/* Fiyat Bilgileri */}
            <Card
              title={
                <div className="flex items-center gap-2">
                  <DollarOutlined /> Fiyat Bilgileri
                </div>
              }
              className="shadow-sm"
            >
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="Alış Fiyatı">
                  <span className="font-bold text-emerald-600">
                    {formatCurrency(safeStok.aFiyat)}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Satış Fiyatı">
                  <span className="font-bold text-rose-600">
                    {formatCurrency(safeStok.sFiyat)}
                  </span>
                </Descriptions.Item>
                {safeStok.stokOzelKod1 && (
                  <Descriptions.Item label="Perakende Satış Fiyatı">
                    <span className="font-bold text-blue-600">
                      {formatCurrency(parseFloat(safeStok.stokOzelKod1))}
                    </span>
                  </Descriptions.Item>
                )}
                {safeStok.kdvOran != null && (
                  <Descriptions.Item label="KDV Oranı">
                    <Tag color="geekblue">%{safeStok.kdvOran}</Tag>
                  </Descriptions.Item>
                )}
                {safeStok.kdvDahil && (
                  <Descriptions.Item label="KDV Durumu">
                    {safeStok.kdvDahil}
                  </Descriptions.Item>
                )}
                {safeStok.otvOran && safeStok.otvOran !== "-" && safeStok.otvOran !== "0" && (
                  <Descriptions.Item label="ÖTV Oranı">
                    <Tag color="purple">%{safeStok.otvOran}</Tag>
                  </Descriptions.Item>
                )}
                {safeStok.oivOran && safeStok.oivOran !== "0" && (
                  <Descriptions.Item label="ÖİV Oranı">
                    <Tag color="magenta">%{safeStok.oivOran}</Tag>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            {/* Özel Kodlar */}
            {(safeStok.stokOzelKod2 || safeStok.stokOzelKod3 || safeStok.stokOzelKod4) && (
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <InfoCircleOutlined /> Özel Kodlar
                  </div>
                }
                className="shadow-sm"
              >
                <Descriptions column={2} bordered size="small">
                  {safeStok.stokOzelKod2 && (
                    <Descriptions.Item label="Özel Kod 2">
                      {safeStok.stokOzelKod2}
                    </Descriptions.Item>
                  )}
                  {safeStok.stokOzelKod3 && (
                    <Descriptions.Item label="Özel Kod 3">
                      {safeStok.stokOzelKod3}
                    </Descriptions.Item>
                  )}
                  {safeStok.stokOzelKod4 && (
                    <Descriptions.Item label="Özel Kod 4">
                      {safeStok.stokOzelKod4}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            )}
          </Flex>
        </Col>

        {/* Sağ Kolon */}
        <Col xs={24} lg={8}>
          <div className="sticky top-24">
            {/* Stok Durumu */}
            <Card
              title={
                <div className="flex items-center gap-2">
                  <ShoppingOutlined /> Stok Durumu
                </div>
              }
              className="shadow-sm mb-6"
            >
              <div className="text-center py-4">
                <div className="text-slate-400 text-xs uppercase font-bold mb-2">
                  Mevcut Stok
                </div>
                <div
                  className={`text-4xl font-black mb-1 ${
                    stockStatus.color === "error"
                      ? "text-rose-500"
                      : stockStatus.color === "warning"
                      ? "text-amber-500"
                      : "text-emerald-500"
                  }`}
                >
                  {bakiye}
                </div>
                <div className="text-slate-400 text-sm mb-3">
                  {safeStok.birim || "Adet"}
                </div>
                <Tag
                  color={stockStatus.tagColor}
                  className="font-bold text-sm px-4 py-1"
                >
                  {stockStatus.label}
                </Tag>
              </div>

              {(safeStok.giris != null || safeStok.cikis != null) && (
                <>
                  <Divider className="my-3" />
                  <Descriptions column={1} size="small">
                    {safeStok.giris != null && (
                      <Descriptions.Item label="Toplam Giriş">
                        <span className="text-emerald-600 font-semibold">
                          +{parseNumber(safeStok.giris)}
                        </span>
                      </Descriptions.Item>
                    )}
                    {safeStok.cikis != null && (
                      <Descriptions.Item label="Toplam Çıkış">
                        <span className="text-rose-500 font-semibold">
                          -{parseNumber(safeStok.cikis)}
                        </span>
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </>
              )}
            </Card>

            {/* Fiyat Özeti */}
            <Card
              title={
                <div className="flex items-center gap-2">
                  <DollarOutlined /> Fiyat Özeti
                </div>
              }
              className="shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 text-sm">Alış Fiyatı</span>
                  <span className="font-bold text-emerald-600">
                    {formatCurrency(safeStok.aFiyat)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 text-sm">Satış Fiyatı</span>
                  <span className="font-bold text-rose-600">
                    {formatCurrency(safeStok.sFiyat)}
                  </span>
                </div>
                {safeStok.stokOzelKod1 && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500 text-sm">Perakende Fiyatı</span>
                    <span className="font-bold text-blue-600">
                      {formatCurrency(parseFloat(safeStok.stokOzelKod1))}
                    </span>
                  </div>
                )}
                {safeStok.kdvOran != null && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-500 text-sm">KDV Oranı</span>
                    <Tag color="geekblue">%{safeStok.kdvOran}</Tag>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
}
