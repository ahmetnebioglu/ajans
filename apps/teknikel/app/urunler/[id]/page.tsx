import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { getIdeasoftProductById } from "@/src/services/ideasoft";
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Divider,
  Row,
  Col,
  Flex,
  Tabs,
} from "antd";
import {
  ArrowLeftOutlined,
  DollarOutlined,
  BarcodeOutlined,
  InfoCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import ProductImageGallery from "./ProductImageGallery";


const formatPrice = (price: number | null | undefined) => {
  if (price == null) return "-";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(price);
};

const getStockStatus = (stock: number) => {
  if (stock <= 0) return { color: "error", label: "Tükendi" };
  if (stock <= 5) return { color: "warning", label: "Kritik Stok" };
  return { color: "success", label: "Stokta" };
};

export default async function UrunDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const product = await getIdeasoftProductById(Number(id));

  if (!product) {
    notFound();
  }

  // Veriyi sterilize et
  const safeProduct = JSON.parse(JSON.stringify(product));
  const stockStatus = getStockStatus(safeProduct.stockAmount);
  const defaultImage = "/default.webp";

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Başlık */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/urunler">
            <Button icon={<ArrowLeftOutlined />} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-0">
              {safeProduct.name}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-slate-400 text-sm font-mono">
                {safeProduct.sku}
              </span>
              {safeProduct.brand && (
                <>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-400 text-sm">
                    {safeProduct.brand.name}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/urunler/${id}/edit`}>
            <Button type="primary" icon={<EditOutlined />}>Düzenle</Button>
          </Link>
          <Tag color={stockStatus.color} className="font-bold text-sm px-3 py-1">
            {stockStatus.label}: {safeProduct.stockAmount}{" "}
            {safeProduct.stockTypeLabel || "Adet"}
          </Tag>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {/* Sol Kolon - Görsel */}
        <Col xs={24} lg={10}>
          <Card className="shadow-sm border-slate-100 dark:border-slate-800">
            <ProductImageGallery
              images={safeProduct.images}
              productName={safeProduct.name}
              defaultImage={defaultImage}
            />
          </Card>
        </Col>

        {/* Sağ Kolon - Bilgiler */}
        <Col xs={24} lg={14}>
          <Flex vertical gap={24}>
            {/* Fiyat Bilgileri */}
            <Card
              title={
                <div className="flex items-center gap-2">
                  <DollarOutlined /> Fiyat Bilgileri
                </div>
              }
              className="shadow-sm border-slate-100 dark:border-slate-800"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600 dark:text-slate-300">
                    Fiyat 1
                  </span>
                  <span className="font-bold text-lg text-primary">
                    {formatPrice(safeProduct.price1)}
                  </span>
                </div>
                {safeProduct.price2 && safeProduct.price2 !== safeProduct.price1 && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600 dark:text-slate-300">
                      Fiyat 2
                    </span>
                    <span className="font-bold text-primary">
                      {formatPrice(safeProduct.price2)}
                    </span>
                  </div>
                )}
                {safeProduct.price3 &&
                  safeProduct.price3 !== safeProduct.price1 &&
                  safeProduct.price3 !== safeProduct.price2 && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600 dark:text-slate-300">
                        Fiyat 3
                      </span>
                      <span className="font-bold text-primary">
                        {formatPrice(safeProduct.price3)}
                      </span>
                    </div>
                  )}
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-600 dark:text-slate-300">
                    KDV Oranı
                  </span>
                  <Tag color="geekblue">%{safeProduct.tax}</Tag>
                </div>
              </div>
            </Card>

            {/* Genel Bilgiler */}
            <Card
              title={
                <div className="flex items-center gap-2">
                  <InfoCircleOutlined /> Genel Bilgiler
                </div>
              }
              className="shadow-sm border-slate-100 dark:border-slate-800"
            >
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="Ürün Kodu">
                  <span className="font-mono font-semibold">{safeProduct.sku}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Barkod">
                  {safeProduct.barcode ? (
                    <div className="flex items-center gap-1">
                      <BarcodeOutlined />
                      <span className="font-mono">{safeProduct.barcode}</span>
                    </div>
                  ) : (
                    "-"
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Marka">
                  {safeProduct.brand?.name || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Kategoriler">
                  {safeProduct.categories && safeProduct.categories.length > 0
                    ? safeProduct.categories.map((cat: any) => cat.name).join(", ")
                    : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Stok Miktarı">
                  <span className="font-bold">{safeProduct.stockAmount}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Stok Birimi">
                  {safeProduct.stockTypeLabel || "Adet"}
                </Descriptions.Item>
                <Descriptions.Item label="KDV Dahil">
                  {safeProduct.taxIncluded ? "Evet" : "Hayır"}
                </Descriptions.Item>
                <Descriptions.Item label="Oluşturulma Tarihi">
                  {safeProduct.createdAt
                    ? new Date(safeProduct.createdAt).toLocaleDateString("tr-TR")
                    : "-"}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Flex>
        </Col>
      </Row>

      {/* Açıklama Sekmesi */}
      {(safeProduct.detail?.details || safeProduct.detail?.extraDetails) && (
        <Card className="shadow-sm border-slate-100 dark:border-slate-800 mt-6">
          <Tabs
            items={[
              {
                key: "1",
                label: "Açıklama",
                children: safeProduct.detail?.details ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: safeProduct.detail.details }}
                    className="prose dark:prose-invert max-w-none"
                  />
                ) : (
                  <p className="text-slate-500">Açıklama bulunmamaktadır.</p>
                ),
              },
              ...(safeProduct.detail?.extraDetails
                ? [
                    {
                      key: "2",
                      label: "Ek Bilgiler",
                      children: (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: safeProduct.detail.extraDetails,
                          }}
                          className="prose dark:prose-invert max-w-none"
                        />
                      ),
                    },
                  ]
                : []),
            ]}
          />
        </Card>
      )}
    </div>
  );
}
