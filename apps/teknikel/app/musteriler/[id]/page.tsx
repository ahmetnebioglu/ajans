import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { getIdeasoftCustomerById } from "@/src/services/ideasoft";
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
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import Link from "next/link";

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

const getStatusColor = (status: string | undefined) => {
  if (!status) return "default";
  const s = status.toLowerCase();
  if (s === "active") return "green";
  if (s === "passive") return "red";
  return "default";
};

const getStatusLabel = (status: string | undefined) => {
  if (!status) return "-";
  const s = status.toLowerCase();
  if (s === "active") return "Aktif";
  if (s === "passive") return "Pasif";
  return status;
};

export default async function MusteriDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const customer = await getIdeasoftCustomerById(Number(id));

  if (!customer) {
    notFound();
  }

  // Veriyi sterilize et
  const safeCustomer = JSON.parse(JSON.stringify(customer));

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Başlık */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/musteriler">
            <Button icon={<ArrowLeftOutlined />} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-0">
              {safeCustomer.firstname} {safeCustomer.surname}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-slate-400 text-sm">ID: {safeCustomer.id}</span>
              {safeCustomer.memberGroup && (
                <>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-400 text-sm">
                    {safeCustomer.memberGroup.name}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {safeCustomer.status && (
            <Tag
              color={getStatusColor(safeCustomer.status)}
              className="font-bold"
            >
              {getStatusLabel(safeCustomer.status)}
            </Tag>
          )}
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {/* Sol Kolon */}
        <Col xs={24} lg={16}>
          <Flex vertical gap={24}>
            {/* Kişisel Bilgiler */}
            <Card
              title={
                <div className="flex items-center gap-2">
                  <UserOutlined /> Kişisel Bilgiler
                </div>
              }
              className="shadow-sm"
            >
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="ID">
                  <span className="font-mono font-semibold">{safeCustomer.id}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Ad Soyad">
                  {safeCustomer.firstname} {safeCustomer.surname}
                </Descriptions.Item>
                <Descriptions.Item label="E-posta" span={2}>
                  {safeCustomer.email || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Telefon">
                  {safeCustomer.phoneNumber || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Cep Telefonu">
                  {safeCustomer.mobilePhoneNumber || "-"}
                </Descriptions.Item>
                {safeCustomer.gender && (
                  <Descriptions.Item label="Cinsiyet">
                    {safeCustomer.gender === "male"
                      ? "Erkek"
                      : safeCustomer.gender === "female"
                      ? "Kadın"
                      : "-"}
                  </Descriptions.Item>
                )}
                {safeCustomer.birthDate && (
                  <Descriptions.Item label="Doğum Tarihi">
                    {formatDate(safeCustomer.birthDate)}
                  </Descriptions.Item>
                )}
                {safeCustomer.tcId && (
                  <Descriptions.Item label="TC Kimlik No">
                    {safeCustomer.tcId}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            {/* Adres ve Şirket Bilgileri */}
            <Card
              title={
                <div className="flex items-center gap-2">
                  <HomeOutlined /> Adres ve Şirket Bilgileri
                </div>
              }
              className="shadow-sm"
            >
              <Descriptions column={2} bordered size="small">
                {safeCustomer.commercialName && (
                  <Descriptions.Item label="Ticari Ünvan" span={2}>
                    {safeCustomer.commercialName}
                  </Descriptions.Item>
                )}
                {safeCustomer.taxNumber && (
                  <Descriptions.Item label="Vergi Numarası">
                    {safeCustomer.taxNumber}
                  </Descriptions.Item>
                )}
                {safeCustomer.taxOffice && (
                  <Descriptions.Item label="Vergi Dairesi">
                    {safeCustomer.taxOffice}
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Ülke">
                  {safeCustomer.country?.name || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Şehir">
                  {safeCustomer.location?.name || "-"}
                </Descriptions.Item>
                {safeCustomer.district && (
                  <Descriptions.Item label="İlçe">
                    {safeCustomer.district}
                  </Descriptions.Item>
                )}
                {safeCustomer.address && (
                  <Descriptions.Item label="Adres" span={2}>
                    {safeCustomer.address}
                  </Descriptions.Item>
                )}
                {safeCustomer.zipCode && (
                  <Descriptions.Item label="Posta Kodu">
                    {safeCustomer.zipCode}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            {/* İletişim İzinleri */}
            <Card
              title={
                <div className="flex items-center gap-2">
                  <CheckCircleOutlined /> İletişim İzinleri
                </div>
              }
              className="shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600 dark:text-slate-300">
                    Telefon İzni
                  </span>
                  <Badge
                    status={safeCustomer.allowedToPhone === 1 ? "success" : "default"}
                    text={safeCustomer.allowedToPhone === 1 ? "İzinli" : "İzinsiz"}
                  />
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600 dark:text-slate-300">
                    SMS İzni
                  </span>
                  <Badge
                    status={safeCustomer.allowedToSms === 1 ? "success" : "default"}
                    text={safeCustomer.allowedToSms === 1 ? "İzinli" : "İzinsiz"}
                  />
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-600 dark:text-slate-300">
                    Kampanya İzni
                  </span>
                  <Badge
                    status={
                      safeCustomer.allowedToCampaigns === 1 ? "success" : "default"
                    }
                    text={
                      safeCustomer.allowedToCampaigns === 1 ? "İzinli" : "İzinsiz"
                    }
                  />
                </div>
              </div>
            </Card>
          </Flex>
        </Col>

        {/* Sağ Kolon */}
        <Col xs={24} lg={8}>
          <div className="sticky top-24">
            {/* Müşteri Bilgileri */}
            <Card
              title={
                <div className="flex items-center gap-2">
                  <UserOutlined /> Müşteri Bilgileri
                </div>
              }
              className="shadow-sm mb-6"
            >
              <div className="space-y-3">
                {safeCustomer.memberGroup && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500 text-sm">Müşteri Grubu</span>
                    <Tag color="blue">{safeCustomer.memberGroup.name}</Tag>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 text-sm">Puan</span>
                  <span className="font-semibold text-slate-700">
                    {safeCustomer.pointAmount?.toFixed(2) || "0.00"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 text-sm">KVKK Onayı</span>
                  <Badge
                    status={safeCustomer.kvkkStatus === 1 ? "success" : "default"}
                    text={safeCustomer.kvkkStatus === 1 ? "Onaylı" : "Onaysız"}
                  />
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-500 text-sm">Durum</span>
                  <Tag color={getStatusColor(safeCustomer.status)}>
                    {getStatusLabel(safeCustomer.status)}
                  </Tag>
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
              className="shadow-sm"
            >
              <Descriptions column={1} size="small">
                {safeCustomer.deviceType && (
                  <Descriptions.Item label="Cihaz Tipi">
                    {safeCustomer.deviceType}
                  </Descriptions.Item>
                )}
                {safeCustomer.lastIp && (
                  <Descriptions.Item label="Son IP Adresi">
                    <span className="font-mono text-xs">{safeCustomer.lastIp}</span>
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Kayıt Tarihi">
                  {formatDate(safeCustomer.createdAt)}
                </Descriptions.Item>
                <Descriptions.Item label="Son Giriş">
                  {formatDate(safeCustomer.lastLoginDate)}
                </Descriptions.Item>
                <Descriptions.Item label="Son Güncelleme">
                  {formatDate(safeCustomer.updatedAt)}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
}
