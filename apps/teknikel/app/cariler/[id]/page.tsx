import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { getBilsoftCariById } from "@/src/services/bilsoft";
import { Card, Descriptions, Tag, Button, Divider, Row, Col } from "antd";
import { ArrowLeftOutlined, UserOutlined, PhoneOutlined, MailOutlined, HomeOutlined, BankOutlined, InfoCircleOutlined, WalletOutlined } from "@ant-design/icons";
import Link from "next/link";

export default async function CariDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const cari = await getBilsoftCariById(params.id);

  if (!cari) {
    notFound();
  }

  // Veriyi sterilize et
  const safeCari = JSON.parse(JSON.stringify(cari));

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/cariler">
            <Button icon={<ArrowLeftOutlined />} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-0">
              {safeCari.faturaUnvan || "İsimsiz Cari"}
            </h1>
            <span className="text-slate-400 text-sm">{safeCari.cariKod}</span>
          </div>
        </div>
        <Tag color={safeCari.grup === "VIP" ? "gold" : "blue"} className="font-bold">
          {safeCari.grup || "GENEL"}
        </Tag>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card 
            title={<div className="flex items-center gap-2"><UserOutlined /> Temel Bilgiler</div>}
            className="shadow-sm mb-6"
          >
            <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
              <Descriptions.Item label="Ünvan" span={2}>{safeCari.faturaUnvan}</Descriptions.Item>
              <Descriptions.Item label="Yetkili">{safeCari.yetkili || "-"}</Descriptions.Item>
              <Descriptions.Item label="Cari Kod">{safeCari.cariKod}</Descriptions.Item>
              <Descriptions.Item label="Grup">{safeCari.grup || "Genel"}</Descriptions.Item>
              <Descriptions.Item label="Şube">{safeCari.subeAdi || "-"}</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card 
            title={<div className="flex items-center gap-2"><PhoneOutlined /> İletişim Bilgileri</div>}
            className="shadow-sm mb-6"
          >
            <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
              <Descriptions.Item label="Telefon">{safeCari.tel || "-"}</Descriptions.Item>
              <Descriptions.Item label="Cep">{safeCari.cep || "-"}</Descriptions.Item>
              <Descriptions.Item label="E-posta" span={2}>{safeCari.mail || "-"}</Descriptions.Item>
              <Descriptions.Item label="Web" span={2}>{safeCari.webAdresi || "-"}</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card 
            title={<div className="flex items-center gap-2"><HomeOutlined /> Adres Bilgileri</div>}
            className="shadow-sm"
          >
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="İl / İlçe">{safeCari.faturaIlce} / {safeCari.faturaIl}</Descriptions.Item>
              <Descriptions.Item label="Fatura Adresi">{safeCari.faturaAdres || "-"}</Descriptions.Item>
              <Descriptions.Item label="Sevk Adresi">{safeCari.sevkAdres || "-"}</Descriptions.Item>
              <Descriptions.Item label="Posta Kodu">{safeCari.postakodu || "-"}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card 
            title={<div className="flex items-center gap-2"><WalletOutlined /> Finansal Durum</div>}
            className="shadow-sm mb-6"
          >
            <div className="text-center py-4">
              <div className="text-slate-400 text-xs uppercase font-bold mb-1">Güncel Bakiye</div>
              <div className={`text-2xl font-black ${safeCari.bakiye < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(safeCari.bakiye || 0)}
              </div>
            </div>
            <Divider className="my-3" />
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Risk Limiti">
                {safeCari.riskLimiti ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(safeCari.riskLimiti) : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Vade Günü">{safeCari.varsayilanVadeGunu || "-"}</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card 
            title={<div className="flex items-center gap-2"><BankOutlined /> Vergi Bilgileri</div>}
            className="shadow-sm mb-6"
          >
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Vergi Dairesi">{safeCari.vergiDairesi || "-"}</Descriptions.Item>
              <Descriptions.Item label="Vergi No">{safeCari.vergiNo || "-"}</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card 
            title={<div className="flex items-center gap-2"><InfoCircleOutlined /> Notlar</div>}
            className="shadow-sm"
          >
            <div className="text-sm text-slate-600 dark:text-slate-400 italic">
              {safeCari.cariaciklama || safeCari.aciklama || "Not bulunmuyor."}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
