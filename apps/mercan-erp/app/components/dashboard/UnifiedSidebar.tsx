"use client";

import React from "react";
import { Layout, Menu, Dropdown, Avatar, Tag, Divider, ConfigProvider, Switch, theme as antdTheme, type MenuProps } from "antd";
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
  const userRole = (user as any)?.role;

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
    { key: '/dashboard/profile/sessions', label: 'Oturum Yönetimi', icon: <History size={14} /> },
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
              className="w-10 h-10 rounded-[4px] flex items-center justify-center shadow-lg transform rotate-3 shrink-0 transition-colors duration-500 text-white"
              style={{ background: config.color, boxShadow: `0 8px 20px ${config.color}40` }}
            >
              {config.icon}
            </div>
            {!collapsed && (
              <div className="overflow-hidden animate-in fade-in duration-700">
                <div className={`${isDark ? 'text-white' : 'text-slate-900'} font-black text-lg tracking-tighter uppercase leading-none italic whitespace-nowrap`}>
                  MERCAN <span style={{ color: config.color }}>{config.name}</span>
                </div>
                <div className={`text-[8px] ${isDark ? 'text-slate-500' : 'text-slate-400'} font-bold uppercase tracking-[0.3em] mt-1 italic`}>Unified OS</div>
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
            items={[
              ...config.items,
              ...(userRole === "ADMIN" ? [
                { type: 'divider' } as const,
                {
                  key: 'system-group',
                  label: <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sistem Yönetimi</span>,
                  type: 'group',
                  children: [
                    { key: "/dashboard/system/users", icon: <Shield size={18} />, label: "Kullanıcılar" },
                    { key: "/dashboard/logs", icon: <History size={18} />, label: "Sistem Günlüğü" },
                  ]
                } as any
              ] : [])
            ] as MenuProps['items']}
            onClick={({ key }) => router.push(key as string)}
            className="border-none bg-transparent premium-unified-menu"
          />
        </div>

        {/* PROFILE SECTION - DISCORD STYLE */}
        <div className="p-3 border-t border-white/5 bg-transparent">
          <div className={`flex items-center gap-2 ${collapsed ? 'flex-col' : ''}`}>
            {/* STATIC PROFILE INFO */}
            <div className={`flex items-center gap-2 ${collapsed ? 'justify-center w-full' : 'flex-1 min-w-0'}`}>
              <Avatar 
                src={user?.image} 
                shape="square" 
                size={collapsed ? 36 : 32}
                className="bg-indigo-600 border border-white/10 shadow-md shrink-0"
                icon={<User size={18} />} 
              />
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className={`text-[10px] font-black uppercase truncate tracking-tight leading-none mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {user?.name || "Kullanıcı"}
                  </div>
                  <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest truncate leading-none">
                    {(userRole || "USER")}
                  </div>
                </div>
              )}
            </div>

            {/* ACTION BUTTONS (Discord style mini buttons) */}
            <div className={`flex items-center gap-1 ${collapsed ? 'flex-col mt-2' : ''}`}>
              {/* NOTIFICATIONS */}
              <Dropdown
                menu={{ items: notificationItems }}
                trigger={['click']}
                placement="topRight"
                classNames={{ root: "premium-dropdown" }}
              >
                <button className={`w-8 h-8 rounded-[4px] ${isDark ? 'bg-zinc-900 hover:bg-zinc-800 text-slate-500' : 'bg-slate-50 hover:bg-slate-100 text-slate-500'} flex items-center justify-center transition-colors relative group`}>
                  <Bell size={16} />
                  <span className={`absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-${isDark ? 'zinc-900' : 'white'} group-hover:animate-ping`} />
                </button>
              </Dropdown>

              {/* THEME */}
              <button 
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className={`w-8 h-8 rounded-[4px] ${isDark ? 'bg-zinc-900 hover:bg-zinc-800 text-slate-500' : 'bg-slate-50 hover:bg-slate-100 text-slate-500'} flex items-center justify-center transition-colors group`}
              >
                {isDark ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} className="text-indigo-400" />}
              </button>

              {/* MODULE SWITCHER (SETTINGS) */}
              <Dropdown
                menu={{ items: moduleSwitcherItems, onClick: handleMenuClick }}
                trigger={['click']}
                placement="topRight"
                classNames={{ root: "premium-dropdown" }}
              >
                <button className={`w-8 h-8 rounded-[4px] ${isDark ? 'bg-zinc-900 hover:bg-zinc-800 text-slate-500' : 'bg-slate-50 hover:bg-slate-100 text-slate-500'} flex items-center justify-center transition-colors group`}>
                  <Settings size={16} className="group-hover:rotate-45 transition-transform duration-300" />
                </button>
              </Dropdown>
            </div>
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
          border: 1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.1)"} !important;
          padding: 8px !important;
          box-shadow: 0 20px 50px ${isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.05)"} !important;
        }
         .premium-dropdown .ant-dropdown-menu-item {
          font-size: 11px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          padding: 10px 12px !important;
          border-radius: 4px !important;
          color: ${isDark ? '#94a3b8' : '#64748b'} !important;
        }
        .premium-dropdown .ant-dropdown-menu-item:hover {
          background: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} !important;
          color: ${isDark ? '#fff' : '#000'} !important;
        }
      `}</style>
    </Sider>
  );
}
