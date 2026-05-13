import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { getIdeasoftOrderById } from "@/src/services/ideasoft";
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
} from "antd";
import {
  ArrowLeftOutlined,
  ShoppingOutlined,
  UserOutlined,
  CreditCardOutlined,
  TruckOutlined,
  CalendarOutlined,
  DollarOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import OrderStatusClient from "./OrderStatusClient";
import OrderItemsTable from "./OrderItemsTable";
import PrintButton from "../PrintButton";
import InvoiceCreatorButton from "../InvoiceCreatorButton";

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

const formatPrice = (price: number | null | undefined) => {
  if (price == null) return "-";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(price);
};

const getStatusColor = (status: string | undefined) => {
  if (!status) return "default";
  const s = status.toLowerCase();
  if (s === "new" || s === "waiting_for_approval") return "blue";
  if (s === "pending" || s === "waiting_for_payment") return "orange";
  if (s === "being_prepared" || s === "on_accumulation") return "cyan";
  if (s === "shipped" || s === "fulfilled") return "purple";
  if (s === "delivered" || s === "approved") return "green";
  if (s === "cancelled" || s === "deleted") return "red";
  return "default";
};

const getStatusLabel = (status: string | undefined) => {
  if (!status) return "-";
  const s = status.toLowerCase();
  const labels: { [key: string]: string } = {
    new: "Yeni Sipariş",
    waiting_for_approval: "Onay Bekliyor",
    pending: "Beklemede",
    waiting_for_payment: "Ödeme Bekleniyor",
    being_prepared: "Hazırlanıyor",
    on_accumulation: "Tedarik Sürecinde",
    shipped: "Kargoda",
    fulfilled: "Kargoya Verildi",
    approved: "Onaylandı",
    delivered: "Teslim Edildi",
    cancelled: "İptal Edildi",
    deleted: "Silinmiş",
  };
  return labels[s] || status;
};

export default async function SiparisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const order = await getIdeasoftOrderById(Number(id));

  if (!order) {
    notFound();
  }

  // Veriyi sterilize et
  const safeOrder = JSON.parse(JSON.stringify(order));

  return (
    <div className="p-6 max-w-6xl mx-auto">
       {/* Başlık */}
       <div className="mb-6 flex items-center justify-between">
         <div className="flex items-center gap-4">
           <Link href="/siparisler">
             <Button icon={<ArrowLeftOutlined />} />
           </Link>
           <div>
             <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-0">
               Sipariş #{safeOrder.id}
             </h1>
             <div className="flex items-center gap-3 mt-1">
               <span className="text-slate-400 text-sm">
                 {formatDate(safeOrder.createdAt)}
               </span>
             </div>
           </div>
         </div>
         <div className="flex items-center gap-3">
           <Tag
             color={getStatusColor(safeOrder.status)}
             className="font-bold text-sm px-3 py-1"
           >
             {getStatusLabel(safeOrder.status)}
           </Tag>
           <PrintButton order={safeOrder as any} size="large" />
           <InvoiceCreatorButton order={safeOrder as any} size="large" />
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
            <ShoppingOutlined style={{ fontSize: 40 }} />
            <div>
              <div className="text-xl font-bold">
                {safeOrder.customerFirstname} {safeOrder.customerSurname}
              </div>
              <div className="text-sm opacity-80">
                Sipariş #{safeOrder.id} • {formatDate(safeOrder.createdAt)}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black">
              {formatPrice(safeOrder.finalAmount)}
            </div>
            <div className="text-sm opacity-80">Toplam Tutar</div>
          </div>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {/* Sol Kolon */}
        <Col xs={24} lg={16}>
          <Flex vertical gap={24}>
            {/* Müşteri Bilgileri */}
            <Card
              title={
                <div className="flex items-center gap-2">
                  <UserOutlined /> Müşteri Bilgileri
                </div>
              }
              className="shadow-sm"
            >
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="Ad Soyad" span={2}>
                  {safeOrder.customerFirstname} {safeOrder.customerSurname}
                </Descriptions.Item>
                <Descriptions.Item label="E-posta" span={2}>
                  {safeOrder.customerEmail || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Telefon">
                  {safeOrder.customerPhone || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Müşteri Grubu">
                  {safeOrder.memberGroupName || "-"}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Ödeme Bilgileri */}
            <Card
              title={
                <div className="flex items-center gap-2">
                  <CreditCardOutlined /> Ödeme Bilgileri
                </div>
              }
              className="shadow-sm"
            >
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="Ödeme Türü">
                  {safeOrder.paymentTypeName || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Ödeme Sağlayıcı">
                  {safeOrder.paymentProviderName || "-"}
                </Descriptions.Item>
                {safeOrder.installment && safeOrder.installment > 1 && (
                  <Descriptions.Item label="Taksit">
                    {safeOrder.installment} taksit
                  </Descriptions.Item>
                )}
                <Descriptions.Item
                  label="Ödeme Durumu"
                  span={safeOrder.installment && safeOrder.installment > 1 ? 1 : 2}
                >
                  <Badge
                    status={
                      safeOrder.paymentStatus === "success"
                        ? "success"
                        : "default"
                    }
                    text={
                      safeOrder.paymentStatus === "success"
                        ? "Başarılı"
                        : "Beklemede"
                    }
                  />
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Kargo Bilgileri */}
            <Card
              title={
                <div className="flex items-center gap-2">
                  <TruckOutlined /> Kargo Bilgileri
                </div>
              }
              className="shadow-sm"
            >
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="Kargo Şirketi" span={2}>
                  {safeOrder.shippingCompanyName || "-"}
                </Descriptions.Item>
                {safeOrder.shippingAddress && (
                  <>
                    <Descriptions.Item label="Teslimat Adresi" span={2}>
                      {safeOrder.shippingAddress.address || "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Şehir">
                      {safeOrder.shippingAddress.location || "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label="İlçe">
                      {safeOrder.shippingAddress.subLocation || "-"}
                    </Descriptions.Item>
                  </>
                )}
              </Descriptions>
            </Card>

            {/* Sipariş Kalemleri */}
            {safeOrder.orderItems && safeOrder.orderItems.length > 0 && (
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <ShoppingOutlined /> Sipariş Kalemleri (
                    {safeOrder.orderItems.length} Adet)
                  </div>
                }
                className="shadow-sm"
              >
                <OrderItemsTable
                  orderItems={safeOrder.orderItems}
                  amount={safeOrder.amount}
                  finalAmount={safeOrder.finalAmount}
                />
              </Card>
            )}
          </Flex>
        </Col>

        {/* Sağ Kolon */}
        <Col xs={24} lg={8}>
          <div className="sticky top-24">
            {/* Durum Güncelleme */}
            <OrderStatusClient orderId={safeOrder.id} currentStatus={safeOrder.status} />

            {/* Finansal Özet */}
            <Card
              title={
                <div className="flex items-center gap-2">
                  <DollarOutlined /> Finansal Özet
                </div>
              }
              className="shadow-sm mt-6"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 text-sm">Ara Toplam</span>
                  <span className="font-semibold">
                    {formatPrice(safeOrder.amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 text-sm">KDV</span>
                  <span className="font-semibold">
                    {formatPrice(safeOrder.taxAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 text-sm">Kargo</span>
                  <span className="font-semibold">
                    {formatPrice(safeOrder.shippingAmount)}
                  </span>
                </div>
                {safeOrder.couponDiscount > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500 text-sm">Kupon İndirimi</span>
                    <span className="font-semibold text-orange-500">
                      -{formatPrice(safeOrder.couponDiscount)}
                    </span>
                  </div>
                )}
                {safeOrder.promotionDiscount > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500 text-sm">
                      Kampanya İndirimi
                    </span>
                    <span className="font-semibold text-orange-500">
                      -{formatPrice(safeOrder.promotionDiscount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-3 bg-slate-50 rounded-lg px-3">
                  <span className="font-bold text-slate-700">Genel Toplam</span>
                  <span className="font-black text-xl text-slate-800">
                    {formatPrice(safeOrder.finalAmount)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Sistem Bilgileri */}
            <Card
              title={
                <div className="flex items-center gap-2">
                  <CalendarOutlined /> Sistem Bilgileri
                </div>
              }
              className="shadow-sm mt-6"
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Sipariş Tarihi">
                  {formatDate(safeOrder.createdAt)}
                </Descriptions.Item>
                <Descriptions.Item label="Son Güncelleme">
                  {formatDate(safeOrder.updatedAt)}
                </Descriptions.Item>
                {safeOrder.clientIp && (
                  <Descriptions.Item label="İstemci IP">
                    <span className="font-mono text-xs">{safeOrder.clientIp}</span>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
}
