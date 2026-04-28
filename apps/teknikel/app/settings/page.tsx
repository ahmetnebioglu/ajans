"use client";

import React from "react";
import { 
  Tabs, 
  Card, 
  Switch, 
  InputNumber, 
  Button, 
  Form, 
  Tag, 
  Typography,
  Space,
  Divider,
  message as antdMessage 
} from "antd";
import { 
  ApiOutlined, 
  SettingOutlined, 
  CheckCircleFilled, 
  CloseCircleFilled,
  SaveOutlined,
  DatabaseOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { syncAllLeads } from "../actions/sync-leads";
import { getIntegrationStatuses } from "../actions/settings-actions";
import { getApiUsageStats } from "../actions/api-usage";
import { Progress, Statistic, Row, Col, Skeleton } from "antd";
import dynamic from 'next/dynamic';

const Column = dynamic(() => import('@ant-design/plots').then((mod) => mod.Column), { ssr: false });

const { Title, Text } = Typography;

export default function SettingsPage() {
  const [form] = Form.useForm();
  const [syncing, setSyncing] = React.useState(false);
  const [syncProgress, setSyncProgress] = React.useState(0);
  const [statuses, setStatuses] = React.useState({
    resend: false,
    googlePlaces: false,
    googleDrive: false,
    database: false
  });
  const [usageStats, setUsageStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [s, u] = await Promise.all([
          getIntegrationStatuses(),
          getApiUsageStats()
        ]);
        setStatuses(s as any);
        if (u.success) setUsageStats(u);
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

  const handleSync = async () => {
    setSyncing(true);
    setSyncProgress(20);
    try {
      const result = await syncAllLeads();
      setSyncProgress(100);
      if (result.success) {
        antdMessage.success(`${result.count} lead başarıyla senkronize edildi.`);
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
    <div className="mb-8">
      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card className="bg-slate-900 border-none shadow-xl overflow-hidden relative h-full">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <DatabaseOutlined style={{ fontSize: '64px', color: '#fff' }} />
                </div>
                <Statistic 
                  title={<span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Toplam API Maliyeti (Bu Ay)</span>}
                  value={usageStats?.totalCost || 0}
                  precision={3}
                  prefix={<span className="text-slate-500 mr-1">$</span>}
                  styles={{ content: { color: '#fff', fontWeight: 'bold' } }}
                />
                <div className="mt-2 flex items-center gap-2">
                  <Tag color="cyan" size="small" className="text-[10px] border-none bg-cyan-500/20 text-cyan-400">Tahmini Harcama</Tag>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="bg-white dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 shadow-sm h-full">
                <Statistic 
                  title={<span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Google Places İstekleri</span>}
                  value={usageStats?.stats?.GOOGLE_PLACES?.count || 0}
                  styles={{ content: { fontWeight: 'bold' } }}
                  suffix={<span className="text-slate-400 text-sm ml-1">sorgu</span>}
                />
                <Progress 
                  percent={Math.min(((usageStats?.stats?.GOOGLE_PLACES?.count || 0) / 1000) * 100, 100)} 
                  size="small" 
                  showInfo={false} 
                  strokeColor="#4c6ef5"
                  className="mt-2"
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="bg-white dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 shadow-sm h-full">
                <Statistic 
                  title={<span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Resend E-posta Gönderimi</span>}
                  value={usageStats?.stats?.RESEND?.count || 0}
                  styles={{ content: { fontWeight: 'bold' } }}
                  suffix={<span className="text-slate-400 text-sm ml-1">adet</span>}
                />
                <Progress 
                  percent={Math.min(((usageStats?.stats?.RESEND?.count || 0) / 3000) * 100, 100)} 
                  size="small" 
                  showInfo={false} 
                  strokeColor="#f59f00"
                  className="mt-2"
                />
              </Card>
            </Col>
          </Row>

          {usageStats?.chartData?.length > 0 && (
            <Card 
              size="small" 
              className="mt-6 border-slate-100 dark:border-slate-800 bg-transparent"
              title={<span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Servis Bazlı Maliyet Dağılımı ($)</span>}
            >
              <div className="h-[200px] mt-4">
                <Column 
                  data={usageStats.chartData}
                  xField="service"
                  yField="cost"
                  colorField="service"
                  axis={{
                    x: { label: { style: { fontSize: 10 } } },
                    y: { label: { style: { fontSize: 10 } } }
                  }}
                  tooltip={{
                    channel: 'y',
                    valueFormatter: (v) => `$${v.toFixed(4)}`
                  }}
                  legend={false}
                  theme="classic"
                />
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );

  const integrationsContent = (
    <div className="space-y-4 py-4">
      {dashboardContent}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { name: "Google Places API", status: statuses.googlePlaces ? "CONNECTED" : "DISCONNECTED", icon: <ApiOutlined /> },
          { name: "Google Drive API", status: statuses.googleDrive ? "CONNECTED" : "DISCONNECTED", icon: <ApiOutlined /> },
          { name: "Resend Email API", status: statuses.resend ? "CONNECTED" : "DISCONNECTED", icon: <ApiOutlined /> },
          { name: "Prisma DB Engine", status: statuses.database ? "CONNECTED" : "DISCONNECTED", icon: <SettingOutlined /> },
        ].map((api) => (
          <Card key={api.name} size="small" className="border-slate-100 dark:border-slate-800 shadow-sm bg-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">{api.icon}</span>
                <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">{api.name}</span>
              </div>
              {api.status === "CONNECTED" ? (
                <Tag color="success" icon={<CheckCircleFilled />}>Bağlı</Tag>
              ) : (
                <Tag color="error" icon={<CloseCircleFilled />}>Bağlı Değil</Tag>
              )}
            </div>
          </Card>
        ))}
      </div>
      
      <Divider titlePlacement="left"><span className="text-[11px] font-bold text-slate-400 uppercase">Entegrasyon Durumu</span></Divider>
      <div className="max-w-md bg-slate-50 dark:bg-slate-800/50 p-4 rounded-md border border-slate-100 dark:border-slate-800">
        <Text className="text-[12px] text-slate-500 block leading-relaxed">
          Yukarıdaki durumlar sistemdeki <Text code>.env.local</Text> dosyasında tanımlı olan API anahtarlarının varlığına göre belirlenmektedir. 
          Eğer bir servis "Bağlı Değil" görünüyorsa, ilgili ortam değişkenini kontrol edin.
        </Text>
      </div>
    </div>
  );

  const dataMaintenanceContent = (
    <div className="py-6 max-w-2xl">
      <Card 
        size="small" 
        title={<span className="text-[12px] font-bold">Veri Bakımı ve Eşitleme</span>} 
        className="border-slate-100 dark:border-slate-800 bg-transparent"
      >
        <div className="space-y-4">
          <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed">
            Sistemdeki puanlama kuralları değiştiğinde veya veri tutarsızlığı oluştuğunda, tüm lead puanlarını yeniden hesaplayabilirsiniz.
            Bu işlem mevcut tüm kayıtları tarar ve yeni algoritmaya (Telefon: +10, Web: +5) göre günceller.
          </p>
          
          <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-md">
            <Text className="text-[12px] text-amber-700 dark:text-amber-400 block mb-2 font-bold">⚠️ DİKKAT</Text>
            <Text className="text-[11px] text-amber-600 dark:text-amber-500 block">
              Bu işlem veritabanı yoğunluğuna bağlı olarak birkaç saniye sürebilir. İşlem sırasında sayfayı kapatmamanız önerilir.
            </Text>
          </div>

          {syncing && (
            <div className="py-2">
              <Progress percent={syncProgress} size="small" status="active" strokeColor="hsl(var(--primary))" />
              <Text className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Veriler İşleniyor...</Text>
            </div>
          )}

          <div className="pt-4">
            <Button 
              type="primary" 
              icon={<SyncOutlined className={syncing ? 'animate-spin' : ''} />} 
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
          trackingEnabled: true
        }}
      >
        <Card size="small" title={<span className="text-[12px] font-bold">Puanlama ve Otomasyon</span>} className="border-slate-100">
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
                <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 mb-0">Otomatik SMS Gönderimi</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Yeni bir VIP lead algılandığında hoş geldin mesajı gönder.</p>
              </div>
              <Form.Item name="autoSms" valuePropName="checked" noStyle>
                <Switch />
              </Form.Item>
            </div>

            <Divider className="dark:border-slate-800" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 mb-0">Tıklama Takibi (Pixel)</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Link tıklamalarını ve etkileşimleri veritabanına kaydet.</p>
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
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Sistem Ayarları</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">CRM kurallarını ve API entegrasyonlarını yönetin</p>
      </div>

      <div className="bg-white dark:bg-slate-900/50 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm p-4">
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: "1",
              label: (
                <span className="flex items-center gap-2 px-2 py-1">
                  <ApiOutlined /> Entegrasyonlar
                </span>
              ),
              children: integrationsContent,
            },
            {
              key: "2",
              label: (
                <span className="flex items-center gap-2 px-2 py-1">
                  <SettingOutlined /> CRM Kuralları
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
    </div>
  );
}

import { Input } from "antd";
