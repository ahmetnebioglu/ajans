"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Space,
  Button,
  Input,
  Badge,
  Progress,
  Modal,
  Typography,
  Avatar,
  message as antdMessage,
  Form,
  notification,
  Spin,
  Statistic,
  Timeline,
  Skeleton,
  Switch,
} from "antd";
import {
  SearchOutlined,
  PhoneOutlined,
  EyeOutlined,
  StarOutlined,
  StarFilled,
} from "@ant-design/icons";
import {
  Radar,
  ScanSearch,
  MapPin,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  MousePointerClick,
  Eye,
  Search,
  MessageSquare,
  Globe,
  TrendingUp,
  History,
  UserPlus,
  ShieldCheck,
  Phone,
  Link,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { scheduleCall, toggleVipStatus, toggleCommunication, calculateLeadScore, checkChurnStatus } from "./actions";
import { syncAndScoreLeads } from "../actions/bilsoft-actions";
import { revalidateLeads } from "../actions/revalidate";

const { Text } = Typography;

export default function LeadsPage() {
  const router = useRouter();
  const [api, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [interactionsLoading, setInteractionsLoading] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [scannerForm] = Form.useForm();

  // Filter data based on search text
  const filteredData = data.filter((item: any) => {
    const searchLower = searchText.toLowerCase();
    return (
      item.companyName?.toLowerCase().includes(searchLower) ||
      item.name?.toLowerCase().includes(searchLower) ||
      item.website?.toLowerCase().includes(searchLower)
    );
  });

  // Load data from API
  const loadLeads = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/leads", { cache: "no-store" });
      const result = await response.json();
      if (result.success) {
        setData(result.data || []);
      } else {
        antdMessage.error("Veriler yüklenirken hata oluştu: " + result.error);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      antdMessage.error("Sunucuya ulaşılamadı, lütfen internetinizi kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  const fetchInteractions = async (id: string) => {
    setInteractionsLoading(true);
    try {
      const response = await fetch(`/api/leads/${id}/interactions`, {
        cache: "no-store",
      });
      const result = await response.json();
      if (result.success) {
        setInteractions(result.data.interactions || []);
      } else {
        setInteractions([]);
      }
    } catch (error) {
      console.error("Interactions error:", error);
      setInteractions([]);
    } finally {
      setInteractionsLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await revalidateLeads();
      await loadLeads();
      router.refresh();
      api.success({
        // @ts-ignore
        title: "Tablo Güncellendi",
        description: "Veritabanındaki en güncel veriler başarıyla yüklendi.",
        placement: "topRight",
        icon: <RotateCw className="text-blue-500" size={18} />,
      } as any);
    } finally {
      setRefreshing(false);
    }
  };

  const handleOpenModal = (lead: any) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
    fetchInteractions(lead.id);
  };

  const handleCall = async (id: string) => {
    const hide = antdMessage.loading("Arama planlanıyor...", 0);
    const res = await scheduleCall(id);
    hide();
    if (res.success) {
      antdMessage.success("Arama başarıyla planlandı.");
      setIsModalOpen(false);
    } else {
      antdMessage.error("Bir sorun çıktı: " + res.error);
    }
  };

  const handleToggleVip = async (id: string, currentStatus: string) => {
    const hide = antdMessage.loading("Güncelleniyor...", 0);
    const res = await toggleVipStatus(id, currentStatus);
    hide();
    if (res.success) {
      antdMessage.success(
        `Kayıt ${res.newStatus === "VIP" ? "VIP yapıldı" : "Normal statüye alındı"}.`,
      );
      loadLeads();
    } else {
      antdMessage.error("Bir sorun çıktı: " + res.error);
    }
  };

  const handleToggleCommunication = async (id: string) => {
    const res = await toggleCommunication(id);
    if (res.success) {
      antdMessage.success("İletişim izni güncellendi.");
      loadLeads();
      if (selectedLead) setSelectedLead({ ...selectedLead, communicationOptIn: res.enabled });
    }
  };

  const handleChurnCheck = async (id: string) => {
    const hide = antdMessage.loading("Churn analizi yapılıyor...", 0);
    const res = await checkChurnStatus(id);
    hide();
    if (res.churn) {
      api.warning({
        // @ts-ignore
        title: "Kayıp Müşteri Riski!",
        description: `Bu müşteri ${res.days} gündür pasif. Otomatik geri kazanım SMS'i gönderildi.`,
        icon: <AlertCircle className="text-amber-500" />
      } as any);
      loadLeads();
    } else {
      antdMessage.success("Müşteri aktif durumda.");
    }
  };

  const handleCalculateScore = async (id: string) => {
    const res = await calculateLeadScore(id);
    if (res.success) {
      antdMessage.success(`Yeni skor hesaplandı: ${res.score}`);
      loadLeads();
    }
  };

  const handleBilsoftSync = async () => {
    setIsSyncing(true);
    try {
      const res = await syncAndScoreLeads();
      if (res.success) {
        antdMessage.success(`Eşleştirme tamamlandı: ${res.matchedCount} müşteri Bilsoft ile eşleşti.`);
        await loadLeads();
        router.refresh();
      } else {
        antdMessage.error(res.message);
      }
    } catch (error) {
      antdMessage.error("Senkronizasyon sırasında hata oluştu.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleStartScrape = async (values: any) => {
    setIsScraping(true);
    try {
      const response = await fetch("/api/leads/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (response.ok) {
        await revalidateLeads();
        await loadLeads();
        api.success({
          // @ts-ignore
          title: "Tarama Başarılı",
          description: `${result.count || 0} yeni lead bulundu ve sisteme eklendi.`,
          placement: "topRight",
          icon: <CheckCircle2 className="text-emerald-500" />,
        } as any);
        setIsScannerOpen(false);
        scannerForm.resetFields();
        router.refresh();
      } else {
        api.error({
          // @ts-ignore
          title: "Tarama Hatası",
          description:
            result.error ||
            "Google Places verileri çekilirken bir sorun oluştu.",
          icon: <AlertCircle className="text-rose-500" />,
        } as any);
      }
    } catch (error) {
      api.error({
        // @ts-ignore
        title: "Bağlantı Hatası",
        description: "Sunucuya ulaşılamadı, lütfen internetinizi kontrol edin.",
      } as any);
    } finally {
      setIsScraping(false);
    }
  };

  const getTimelineItems = () => {
    if (!selectedLead) return [];

    const items: any[] = [];

    // Veritabanından gelen etkileşimleri işle ve özet/mükerrer logları filtrele
    interactions
      .filter(
        (int) =>
          int.type !== "PROFILE_COMPLETION" &&
          !(
            int.description && int.description.includes("Sistem güncellenerek")
          ),
      )
      .forEach((int) => {
        let icon = <Eye size={14} className="text-orange-400" />;
        let title = "Etkileşim";
        let color = "orange";
        let displayScore =
          int.scoreAdded > 0 ? `[+${int.scoreAdded} Puan]` : "";

        if (int.type === "CREATED") {
          icon = <UserPlus size={14} className="text-slate-400" />;
          title = "Sisteme Eklendi";
          color = "gray";
        } else if (int.type === "PROFILE_PHONE") {
          icon = <Phone size={14} className="text-blue-500" />;
          title = "İletişim: Telefon";
          color = "blue";
        } else if (int.type === "PROFILE_WEB") {
          icon = <Link size={14} className="text-indigo-500" />;
          title = "İletişim: Web";
          color = "indigo";
        } else if (int.type === "PROFILE_COMPLETION") {
          icon = <ShieldCheck size={14} className="text-blue-500" />;
          title = "Profil Analizi";
          color = "blue";
        } else if (int.type === "CLICK") {
          icon = <MousePointerClick size={14} className="text-emerald-500" />;
          title = "Katalog Tıklaması";
          color = "green";
        } else if (int.type === "OPEN") {
          icon = <Eye size={14} className="text-orange-400" />;
          title = "Mail Açıldı";
          color = "orange";
        }

        items.push({
          color: color,
          dot: icon,
          children: (
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Text
                  className={`text-[11px] font-bold uppercase ${
                    color === "green"
                      ? "text-emerald-600"
                      : color === "blue"
                        ? "text-blue-600"
                        : color === "indigo"
                          ? "text-indigo-600"
                          : color === "orange"
                            ? "text-orange-500"
                            : "text-slate-500"
                  }`}
                >
                  {title}
                </Text>
                {int.scoreAdded > 0 && (
                  <span className="text-[11px] font-bold text-emerald-500">
                    {displayScore}
                  </span>
                )}
              </div>
              <Text className="text-[12px] text-slate-600 dark:text-slate-300 leading-tight">
                {int.description || "İşlem detay bilgisi yok."}
              </Text>
              <Text className="text-[10px] text-slate-400 mt-1">
                {new Date(int.lastSeen).toLocaleDateString("tr-TR")}{" "}
                {new Date(int.lastSeen).toLocaleTimeString("tr-TR")}
              </Text>
            </div>
          ),
        });
      });

    return items;
  };

  const columns = [
    {
      title: "Dükkan & Usta Adı",
      dataIndex: "companyName",
      key: "companyName",
      sorter: (a: any, b: any) =>
        (a.companyName || "").localeCompare(b.companyName || ""),
      render: (text: string, record: any) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={32}
            className="bg-slate-100 dark:bg-blue-900/30 text-blue-600 font-bold shrink-0 rounded"
          >
            {text ? text[0] : "L"}
          </Avatar>
          <div className="flex flex-col">
            <Text className="text-[13px] font-semibold text-slate-800 dark:text-white leading-tight">
              {text || "İsimsiz Firma"}
            </Text>
            <Text className="text-[11px] text-slate-400 dark:text-slate-500">
              {record.name || "Bilinmiyor"}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Nereden Geldi",
      dataIndex: "source",
      key: "source",
      render: (source: string, record: any) => (
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-700 w-fit">
            {source}
          </span>
          {record.tags?.map((tag: string) => (
            <Tag key={tag} className="text-[9px] font-black border-none bg-emerald-500/10 text-emerald-600 m-0 w-fit px-1">
              {tag}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: "Güven Puanı",
      dataIndex: "score",
      key: "score",
      sorter: (a: any, b: any) => a.score - b.score,
      render: (score: number) => (
        <div className="w-24">
          <Progress
            percent={score}
            size="small"
            strokeColor="hsl(var(--primary))"
          />
        </div>
      ),
    },
    {
      title: "Mevcut Durum",
      dataIndex: "status",
      key: "status",
      sorter: (a: any, b: any) =>
        (a.status || "").localeCompare(b.status || ""),
      render: (status: string, record: any) => {
        const displayStatus = status || 'PROSPECT';
        return (
          <div className="flex flex-col gap-1">
            <Tag color={displayStatus === 'CHURN_ALARM' ? 'warning' : 'blue'} className="text-[10px] font-bold uppercase rounded m-0 w-fit">
              {displayStatus === 'PROSPECT' ? 'Yeni Aday' : displayStatus === 'ACTIVE' ? 'Aktif Müşteri' : displayStatus === 'CHURN_ALARM' ? 'Pasifleşmiş' : displayStatus}
            </Tag>
            {record.communicationOptIn === false && (
              <Tag color="default" className="text-[9px] font-bold uppercase rounded m-0 w-fit opacity-60">
                MESAJ İSTEMİYOR
              </Tag>
            )}
          </div>
        );
      },
    },
    {
      title: "İşlem",
      key: "action",
      render: (_: any, record: any) => (
        <Space size="small">
          <Button
            size="small"
            type="text"
            icon={
              record.status === "VIP" ? (
                <StarFilled className="text-amber-500" />
              ) : (
                <StarOutlined className="text-slate-400" />
              )
            }
            onClick={() => handleToggleVip(record.id, record.status)}
          />
          <Button
            size="small"
            type="text"
            icon={<EyeOutlined size={14} className="text-slate-400" />}
            onClick={() => handleOpenModal(record)}
          />
          <Button
            size="small"
            type="primary"
            icon={<PhoneOutlined size={14} />}
            onClick={() => handleCall(record.id)}
            className="bg-primary"
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6 animate-in fade-in duration-700">
      {contextHolder}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">
            Yeni Adaylar (Potansiyel Müşteriler)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Google üzerinden taranan usta ve dükkan listesi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            size="small"
            prefix={<SearchOutlined size={14} className="text-slate-400" />}
            placeholder="Ara..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            className="w-40 dark:bg-slate-900 dark:border-slate-800"
          />
          <Button
            icon={
              <RotateCw
                size={14}
                className={refreshing ? "animate-spin" : ""}
              />
            }
            size="small"
            onClick={handleRefresh}
            loading={refreshing}
            className="flex items-center justify-center"
          >
            Listeyi Güncelle
          </Button>
          <Button
            type="primary"
            icon={<Radar size={14} />}
            size="small"
            className="bg-primary shadow-md hover:shadow-lg transition-all"
            onClick={() => setIsScannerOpen(true)}
          >
            Google'dan Usta Tara
          </Button>
          <Button
            type="default"
            icon={<ShieldCheck size={14} className={isSyncing ? "animate-pulse" : ""} />}
            size="small"
            onClick={handleBilsoftSync}
            loading={isSyncing}
            className="border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            Muhasebe Senkronizasyon
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/50 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <Table
          size="small"
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </div>

      {/* LEAD SCANNER MODAL */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 dark:bg-primary/20 text-primary rounded flex items-center justify-center">
              <ScanSearch size={18} />
            </div>
            <span className="text-[14px] font-bold">
              Google'dan Yeni Usta ve Dükkan Bul
            </span>
          </div>
        }
        open={isScannerOpen}
        onCancel={() => !isScraping && setIsScannerOpen(false)}
        footer={[
          <Button
            key="cancel"
            size="small"
            onClick={() => setIsScannerOpen(false)}
            disabled={isScraping}
          >
            İptal
          </Button>,
          <Button
            key="submit"
            size="small"
            type="primary"
            loading={isScraping}
            icon={<Radar size={14} />}
            onClick={() => scannerForm.submit()}
            className="bg-primary"
          >
            Taramayı Başlat
          </Button>,
        ]}
        centered
        width={450}
      >
        <div className="py-4">
          <Form
            form={scannerForm}
            layout="vertical"
            onFinish={handleStartScrape}
            disabled={isScraping}
          >
            <Form.Item
              label={
                <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                  Anahtar Kelime (Sektör)
                </span>
              }
              name="query"
              rules={[{ required: true, message: "Lütfen bir sektör girin" }]}
            >
              <Input
                prefix={<SearchOutlined size={14} className="text-slate-400" />}
                placeholder="Örn: Kombi Servisi, Tesisatçı..."
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                  Lokasyon (İlçe/İl)
                </span>
              }
              name="location"
              rules={[{ required: true, message: "Lütfen bir lokasyon girin" }]}
            >
              <Input
                prefix={<MapPin size={14} className="text-slate-400" />}
                placeholder="Örn: Kadıköy, İstanbul..."
              />
            </Form.Item>
          </Form>

          {isScraping && (
            <div className="mt-4 p-4 bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 rounded-md flex items-center gap-4 animate-pulse">
              <Spin size="small" />
              <div className="text-[12px] text-primary dark:text-primary/80 font-medium">
                Google üzerinden firmalar taranıyor, bu işlem birkaç saniye
                sürebilir...
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* ENHANCED DETAIL MODAL */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 dark:bg-primary/20 text-primary rounded flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
            <span className="text-[14px] font-bold">
              Dükkan Analizi ve Güven Geçmişi
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="back" size="small" onClick={() => setIsModalOpen(false)}>
            Kapat
          </Button>,
          <Button
            key="churn"
            size="small"
            icon={<AlertCircle size={14} />}
            onClick={() => handleChurnCheck(selectedLead?.id)}
          >
            Hareketsiz mi?
          </Button>,
          <Button
            key="score"
            size="small"
            icon={<TrendingUp size={14} />}
            onClick={() => handleCalculateScore(selectedLead?.id)}
          >
            Skor Yenile
          </Button>,
          <Button
            key="submit"
            size="small"
            type="primary"
            icon={<PhoneOutlined size={14} />}
            onClick={() => handleCall(selectedLead?.id)}
            disabled={!selectedLead?.communicationOptIn}
            className="bg-primary"
          >
            Şimdi Ara
          </Button>,
        ]}
        width={850}
        centered
      >
        {selectedLead && (
          <div className="py-4 grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* LEFT COLUMN: BASIC INFO */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-md border border-slate-100 dark:border-slate-800">
                <div className="mb-4">
                  <Statistic
                    title={
                      <span className="text-[11px] font-bold text-slate-400 uppercase">
                        Toplam Skor
                      </span>
                    }
                    value={selectedLead.score}
                    precision={0}
                    styles={{
                      content: {
                        color:
                          selectedLead.score > 80
                            ? "#f43f5e"
                            : "hsl(var(--primary))",
                        fontWeight: "800",
                        fontSize: "32px",
                      }
                    }}
                    prefix={<TrendingUp size={24} className="mb-1" />}
                    suffix={
                      <span className="text-xs text-slate-400 font-medium">
                        / 100
                      </span>
                    }
                  />
                  <Progress
                    percent={selectedLead.score}
                    size="small"
                    showInfo={false}
                    strokeColor={
                      selectedLead.score > 80
                        ? "#f43f5e"
                        : "hsl(var(--primary))"
                    }
                    className="mt-1"
                  />
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      Firma
                    </p>
                    <p className="text-[13px] font-bold text-slate-800 dark:text-white leading-tight">
                      {selectedLead.companyName}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      Yetkili
                    </p>
                    <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                      {selectedLead.name || "Bilinmiyor"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-md border border-primary/20 dark:border-primary/30 text-[12px]">
                <p className="text-[10px] font-bold text-primary uppercase mb-2 flex items-center gap-1">
                  <Globe size={10} /> İletişim & Güvenlik
                </p>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">İletişim İzni:</span>
                    <Switch 
                      size="small" 
                      checked={selectedLead.communicationOptIn}
                      onChange={() => handleToggleCommunication(selectedLead.id)}
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Telefon:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {selectedLead.phone || "Yok"}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-slate-500">Web:</span>
                    <span className="font-bold text-right truncate max-w-[150px]">
                      {selectedLead.website ? (
                        <a
                          href={selectedLead.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {selectedLead.website
                            .replace("https://", "")
                            .replace("http://", "")}
                        </a>
                      ) : (
                        "Yok"
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: TIMELINE */}
            <div className="lg:col-span-3">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                <History size={16} className="text-slate-400" />
                <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">
                  Etkileşim ve Puan Analizi
                </span>
              </div>

              <div className="max-h-[400px] overflow-y-auto pr-2 hide-those-scrollbars">
                {interactionsLoading ? (
                  <div className="space-y-4">
                    <Skeleton active paragraph={{ rows: 2 }} />
                    <Skeleton active paragraph={{ rows: 2 }} />
                  </div>
                ) : (
                  <Timeline
                    mode="start"
                    items={getTimelineItems()}
                    className="mt-4 custom-lead-timeline"
                  />
                )}

                {!interactionsLoading && interactions.length === 0 && (
                  <div className="py-10 text-center">
                    <Text className="text-[12px] text-slate-400">
                      Henüz bir etkileşim kaydı bulunmuyor.
                    </Text>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <style jsx global>{`
        .custom-lead-timeline .ant-timeline-item-label {
          width: 0px !important;
          padding: 0 !important;
        }
        .custom-lead-timeline .ant-timeline-item-content {
          margin-left: 28px !important;
        }
      `}</style>
    </div>
  );
}
