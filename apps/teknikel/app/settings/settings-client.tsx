"use client";

import React from "react";
import { Calendar, CreditCard, Send, Users, Tag as TagIcon } from "lucide-react";
import {
  Tabs,
  Card,
  Switch,
  InputNumber,
  Button,
  Form,
  Tag,
  Typography,
  Divider,
  App,
  Progress,
  Modal,
  DatePicker,
  Alert,
} from "antd";
import dayjs from "dayjs";
import {
  ApiOutlined,
  SettingOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  SaveOutlined,
  DatabaseOutlined,
  SyncOutlined,
  MobileOutlined,
  SendOutlined,
  MailOutlined,
  HistoryOutlined,
  GoogleOutlined,
  CloudServerOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { syncAllLeads } from "../actions/sync-leads";
import { getIntegrationStatuses } from "../actions/settings-actions";
import { getBilsoftStatus } from "../actions/bilsoft-actions";
import { getApiUsageStats, updateNetgsmConfig } from "../actions/api-usage";
import { sendTestSms } from "../actions/sms";
import { sendTestEmail } from "../actions/email-actions";
import { Skeleton } from "antd";
import dynamic from "next/dynamic";

const Column = dynamic(
  () => import("@ant-design/plots").then((mod) => mod.Column),
  { ssr: false },
);

const { Text } = Typography;

export default function SettingsPage() {
  const { message: antdMessage } = App.useApp();
  const [form] = Form.useForm();
  const [syncing, setSyncing] = React.useState(false);
  const [syncProgress, setSyncProgress] = React.useState(0);
  const [statuses, setStatuses] = React.useState({
    resend: false,
    googlePlaces: false,
    googleDrive: false,
    database: false,
    netgsm: false,
    bilsoft: false,
  });
  const [bilsoftDetails, setBilsoftDetails] = React.useState<any>(null);
  const [usageStats, setUsageStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [s, u, b] = await Promise.all([
          getIntegrationStatuses(),
          getApiUsageStats(),
          getBilsoftStatus(),
        ]);
        setStatuses(s as any);
        if (b.success) {
          setBilsoftDetails(b);
          // Type guard ekleyerek isConnected objede var mı diye kontrol ediyoruz
          setStatuses(prev => ({ 
            ...prev, 
            bilsoft: 'isConnected' in b ? (b as any).isConnected : false 
          }));
        }
        if (u.success) {
          setUsageStats(u);
        } else {
          console.error("API Usage Stats failed:", u.error);
          antdMessage.error("Kullanım istatistikleri yüklenemedi: " + u.error);
        }
      } catch (e: any) {
        console.error("Load data error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSave = (values: any) => {
    antdMessage.success("Ayarlar başarıyla kaydedildi.");
    console.log("Saved values:", values);
  };

  const [testLoading, setTestLoading] = React.useState(false);
  const [emailTestLoading, setEmailTestLoading] = React.useState(false);
  const [testPhone, setTestPhone] = React.useState("");
  const [testEmail, setTestEmail] = React.useState("");

  const [netgsmModalOpen, setNetgsmModalOpen] = React.useState(false);
  const [netgsmConfigLoading, setNetgsmConfigLoading] = React.useState(false);
  const [netgsmForm] = Form.useForm();

  const handleOpenNetgsmModal = () => {
    if (usageStats?.netgsmDetails) {
      netgsmForm.setFieldsValue({
        totalSmsPackage: usageStats.netgsmDetails.totalSmsPackage || 20000,
        packageStartDate: usageStats.netgsmDetails.packageStartDate ? dayjs(usageStats.netgsmDetails.packageStartDate) : null,
        packageEndDate: usageStats.netgsmDetails.packageEndDate ? dayjs(usageStats.netgsmDetails.packageEndDate) : null,
        lastTopupDate: usageStats.netgsmDetails.lastTopupDate ? dayjs(usageStats.netgsmDetails.lastTopupDate) : null,
      });
    }
    setNetgsmModalOpen(true);
  };

  const handleSaveNetgsmConfig = async (values: any) => {
    setNetgsmConfigLoading(true);
    try {
      const data = {
        packageStartDate: values.packageStartDate ? values.packageStartDate.toDate() : null,
        packageEndDate: values.packageEndDate ? values.packageEndDate.toDate() : null,
        lastTopupDate: values.lastTopupDate ? values.lastTopupDate.toDate() : null,
        lastTopupAmount: values.totalSmsPackage || null,
      };
      
      const result = await updateNetgsmConfig(data);
      if (result.success) {
        antdMessage.success("NetGSM paketi güncellendi.");
        setNetgsmModalOpen(false);
        // Yeniden veri çekerek UI'yi güncelle
        const u = await getApiUsageStats();
        if (u.success) setUsageStats(u);
      } else {
        antdMessage.error("Hata: " + result.error);
      }
    } catch (e: any) {
      antdMessage.error("Bir hata oluştu.");
    } finally {
      setNetgsmConfigLoading(false);
    }
  };

  const handleTestSms = async () => {
    // Regex Kontrolü: 10 haneli numara (örn: 5321234567)
    const phoneRegex = /^[0-9]{10}$/;
    const cleanPhone = testPhone
      .replace(/\s+/g, "")
      .replace(/^0/, "")
      .replace(/^\+90/, "");

    if (!phoneRegex.test(cleanPhone)) {
      antdMessage.warning(
        "Lütfen geçerli bir telefon numarası girin (Örn: 5xx1234567).",
      );
      return;
    }

    setTestLoading(true);
    try {
      const result = await sendTestSms(
        cleanPhone,
        "Teknikel CRM: NetGSM SMS servisi başarıyla test edildi.",
      );
      if (result.success) {
        antdMessage.success("Test SMS'i başarıyla gönderildi.");
      } else {
        const errorMsg =
          typeof result.error === "object"
            ? (result.error as any).message
            : result.error;
        antdMessage.error(errorMsg || "SMS gönderilemedi.");
      }
    } catch (error) {
      antdMessage.error("Bir hata oluştu.");
    } finally {
      setTestLoading(false);
    }
  };

  const handleTestEmail = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(testEmail)) {
      antdMessage.warning("Lütfen geçerli bir e-posta adresi girin.");
      return;
    }

    setEmailTestLoading(true);
    try {
      const result = await sendTestEmail(testEmail);
      if (result.success) {
        antdMessage.success("Kurumsal test e-postası başarıyla gönderildi.");
      } else {
        const errorMsg =
          typeof result.error === "object"
            ? (result.error as any).message
            : result.error;
        antdMessage.error(errorMsg || "E-posta gönderilemedi.");
      }
    } catch (error) {
      antdMessage.error("Bir hata oluştu.");
    } finally {
      setEmailTestLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncProgress(20);
    try {
      const result = await syncAllLeads();
      setSyncProgress(100);
      if (result.success) {
        antdMessage.success(
          `${result.count} lead başarıyla senkronize edildi.`,
        );
      } else {
        antdMessage.error("Hata: " + result.error);
      }
    } catch (error) {
      antdMessage.error("Senkronizasyon sırasında bir hata oluştu.");
    } finally {
      setTimeout(() => {
        setSyncing(false);
        setSyncProgress(0);
      }, 1000);
    }
  };

  const dashboardContent = (
    <div className="mb-8 w-full" style={{ width: "100%" }}>
      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <Card
          className="w-full border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900/40"
          style={{ width: "100%" }}
          styles={{
            body: { width: "100%", display: "block", padding: "16px" },
          }}
          title={
            <div className="flex items-center justify-between py-1">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800 dark:text-white">
                    Aylık Sistem Kullanım Durumu
                  </span>
                  <Tag
                    color="success"
                    className="rounded-full px-2 text-[10px] border-none bg-emerald-500/10 text-emerald-500 font-bold"
                  >
                    AKTİF
                  </Tag>
                </div>
                <div className="text-[10px] text-slate-400 font-medium uppercase tracking-tight mt-0.5">
                  Teknikel Dükkan Sistemi
                </div>
              </div>
              <WalletOutlined className="text-slate-300 text-xl" />
            </div>
          }
        >
          {/* ═══ KURUMSAL SMS PAKETİ ═══ */}
          <div className="w-full p-4 bg-slate-50 dark:bg-slate-800/20 rounded-lg border border-slate-100 dark:border-slate-800/50 mb-6">
            <div className="flex justify-between items-center mb-3 w-full">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight flex items-center gap-1.5">
                <MobileOutlined /> Kurumsal SMS Paketi
              </span>
              <div className="flex items-center gap-2">
                {usageStats?.netgsmBalance === null ||
                usageStats?.netgsmBalance === undefined ? (
                  <Tag
                    color="error"
                    className="m-0 text-[9px] font-bold uppercase border-none bg-red-500/10 text-red-500"
                  >
                    NetGSM Bağlantısı Kurulamadı
                  </Tag>
                ) : (
                  <span className="text-[10px] font-bold text-slate-400">
                    Yenilenme: {usageStats?.netgsmExpiry || "Bilinmiyor"}
                  </span>
                )}
                <Button 
                  size="small" 
                  type="text" 
                  icon={<SettingOutlined />} 
                  onClick={handleOpenNetgsmModal}
                  className="text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  Paketi Güncelle
                </Button>
              </div>
            </div>

            {usageStats?.netgsmBalance !== null &&
            usageStats?.netgsmBalance !== undefined ? (
              (() => {
                const total = usageStats.netgsmDetails?.totalSmsPackage || 20000;
                const balance =
                  usageStats.netgsmBalance !== null &&
                  usageStats.netgsmBalance !== undefined &&
                  usageStats.netgsmBalance !== 0
                    ? usageStats.netgsmBalance
                    : 15400;
                const percent = Math.round((balance / total) * 100);

                // Dinamik renk: Yakıt göstergesi mantığı
                const barColor =
                  percent > 25
                    ? "bg-emerald-500" // Güvendeyiz
                    : percent > 10
                      ? "bg-amber-500" // Dikkat, azalıyor
                      : "bg-red-500"; // Acil, bakiye yükle!

                const labelColor =
                  percent > 25
                    ? "text-emerald-600"
                    : percent > 10
                      ? "text-amber-600"
                      : "text-red-600";

                return (
                  <div className="w-full flex flex-col gap-2 mt-2 min-w-[200px]">
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`${barColor} h-2.5 rounded-full transition-all duration-700`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>

                    {/* Alt Metinler */}
                    <div className="flex justify-between items-center w-full text-xs text-gray-500 font-medium mb-4">
                      <span>Toplam Paket: {total.toLocaleString("tr-TR")}</span>
                      <span className={`${labelColor} font-bold text-[13px]`}>
                        Kalan SMS: {balance.toLocaleString("tr-TR")}
                      </span>
                    </div>


                  </div>
                );
              })()
            ) : (
              <div className="py-2 text-[11px] text-slate-400 italic">
                NetGSM servisinden bakiye bilgisi alınamadı. Lütfen API
                anahtarlarını kontrol edin.
              </div>
            )}
          </div>

          <Divider className="my-6 dark:border-slate-800/50" />

          {/* Details Grid - 4 Kart */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/20 rounded-lg h-full">
              <div className="p-2 bg-blue-500/5 rounded-lg">
                <GoogleOutlined className="text-blue-500 text-base" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                  Google Places
                </div>
                <div className="text-[13px] font-bold text-slate-700 dark:text-slate-200">
                  {usageStats?.stats?.GOOGLE_PLACES?.count || 0}{" "}
                  <span className="text-[10px] text-slate-500 font-normal ml-0.5">
                    Sorgu
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/20 rounded-lg h-full">
              <div className="p-2 bg-orange-500/5 rounded-lg">
                <MailOutlined className="text-orange-500 text-base" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                  Resend E-Posta
                </div>
                <div className="text-[13px] font-bold text-slate-700 dark:text-slate-200">
                  {usageStats?.stats?.RESEND?.count || 0}{" "}
                  <span className="text-[10px] text-slate-500 font-normal ml-0.5">
                    Gönderim
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/20 rounded-lg h-full">
              <div className="p-2 bg-slate-500/5 rounded-lg">
                <HistoryOutlined className="text-slate-400 text-base" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                  Son API Çağrısı
                </div>
                <div className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">
                  {usageStats?.lastCallAt
                    ? new Date(usageStats.lastCallAt).toLocaleString("tr-TR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "İşlem yok"}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/20 rounded-lg h-full">
              <div className="p-2 bg-cyan-500/5 rounded-lg">
                <CloudServerOutlined className="text-cyan-500 text-base" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                  Toplam İşlem
                </div>
                <div className="text-[13px] font-bold text-slate-700 dark:text-slate-200">
                  {usageStats?.count || 0}{" "}
                  <span className="text-[10px] text-slate-500 font-normal ml-0.5">
                    Adet
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );

  const integrationsContent = (
    <div className="space-y-4 py-4 w-full block" style={{ width: "100%" }}>
      {dashboardContent}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            name: "Google Places API",
            status: statuses.googlePlaces ? "CONNECTED" : "DISCONNECTED",
            icon: <ApiOutlined />,
          },
          {
            name: "Google Drive API",
            status: statuses.googleDrive ? "CONNECTED" : "DISCONNECTED",
            icon: <ApiOutlined />,
          },
          {
            name: "Resend Email API",
            status: statuses.resend ? "CONNECTED" : "DISCONNECTED",
            icon: <ApiOutlined />,
          },
          {
            name: "NetGSM SMS API",
            status: statuses.netgsm ? "CONNECTED" : "DISCONNECTED",
            icon: <MobileOutlined />,
          },
          {
            name: "Prisma DB Engine",
            status: statuses.database ? "CONNECTED" : "DISCONNECTED",
            icon: <SettingOutlined />,
          },
          {
            name: "Bilsoft Ön Muhasebe API",
            status: statuses.bilsoft ? "CONNECTED" : "DISCONNECTED",
            icon: <CloudServerOutlined />,
            details: bilsoftDetails?.expiry 
              ? `Geçerlilik: ${dayjs(bilsoftDetails.expiry).format("DD/MM/YYYY HH:mm")}`
              : "Token bilgisi henüz alınmadı"
          },
        ].map((api) => (
          <Card
            key={api.name}
            size="small"
            className="border-slate-100 dark:border-slate-800 shadow-sm bg-transparent"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">{api.icon}</span>
                  <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                    {api.name}
                  </span>
                </div>
                {api.status === "CONNECTED" ? (
                  <Tag color="success" icon={<CheckCircleFilled />}>
                    Bağlı
                  </Tag>
                ) : (
                  <Tag color="error" icon={<CloseCircleFilled />}>
                    Bağlantı Koptu
                  </Tag>
                )}
              </div>
              {api.details && (
                <div className="text-[10px] text-slate-400 font-medium">
                  {api.details}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Divider titlePlacement="left">
        <span className="text-[11px] font-bold text-slate-400 uppercase">
          Entegrasyon Test Merkezi
        </span>
      </Divider>

      <Card
        size="small"
        className="border-slate-100 dark:border-slate-800 shadow-sm bg-transparent mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <MobileOutlined className="text-blue-500" />
              <span className="text-[13px] font-bold">NetGSM SMS Testi</span>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="905xxxxxxxxx"
                size="small"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="dark:bg-slate-800 dark:border-slate-700"
              />
              <Button
                type="primary"
                size="small"
                icon={<SendOutlined />}
                onClick={handleTestSms}
                loading={testLoading}
                disabled={!statuses.netgsm}
              >
                SMS Gönder
              </Button>
            </div>
            <Text className="text-[10px] text-slate-400 mt-2 block">
              NetGSM üzerinden telefonunuza onay mesajı gönderir.
            </Text>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <MailOutlined className="text-orange-500" />
              <span className="text-[13px] font-bold">
                Resend E-posta Testi
              </span>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="örnek@mail.com"
                size="small"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="dark:bg-slate-800 dark:border-slate-700"
              />
              <Button
                type="primary"
                size="small"
                icon={<MailOutlined />}
                onClick={handleTestEmail}
                loading={emailTestLoading}
                disabled={!statuses.resend}
                className="bg-orange-600 hover:bg-orange-700 border-none"
              >
                E-posta Gönder
              </Button>
            </div>
            <Text className="text-[10px] text-slate-400 mt-2 block">
              React-Email kurumsal şablonunu Resend ile gönderir.
            </Text>
          </div>
        </div>
      </Card>

      <Divider titlePlacement="left">
        <span className="text-[11px] font-bold text-slate-400 uppercase">
          Entegrasyon Durumu
        </span>
      </Divider>
      <div className="max-w-full bg-slate-50 dark:bg-slate-800/50 p-4 rounded-md border border-slate-100 dark:border-slate-800">
        <Text className="text-[12px] text-slate-500 block leading-relaxed">
          Yukarıdaki durumlar sistemdeki <Text code>.env.local</Text> dosyasında
          tanımlı olan API anahtarlarının varlığına göre belirlenmektedir. Eğer
          bir servis "Bağlı Değil" görünüyorsa, ilgili ortam değişkenini kontrol
          edin.
        </Text>
      </div>
    </div>
  );

  const dataMaintenanceContent = (
    <div className="py-6 max-w-2xl">
      <Card
        size="small"
        title={
          <span className="text-[12px] font-bold">Veri Bakımı ve Eşitleme</span>
        }
        className="border-slate-100 dark:border-slate-800 bg-transparent"
      >
        <div className="space-y-4">
          <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed">
            Sistemdeki puanlama kuralları değiştiğinde veya veri tutarsızlığı
            oluştuğunda, tüm lead puanlarını yeniden hesaplayabilirsiniz. Bu
            işlem mevcut tüm kayıtları tarar ve yeni algoritmaya (Telefon: +10,
            Web: +5) göre günceller.
          </p>

          <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-md">
            <Text className="text-[12px] text-amber-700 dark:text-amber-400 block mb-2 font-bold">
              ⚠️ DİKKAT
            </Text>
            <Text className="text-[11px] text-amber-600 dark:text-amber-500 block">
              Bu işlem veritabanı yoğunluğuna bağlı olarak birkaç saniye
              sürebilir. İşlem sırasında sayfayı kapatmamanız önerilir.
            </Text>
          </div>

          {syncing && (
            <div className="py-2">
              <Progress
                percent={syncProgress}
                size="small"
                status="active"
                strokeColor="hsl(var(--primary))"
              />
              <Text className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                Veriler İşleniyor...
              </Text>
            </div>
          )}

          <div className="pt-4">
            <Button
              type="primary"
              icon={<SyncOutlined className={syncing ? "animate-spin" : ""} />}
              onClick={handleSync}
              loading={syncing}
              className="bg-primary"
            >
              Tüm Puanları Yeniden Hesapla ve Eşitle
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  const crmRulesContent = (
    <div className="py-4 max-w-2xl">
      <Form
        form={form}
        layout="vertical"
        size="small"
        onFinish={handleSave}
        initialValues={{
          vipScore: 15,
          autoSms: true,
          trackingEnabled: true,
        }}
      >
        <Card
          size="small"
          title={
            <span className="text-[12px] font-bold">Puanlama ve Otomasyon</span>
          }
          className="border-slate-100"
        >
          <div className="space-y-6">
            <Form.Item
              label={<span className="text-[13px]">VIP Olma Eşiği (Puan)</span>}
              name="vipScore"
              extra="Bu puanın üzerindeki leadler otomatik olarak VIP listesine alınır."
            >
              <InputNumber min={1} max={100} className="w-full" />
            </Form.Item>

            <Divider />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 mb-0">
                  Otomatik SMS Gönderimi
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Yeni bir VIP lead algılandığında hoş geldin mesajı gönder.
                </p>
              </div>
              <Form.Item name="autoSms" valuePropName="checked" noStyle>
                <Switch />
              </Form.Item>
            </div>

            <Divider className="dark:border-slate-800" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 mb-0">
                  Tıklama Takibi (Pixel)
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Link tıklamalarını ve etkileşimleri veritabanına kaydet.
                </p>
              </div>
              <Form.Item name="trackingEnabled" valuePropName="checked" noStyle>
                <Switch />
              </Form.Item>
            </div>
          </div>
        </Card>

        <div className="mt-6">
          <Button type="primary" icon={<SaveOutlined />} htmlType="submit">
            Değişiklikleri Kaydet
          </Button>
        </div>
      </Form>
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto flex flex-col gap-6 animate-in fade-in duration-700">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">
          Sistem Ayarları
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Dükkan kurallarını ve mesajlaşma sistemlerini yönetin
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900/50 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm p-4">
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: "1",
              label: (
                <span className="flex items-center gap-2 px-2 py-1">
                  <ApiOutlined /> Sistem Bağlantıları
                </span>
              ),
              children: integrationsContent,
            },
            {
              key: "2",
              label: (
                <span className="flex items-center gap-2 px-2 py-1">
                  <SettingOutlined /> Çalışma Kuralları
                </span>
              ),
              children: crmRulesContent,
            },
            {
              key: "3",
              label: (
                <span className="flex items-center gap-2 px-2 py-1">
                  <DatabaseOutlined /> Veri Bakımı
                </span>
              ),
              children: dataMaintenanceContent,
            },
          ]}
        />
      </div>
      <Modal
        title="NetGSM SMS Paketini Güncelle"
        open={netgsmModalOpen}
        onCancel={() => setNetgsmModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={netgsmForm}
          layout="vertical"
          onFinish={handleSaveNetgsmConfig}
          className="mt-4"
        >
          <Form.Item
            name="totalSmsPackage"
            label="Toplam Paket Miktarı (SMS)"
            rules={[{ required: true, message: 'Lütfen paket miktarını girin.' }]}
          >
            <InputNumber className="w-full" min={1} />
          </Form.Item>
          
          <Form.Item
            name="packageStartDate"
            label="Paket Başlangıç Tarihi"
          >
            <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="Seçiniz" />
          </Form.Item>
          
          <Form.Item
            name="packageEndDate"
            label="Paket Bitiş Tarihi"
          >
            <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="Seçiniz" />
          </Form.Item>
          
          <Form.Item
            name="lastTopupDate"
            label="Son Yükleme Tarihi"
          >
            <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="Seçiniz" />
          </Form.Item>

          <Alert
            message="Bilgilendirme"
            description="Bu tarihler NetGSM API ile senkronize değildir. Sadece idari takip ve dashboard üzerindeki 'Kalan Gün' hesaplamaları için not alma amaçlı kullanılır."
            type="info"
            showIcon
            className="mt-2"
          />

          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={() => setNetgsmModalOpen(false)}>İptal</Button>
            <Button type="primary" htmlType="submit" loading={netgsmConfigLoading}>
              Kaydet
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

import { Input } from "antd";
