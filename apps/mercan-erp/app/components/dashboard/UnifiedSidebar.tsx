"use client";

import React from "react";
import { Layout, Menu, Dropdown, Avatar, Tag, Divider, ConfigProvider, Switch, theme as antdTheme } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { 
  LayoutDashboard, 
  Building2, 
  FileBox, 
  Shield, 
  History, 
  Globe, 
  MessageSquare, 
  Users as UsersIcon,
  Home,
  Info,
  Newspaper,
  Settings,
  Zap,
  User,
  LogOut,
  ChevronUp,
  Layout as LayoutIcon,
  Bell,
  Briefcase,
  Calendar,
  Contact,
  LineChart,
  ClipboardList,
  Sun,
  Moon
} from "lucide-react";

const { Sider } = Layout;

interface UnifiedSidebarProps {
  module: "erp" | "cms" | "hr" | "crm";
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

const MODULE_CONFIG = {
  erp: {
    name: "ERP",
    color: "#2563eb", // blue-600
    icon: <LayoutDashboard size={20} />,
    items: [
      { key: "/dashboard", icon: <LayoutDashboard size={18} />, label: "Kokpit" },
      { key: "/dashboard/companies", icon: <Building2 size={18} />, label: "Firmalar" },
      { key: "/dashboard/reports", icon: <FileBox size={18} />, label: "Rapor Arşivi" },
      { key: "/dashboard/admin/users", icon: <Shield size={18} />, label: "Kullanıcılar" },
      { key: "/dashboard/logs", icon: <History size={18} />, label: "Sistem Günlüğü" },
    ]
  },
  cms: {
    name: "CMS",
    color: "#10b981", // emerald-600
    icon: <Globe size={20} />,
    items: [
      { key: "/dashboard/cms", icon: <LayoutDashboard size={18} />, label: "CMS Hub" },
      { key: "/dashboard/cms/homepage", icon: <Home size={18} />, label: "Ana Sayfa" },
      { key: "/dashboard/cms/about", icon: <Info size={18} />, label: "Kurumsal" },
      { key: "/dashboard/cms/services", icon: <LayoutIcon size={18} />, label: "Hizmetler" },
      { key: "/dashboard/cms/blog", icon: <Newspaper size={18} />, label: "Blog" },
      { key: "/dashboard/cms/settings", icon: <Settings size={18} />, label: "Ayarlar" },
    ]
  },
  hr: {
    name: "HR",
    color: "#9333ea", // purple-600
    icon: <UsersIcon size={20} />,
    items: [
      { key: "/dashboard/hr", icon: <LayoutDashboard size={18} />, label: "Özet Panosu" },
      { key: "/dashboard/hr/recruitment", icon: <UsersIcon size={18} />, label: "Aday Takip" },
      { key: "/dashboard/hr/jobs", icon: <Briefcase size={18} />, label: "İş İlanları" },
      { key: "/dashboard/hr/leaves", icon: <Calendar size={18} />, label: "İzin Yönetimi" },
    ]
  },
  crm: {
    name: "CRM",
    color: "#dc2626", // red-600
    icon: <MessageSquare size={20} />,
    items: [
      { key: "/dashboard/crm", icon: <LayoutDashboard size={18} />, label: "CRM Özet" },
      { key: "/dashboard/crm/leads", icon: <Contact size={18} />, label: "Müşteriler" },
      { key: "/dashboard/crm/deals", icon: <LineChart size={18} />, label: "Satış Hattı" },
      { key: "/dashboard/crm/offers", icon: <ClipboardList size={18} />, label: "Teklifler" },
    ]
  }
};

export default function UnifiedSidebar({ module, collapsed, onCollapse }: UnifiedSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const config = MODULE_CONFIG[module];
  const user = session?.user;

  const isDark = theme === "dark" || (theme === "system" && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const moduleSwitcherItems = [
    {
      key: 'modules',
      label: <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Modül Değiştirici</span>,
      type: 'group' as const,
      children: [
        { key: '/dashboard', label: 'MERCAN ERP', icon: <Zap size={14} className="text-blue-500" /> },
        { key: '/dashboard/cms', label: 'MERCAN CMS', icon: <Globe size={14} className="text-emerald-500" /> },
        { key: '/dashboard/hr', label: 'MERCAN HR', icon: <UsersIcon size={14} className="text-purple-500" /> },
        { key: '/dashboard/crm', label: 'MERCAN CRM', icon: <MessageSquare size={14} className="text-red-500" /> },
      ]
    },
    { type: 'divider' as const },
    { key: '/dashboard/profile', label: 'Profil Ayarları', icon: <User size={14} /> },
    { key: 'logout', label: 'Güvenli Çıkış', icon: <LogOut size={14} />, danger: true },
  ];

  const notificationItems = [
    {
      key: 'notif-group',
      type: 'group' as const,
      label: <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bildirimler</span>,
      children: [
        {
          key: 'notif-1',
          label: (
            <div className="py-1 min-w-[200px]">
              <div className="font-bold text-blue-500 uppercase text-[9px] leading-none mb-1">Sistem Güncellemesi</div>
              <div className="text-[11px] text-slate-300 font-medium italic">Yeni audit log sayfası yayına alındı.</div>
              <div className="text-[8px] text-slate-500 mt-1 uppercase font-black">Az önce</div>
            </div>
          ),
        },
        {
          key: 'notif-2',
          label: (
            <div className="py-1 min-w-[200px]">
              <div className="font-bold text-emerald-500 uppercase text-[9px] leading-none mb-1">Veri İhracı</div>
              <div className="text-[11px] text-slate-300 font-medium italic">Haftalık denetim raporu oluşturuldu.</div>
              <div className="text-[8px] text-slate-500 mt-1 uppercase font-black">2 saat önce</div>
            </div>
          ),
        },
      ]
    },
    { type: 'divider' as const },
    {
      key: 'all-notifs',
      label: (
        <div className="text-center py-1">
          <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em]">Tüm Bildirimleri Gör</span>
        </div>
      ),
      onClick: () => router.push("/dashboard/notifications")
    }
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      signOut({ callbackUrl: "/login" });
    } else {
      router.push(key);
    }
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      width={260}
      theme={isDark ? "dark" : "light"}
      className={`z-50 border-r ${isDark ? 'border-white/5' : 'border-slate-200'}`}
      style={{
        background: "transparent",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div className="h-full flex flex-col bg-transparent">
        {/* BRAND LOGO */}
        <div className="p-6">
          <div className={`flex items-center gap-3 transition-all duration-300 ${collapsed ? 'justify-center' : ''}`}>
            <div 
              className="w-10 h-10 rounded-[4px] flex items-center justify-center shadow-lg transform rotate-3 shrink-0 transition-colors duration-500"
              style={{ background: config.color, boxShadow: `0 8px 20px ${config.color}40` }}
            >
              {config.icon}
            </div>
            {!collapsed && (
              <div className="overflow-hidden animate-in fade-in duration-700">
                <div className="text-white font-black text-lg tracking-tighter uppercase leading-none italic whitespace-nowrap">
                  MERCAN <span style={{ color: config.color }}>{config.name}</span>
                </div>
                <div className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1 italic">Unified OS</div>
              </div>
            )}
          </div>
        </div>

        {/* MAIN NAV */}
        <div className="flex-1 overflow-y-auto px-3 py-4 hide-those-scrollbars">
          <Menu
            theme={isDark ? "dark" : "light"}
            mode="inline"
            selectedKeys={[pathname]}
            items={config.items}
            onClick={({ key }) => router.push(key)}
            className="border-none bg-transparent premium-unified-menu"
          />
        </div>

        {/* PROFILE CARD & NOTIFICATIONS */}
        <div className="p-4 border-t border-white/5 bg-transparent">
          <div className={`flex items-center gap-2 ${collapsed ? 'flex-col' : ''}`}>
            {/* NOTIFICATION BELL */}
            <div className="flex-shrink-0">
               <Dropdown
                 menu={{ items: notificationItems }}
                 trigger={['click']}
                 placement="topRight"
                 classNames={{ root: "premium-dropdown" }}
               >
                 <button className={`w-12 h-12 rounded-[4px] ${isDark ? 'bg-zinc-900 border-zinc-800 text-slate-500' : 'bg-white border-slate-200 text-slate-400'} border flex items-center justify-center hover:text-blue-500 transition-colors relative group`}>
                    <Bell size={20} />
                    <span className={`absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 ${isDark ? 'border-zinc-900' : 'border-white'} group-hover:animate-ping`} />
                 </button>
               </Dropdown>
            </div>

            {/* THEME SWITCHER */}
            <div className="flex-shrink-0">
              <button 
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className={`w-12 h-12 rounded-[4px] ${isDark ? 'bg-zinc-900 border-zinc-800 text-slate-500' : 'bg-white border-slate-200 text-slate-400'} border flex items-center justify-center hover:text-blue-500 transition-colors group`}
              >
                {isDark ? <Sun size={20} className="text-amber-500" /> : <Moon size={20} className="text-indigo-400" />}
              </button>
            </div>

            {/* PROFILE DROPDOWN */}
            <Dropdown
              menu={{ items: moduleSwitcherItems, onClick: handleMenuClick }}
              trigger={['click']}
              placement="topRight"
              classNames={{ root: "premium-dropdown" }}
            >
              <button className={`flex-1 h-12 flex items-center gap-3 px-2 rounded-[4px] ${isDark ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' : 'bg-white border-slate-200 hover:border-slate-300'} border transition-all text-left group ${collapsed ? 'justify-center' : ''}`}>
                <Avatar 
                  src={user?.image} 
                  shape="square" 
                  size={32}
                  className="bg-indigo-600 border border-white/10 shadow-md shrink-0"
                  icon={<User size={18} />} 
                />
                {!collapsed && (
                  <>
                    <div className="flex-1 min-w-0">
                      <div className={`text-[10px] font-black uppercase truncate tracking-tight leading-none mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{user?.name || "Kullanıcı"}</div>
                      <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest truncate leading-none">{((user as any)?.role || "USER")}</div>
                    </div>
                    <ChevronUp size={14} className={`${isDark ? 'text-slate-600' : 'text-slate-400'} group-hover:text-blue-500 transition-colors`} />
                  </>
                )}
              </button>
            </Dropdown>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .premium-unified-menu.ant-menu {
          background: transparent !important;
          border: none !important;
        }
        .premium-unified-menu.ant-menu .ant-menu-item {
          height: 48px !important;
          line-height: 48px !important;
          margin-bottom: 8px !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
          font-size: 10px !important;
          font-style: italic !important;
          border-radius: 6px !important;
           background: transparent !important;
           color: ${isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'} !important;
         }
         .premium-unified-menu.ant-menu .ant-menu-item:hover {
           color: ${isDark ? '#fff' : '#000'} !important;
           background: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} !important;
         }
         .premium-unified-menu.ant-menu .ant-menu-item-selected {
           background-color: transparent !important;
           color: ${isDark ? '#fff' : '#000'} !important;
           border: 1px solid ${config.color}50 !important;
           box-shadow: inset 0 0 10px ${config.color}20 !important;
           position: relative;
         }
         .premium-unified-menu.ant-menu .ant-menu-item-selected::after {
          content: "";
          position: absolute;
          left: 0;
          top: 20%;
          height: 60%;
          width: 3px;
          background-color: ${config.color};
          border-radius: 0 4px 4px 0;
          border: none !important;
        }
        .premium-dropdown .ant-dropdown-menu {
          background: ${isDark ? "#0f172a" : "#ffffff"} !important;
          border: 1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} !important;
          padding: 8px !important;
          box-shadow: 0 20px 50px ${isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.1)"} !important;
        }
        .premium-dropdown .ant-dropdown-menu-item {
          font-size: 11px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          padding: 10px 12px !important;
          border-radius: 4px !important;
          color: #94a3b8 !important;
        }
        .premium-dropdown .ant-dropdown-menu-item:hover {
          background: rgba(255,255,255,0.05) !important;
          color: #fff !important;
        }
      `}</style>
    </Sider>
  );
}
