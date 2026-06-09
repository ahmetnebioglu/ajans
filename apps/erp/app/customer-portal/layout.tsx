"use client";

import React, { useState, useEffect } from "react";
import {
  Layout,
  ConfigProvider,
  theme as antdTheme,
  Select,
  Avatar,
  Button,
  Card,
  Divider,
} from "antd";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import CustomerSidebar from "../components/dashboard/CustomerSidebar";
import {
  Building2,
  Globe,
  Bell,
  ShieldCheck,
  ArrowRight,
  User,
} from "lucide-react";
import {
  getCustomerCompanies,
  setActiveCompany,
} from "../actions/customer-actions";

const { Content, Header } = Layout;

function CustomerLoginView() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signIn("credentials", {
      email,
      password: "test",
      callbackUrl: "/customer-portal",
      redirect: true,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 italic font-medium">
      <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-indigo-600 rounded-[4px] flex items-center justify-center text-white mx-auto shadow-2xl rotate-3">
            <Building2 size={32} />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
              MÜŞTERİ PORTALI
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em]">
              ERP UNIFIED OS | SECURE ACCESS
            </p>
          </div>
        </div>

        <Card className="shadow-2xl border-slate-200 dark:border-zinc-800 dark:bg-zinc-900 p-4 relative overflow-hidden group">
          <ShieldCheck className="absolute -right-6 -bottom-6 text-indigo-50 dark:text-indigo-900/10 w-32 h-32 -rotate-12 transition-transform group-hover:rotate-0 duration-700" />

          <div className="space-y-6 relative z-10">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                PORTAL GİRİŞİ
              </h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">
                Devam etmek için kayıtlı e-posta adresinizi girin.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  E-POSTA ADRESİ
                </label>
                <input
                  type="email"
                  placeholder="customer@erp.test"
                  className="w-full p-4 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-[4px] text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white italic"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="h-14 bg-indigo-600 hover:bg-indigo-500 border-none font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20"
              >
                SİSTEME GİRİŞ YAP <ArrowRight size={18} className="ml-2" />
              </Button>
            </form>

            <div className="pt-4 text-center">
              <p className="text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest leading-loose">
                Bu alan sadece yetkili müşteriler içindir. <br /> Erişim
                sorunları için destek birimine başvurun.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function CustomerPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const { theme } = useTheme();
  const router = useRouter();
  const [companies, setCompanies] = useState<any[]>([]);
  const [activeCompany, setActiveCompanyId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (status === "authenticated") {
      const loadCompanies = async () => {
        const res = await getCustomerCompanies();
        if (res.success) {
          setCompanies(res.data || []);
          if (res.data?.length > 0) setActiveCompanyId(res.data[0].id);
        }
      };
      loadCompanies();
    }
  }, [status]);

  const handleCompanyChange = async (value: string) => {
    setActiveCompanyId(value);
    await setActiveCompany(value);
    router.refresh();
  };

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  if (!mounted || status === "loading") return null;

  // Dedicated Login Experience within the Portal
  if (status === "unauthenticated") {
    return (
      <ConfigProvider
        theme={{
          algorithm: isDark
            ? antdTheme.darkAlgorithm
            : antdTheme.defaultAlgorithm,
        }}
      >
        <CustomerLoginView />
      </ConfigProvider>
    );
  }

  // RBAC for logged in users
  if (
    session?.user &&
    (session.user as any).role !== "CUSTOMER" &&
    (session.user as any).role !== "ADMIN"
  ) {
    router.replace("/unauthorized");
    return null;
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#4f46e5",
          borderRadius: 4,
          fontFamily: "inherit",
          colorBgContainer: isDark ? "#0f172a" : "#ffffff",
          colorBgLayout: isDark ? "#020617" : "#f8fafc",
        },
        algorithm: isDark
          ? antdTheme.darkAlgorithm
          : antdTheme.defaultAlgorithm,
      }}
    >
      <Layout style={{ minHeight: "100vh" }}>
        <CustomerSidebar collapsed={collapsed} onCollapse={setCollapsed} />

        <Layout
          style={{ marginLeft: collapsed ? 80 : 240, transition: "all 0.2s" }}
        >
          <Header
            className={`px-6 flex items-center justify-between ${isDark ? "bg-slate-900/50 border-white/5" : "bg-white border-slate-200"} border-b h-16 sticky top-0 z-40 backdrop-blur-md`}
          >
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Aktif Firma:
              </span>
              <Select
                value={activeCompany}
                onChange={handleCompanyChange}
                className="min-w-[200px]"
                options={companies.map((c) => ({
                  value: c.id,
                  label: (
                    <span className="font-bold text-[11px] uppercase tracking-tighter italic">
                      {c.name}
                    </span>
                  ),
                }))}
                suffixIcon={<Building2 size={14} className="text-indigo-500" />}
                loading={companies.length === 0}
              />
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 text-slate-400 hover:text-indigo-500 transition-colors">
                <Bell size={20} />
              </button>
              <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800" />
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] font-black uppercase text-slate-900 dark:text-white leading-none">
                    {session?.user?.name}
                  </div>
                  <div className="text-[8px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">
                    Premium Üye
                  </div>
                </div>
                <Avatar
                  src={session?.user?.image}
                  shape="square"
                  className="bg-indigo-600"
                />
              </div>
            </div>
          </Header>

          <Content className="p-6">
            <div className="max-w-7xl mx-auto">{children}</div>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
