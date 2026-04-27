"use client";

import React, { useState, useEffect } from "react";
import { Layout, Menu, Avatar, Dropdown, theme as antdTheme, ConfigProvider } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { 
  LayoutDashboard, 
  Building2, 
  User, 
  LogOut, 
  ChevronUp,
  Settings,
  Bell,
  Building
} from "lucide-react";

const { Sider } = Layout;

export default function CustomerSidebar({ collapsed, onCollapse }: { collapsed: boolean; onCollapse: (v: boolean) => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { theme } = useTheme();
  const user = session?.user;

  const isDark = theme === "dark" || (theme === "system" && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const menuItems = [
    { key: "/customer-portal", icon: <LayoutDashboard size={18} />, label: "Özet Panosu" },
    { key: "/customer-portal/companies", icon: <Building2 size={18} />, label: "Firmalarım" },
    { key: "/customer-portal/settings", icon: <Settings size={18} />, label: "Hesap Ayarları" },
  ];

  const profileItems = [
    { key: '/customer-portal/profile', label: 'Profilim', icon: <User size={14} /> },
    { key: 'logout', label: 'Çıkış Yap', icon: <LogOut size={14} />, danger: true },
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
      width={240}
      theme={isDark ? "dark" : "light"}
      className={`border-r ${isDark ? 'border-white/5' : 'border-slate-200'}`}
      style={{ background: isDark ? "#020617" : "#ffffff", height: "100vh", position: "fixed", left: 0, top: 0 }}
    >
      <div className="h-full flex flex-col">
        <div className="p-6">
           <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
              <div className="w-10 h-10 bg-indigo-600 rounded-[4px] flex items-center justify-center text-white shadow-lg">
                 <Building size={20} />
              </div>
              {!collapsed && (
                <div className="animate-in fade-in duration-500">
                   <div className={`text-sm font-black tracking-tighter uppercase leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>MÜŞTERİ</div>
                   <div className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest leading-none mt-1">PORTALI</div>
                </div>
              )}
           </div>
        </div>

        <div className="flex-1 px-3">
          <Menu
            theme={isDark ? "dark" : "light"}
            mode="inline"
            selectedKeys={[pathname]}
            items={menuItems}
            onClick={({ key }) => router.push(key)}
            className="border-none bg-transparent"
          />
        </div>

        <div className="p-4 border-t border-white/5">
           <Dropdown menu={{ items: profileItems, onClick: handleMenuClick }} placement="topRight">
              <button className={`w-full flex items-center gap-3 p-2 rounded-[4px] hover:bg-slate-100 dark:hover:bg-zinc-900 transition-all ${collapsed ? 'justify-center' : ''}`}>
                 <Avatar src={user?.image} shape="square" size={32} icon={<User size={18} />} />
                 {!collapsed && (
                   <div className="flex-1 text-left min-w-0">
                      <div className={`text-[10px] font-black uppercase truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{user?.name}</div>
                      <div className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Müşteri</div>
                   </div>
                 )}
              </button>
           </Dropdown>
        </div>
      </div>
    </Sider>
  );
}
