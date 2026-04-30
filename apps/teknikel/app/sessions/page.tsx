"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Space,
  Button,
  Badge,
  Typography,
  Avatar,
  App,
  Card,
  Popconfirm,
  Result,
  Tooltip,
  Breadcrumb,
} from "antd";
import {
  HistoryOutlined,
  LogoutOutlined,
  SafetyOutlined,
  DesktopOutlined,
  SafetyCertificateOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { Shield, History, LogOut, ArrowLeft, Monitor } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  getUserSessions,
  killSession,
  killOtherSessions,
} from "../actions/system-actions";
import { useAuth } from "../../context/AuthContext";

const { Text, Title } = Typography;

export default function SessionsPage() {
  const { message } = App.useApp();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const router = useRouter();
  const user = session?.user;

  const loadSessions = async () => {
    setLoading(true);
    try {
      const res = await getUserSessions();
      if (res.success) {
        setSessions(res.data || []);
      } else {
        message.error("Oturumlar yüklenemedi: " + res.error);
      }
    } catch (error) {
      message.error("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadSessions();
  }, [user]);

  const handleKillSession = async (id: string) => {
    const hide = message.loading("Oturum sonlandırılıyor...", 0);
    try {
      const res = await killSession(id);
      hide();
      if (res.success) {
        message.success("Oturum başarıyla kapatıldı.");
        loadSessions();
      } else {
        message.error("Hata: " + res.error);
      }
    } catch (err) {
      hide();
      message.error("Bir hata oluştu.");
    }
  };

  const handleKillOthers = async () => {
    const hide = message.loading("Diğer oturumlar kapatılıyor...", 0);
    try {
      // Not: currentSessionToken client tarafında bilinmiyorsa backend mevcut olan hariç hepsini silsin
      // Actions dosyasında bu mantık kuruldu (NOT { sessionToken: current })
      // Şimdilik boş gönderiyoruz, backend tümünü silebilir veya session-token'ı cookie'den alabilir.
      const res = await killOtherSessions((user as any)?.sessionToken || "");
      hide();
      if (res.success) {
        message.success("Diğer tüm oturumlar sonlandırıldı.");
        loadSessions();
      } else {
        message.error("Hata: " + res.error);
      }
    } catch (err) {
      hide();
      message.error("Bir hata oluştu.");
    }
  };

  const columns = [
    {
      title: "Cihaz & Tarayıcı",
      key: "device",
      render: (_: any, record: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center text-slate-500">
            <Monitor size={16} />
          </div>
          <div className="flex flex-col">
            <Text className="text-[13px] font-bold text-slate-800 dark:text-white">
              Bilinmeyen Cihaz / Web Tarayıcı
            </Text>
            <Text className="text-[11px] text-slate-400">
              ID: {record.id.substring(0, 8)}...
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Son Erişim",
      dataIndex: "expires",
      key: "expires",
      render: (date: string) => (
        <div className="flex flex-col">
          <Text className="text-[12px]">
            {new Date(date).toLocaleDateString("tr-TR")}
          </Text>
          <Text className="text-[11px] text-slate-400">
            {new Date(date).toLocaleTimeString("tr-TR")}
          </Text>
        </div>
      ),
    },
    {
      title: "Durum",
      key: "status",
      render: (_: any, record: any) => (
        <Tag
          color="success"
          className="text-[10px] font-bold uppercase rounded border-none bg-emerald-50 text-emerald-600"
        >
          Aktif
        </Tag>
      ),
    },
    {
      title: "İşlem",
      key: "action",
      align: "right" as const,
      render: (_: any, record: any) => (
        <Popconfirm
          title="Oturumu Sonlandır"
          description="Bu cihazdaki oturumunuz kapatılacaktır. Devam etmek istiyor musunuz?"
          onConfirm={() => handleKillSession(record.id)}
          okText="Evet, Kapat"
          cancelText="İptal"
          okButtonProps={{ danger: true, size: "small" }}
          cancelButtonProps={{ size: "small" }}
        >
          <Button size="small" danger type="text" icon={<LogOut size={14} />}>
            Sonlandır
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const { user: authUser, loading: authLoading } = useAuth();
  const { status } = useSession();

  if (status === "loading" || authLoading) {
    return <div className="h-[60vh] flex items-center justify-center"><Badge status="processing" text="Oturum doğrulanıyor..." /></div>;
  }

  if (!user && !authUser) {
    console.log("Eksik Session Tespit Edildi (Sessions Page):", { sessionUser: user, authContextUser: authUser });
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Result
          status="403"
          title="Erişim Engellendi"
          subTitle="Oturum yönetimi için giriş yapmalısınız."
          extra={
            <Button type="primary" onClick={() => router.push("/login")}>
              Giriş Yap
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <Breadcrumb
            className="mb-2"
            items={[
              {
                title: <HomeOutlined onClick={() => router.push("/")} />,
                key: "home",
              },
              { title: "Hesap Ayarları", key: "account" },
              { title: "Oturum Yönetimi", key: "sessions" },
            ]}
          />
          <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
            <History className="text-primary" size={28} /> OTURUM{" "}
            <span className="text-primary">YÖNETİMİ</span>
          </h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            Aktif cihazlarınızı ve oturumlarınızı buradan yönetin
          </p>
        </div>
        <div className="bg-primary/5 border border-primary/10 p-2 px-4 rounded-md flex items-center gap-3 shadow-sm">
          <Shield className="text-primary" size={18} />
          <span className="text-[11px] font-bold text-primary uppercase tracking-tight">
            Cihaz Güvenliği Aktif
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card
            size="small"
            className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
            title={
              <div className="flex items-center justify-between w-full py-1">
                <span className="text-[12px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <SafetyCertificateOutlined className="text-emerald-500" />{" "}
                  Aktif Cihazlar ({sessions.length})
                </span>
                <Popconfirm
                  title="Tüm Diğer Oturumları Kapat"
                  description="Mevcut kullandığınız cihaz dışındaki tüm oturumlar sonlandırılacaktır. Emin misiniz?"
                  onConfirm={handleKillOthers}
                  okText="Evet, Hepsini Kapat"
                  okButtonProps={{ danger: true, size: "small" }}
                  cancelButtonProps={{ size: "small" }}
                >
                  <Button
                    size="small"
                    danger
                    type="link"
                    className="text-[11px] font-bold uppercase"
                  >
                    Tüm Diğerlerini Sonlandır
                  </Button>
                </Popconfirm>
              </div>
            }
          >
            <Table
              size="middle"
              columns={columns}
              dataSource={sessions}
              loading={loading}
              rowKey="id"
              pagination={false}
              className="custom-sessions-table"
            />
          </Card>

          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md mt-6">
            <h4 className="text-[12px] font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2 uppercase tracking-tight">
              <SafetyOutlined className="text-primary" /> Güvenlik İpucu
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Hesabınızın güvenliği için tanımadığınız cihazlardaki oturumları
              hemen sonlandırın. Eğer şüpheli bir oturum görürseniz, sadece
              oturumu kapatmakla kalmayın, ayrıca{" "}
              <b>Şifrenizi de değiştirmenizi</b> öneririz.
            </p>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <Card
            size="small"
            className="border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className="text-center py-4">
              <Avatar
                size={64}
                src={user?.image}
                className="bg-primary text-white border-4 border-white dark:border-slate-800 shadow-xl mb-3"
              />
              <h5 className="text-[14px] font-bold text-slate-800 dark:text-white leading-tight">
                {user?.name}
              </h5>
              <p className="text-[11px] text-slate-400 truncate px-2">
                {user?.email}
              </p>
            </div>
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Rol</span>
                  <Tag
                    color="error"
                    className="m-0 text-[10px] font-bold uppercase"
                  >
                    Admin
                  </Tag>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Aktif Oturum</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {sessions.length} Cihaz
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Button
            block
            icon={<ArrowLeft size={14} />}
            onClick={() => router.back()}
            className="font-bold text-[12px] mt-6"
          >
            Geri Dön
          </Button>
        </div>
      </div>

      <style jsx global>{`
        .custom-sessions-table .ant-table-thead > tr > th {
          background: transparent !important;
          font-size: 11px !important;
          color: #94a3b8 !important;
          border-bottom: 1px solid #f1f5f9 !important;
        }
        .dark .custom-sessions-table .ant-table-thead > tr > th {
          border-bottom: 1px solid #1e293b !important;
        }
      `}</style>
    </div>
  );
}
