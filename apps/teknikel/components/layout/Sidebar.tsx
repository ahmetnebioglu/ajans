"use client";

import React from "react";
import { Layout, Menu, Avatar, Dropdown, Badge, type MenuProps } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { signOut, useSession } from "next-auth/react";
import { 
  LayoutDashboard, 
  Search, 
  Crown, 
  Settings, 
  User, 
  LogOut,
  Bell,
  Zap,
  Moon,
  Sun,
  ShieldCheck,
  Users
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const { Sider } = Layout;

export default function Sidebar({ collapsed, onCollapse }: { collapsed: boolean; onCollapse: (val: boolean) => void }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { logout: authLogout } = useAuth();
  
  const isDark = theme === "dark" || (theme === "system" && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const menuItems: MenuProps['items'] = [
    { key: "/", icon: <LayoutDashboard size={18} />, label: "Durum Özeti" },
    { key: "/leads", icon: <Search size={18} />, label: "Yeni Adaylar" },
    { key: "/vip", icon: <Crown size={18} />, label: "Özel Müşteriler" },
    { type: "divider" },
    { key: "/settings", icon: <Settings size={18} />, label: "Sistem Ayarları" },
  ];

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      width={260}
      theme={isDark ? "dark" : "light"}
      className={`z-50 border-r ${isDark ? 'border-white/5' : 'border-slate-200'}`}
      style={{
        background: isDark ? "#020617" : "#ffffff",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div className="h-full flex flex-col">
        {/* BRAND LOGO */}
        <div className="p-6">
          <div className={`flex items-center gap-3 transition-all duration-300 ${collapsed ? 'justify-center' : ''}`}>
            <div 
              className="w-9 h-9 rounded-[4px] bg-primary flex items-center justify-center shadow-lg transform rotate-3 shrink-0 text-white"
              style={{ boxShadow: `0 8px 20px hsla(var(--primary), 0.4)` }}
            >
              <Zap size={18} />
            </div>
            {!collapsed && (
              <div className="animate-in fade-in duration-700">
                <div className={`${isDark ? 'text-white' : 'text-slate-900'} font-black text-base tracking-tighter uppercase italic whitespace-nowrap`}>
                  TEKNİKEL <span className="text-primary">KOMBİ</span>
                </div>
                <div className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'} font-bold uppercase tracking-widest mt-0.5`}>Yedek Parça Yönetim</div>
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
            items={menuItems}
            onClick={({ key }) => router.push(key as string)}
            className="border-none bg-transparent premium-unified-menu"
          />
        </div>

        {/* PROFILE SECTION */}
        <div className="p-3 border-t border-white/5 bg-transparent mt-auto">
          <div className={`flex items-center gap-2 ${collapsed ? 'flex-col' : ''}`}>
            <div className={`flex items-center gap-2 ${collapsed ? 'justify-center w-full' : 'flex-1 min-w-0'}`}>
              <Avatar 
                shape="square" 
                size={collapsed ? 36 : 30}
                className="bg-indigo-600 border border-white/10 shadow-md shrink-0"
                icon={<User size={16} />} 
              />
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className={`text-[11px] font-bold truncate leading-none mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {session?.user?.name || session?.user?.email || "Ahmet Teknikel"}
                  </div>
                  <div className="text-[10px] font-medium text-slate-500 truncate leading-none">
                    {(session?.user as any)?.role || "Kullanıcı"}
                  </div>
                </div>
              )}
            </div>

            <div className={`flex items-center gap-1 ${collapsed ? 'flex-col mt-2' : ''}`}>
              <Dropdown
                placement="topLeft"
                trigger={['click']}
                menu={{
                  items: [
                    {
                      key: '1',
                      label: (
                        <div className="py-1">
                          <div className={`text-[11px] font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Katalog Görüntülendi</div>
                          <div className="text-[10px] text-slate-500">Tekniker Isı kataloğunuzu inceledi.</div>
                        </div>
                      ),
                      icon: <Zap size={14} className="text-primary" />,
                    },
                    {
                      key: '2',
                      label: (
                        <div className="py-1">
                          <div className={`text-[11px] font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>E-posta Açıldı</div>
                          <div className="text-[10px] text-slate-500">Kombi Dünyası teklif mailini açtı.</div>
                        </div>
                      ),
                      icon: <Search size={14} className="text-emerald-500" />,
                    },
                    {
                      key: '3',
                      label: (
                        <div className="py-1">
                          <div className={`text-[11px] font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Yeni Leadler</div>
                          <div className="text-[10px] text-slate-500">Google taramasından 5 yeni sonuç geldi.</div>
                        </div>
                      ),
                      icon: <Crown size={14} className="text-amber-500" />,
                    },
                    { type: 'divider' },
                    {
                      key: 'all',
                      label: <div className="text-[10px] font-bold text-center text-primary">Tüm Bildirimleri Gör</div>,
                    }
                  ],
                  onClick: ({ key }) => {
                    if (key === 'all') router.push('/notifications');
                  },
                  className: `p-2 shadow-2xl rounded-md border ${isDark ? 'bg-zinc-950 border-white/5' : 'bg-white border-slate-100'}`
                }}
              >
                <Badge count={3} size="small" offset={[-2, 2]}>
                  <button 
                    className={`w-7 h-7 rounded ${isDark ? 'bg-zinc-900 hover:bg-zinc-800 text-slate-500' : 'bg-slate-50 hover:bg-slate-100 text-slate-500'} flex items-center justify-center transition-colors group`}
                  >
                    <Bell size={14} className="group-hover:animate-bounce" />
                  </button>
                </Badge>
              </Dropdown>
              <button 
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className={`w-7 h-7 rounded ${isDark ? 'bg-zinc-900 hover:bg-zinc-800 text-slate-500' : 'bg-slate-50 hover:bg-slate-100 text-slate-500'} flex items-center justify-center transition-colors group`}
              >
                {isDark ? <Sun size={14} className="text-amber-500" /> : <Moon size={14} className="text-indigo-400" />}
              </button>
              
              <Dropdown
                placement="topRight"
                trigger={['click']}
                menu={{
                  items: [
                    {
                      key: 'profile',
                      label: <span className="text-[12px] font-medium">Profili Düzenle</span>,
                      icon: <User size={14} />
                    },
                    {
                      key: 'sessions',
                      label: <span className="text-[12px] font-medium">Oturum Kontrolü</span>,
                      icon: <ShieldCheck size={14} />
                    },
                    ...((session?.user as any)?.role === 'ADMIN' ? [
                      {
                        key: 'users',
                        label: <span className="text-[12px] font-medium">Kullanıcı Yönetimi</span>,
                        icon: <Users size={14} />
                      }
                    ] : []),
                    { type: 'divider' },
                    {
                      key: 'logout',
                      label: <span className="text-[12px] font-bold text-rose-500">Oturumu Kapat</span>,
                      icon: <LogOut size={14} className="text-rose-500" />
                    }
                  ],
                  onClick: ({ key }) => {
                    if (key === 'profile') router.push('/profile');
                    if (key === 'sessions') router.push('/sessions');
                    if (key === 'users') router.push('/users');
                    if (key === 'logout') {
                      console.log("Logging out...");
                      // 1. Clear custom cookie for middleware
                      document.cookie = "auth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
                      // 2. Clear Context & LocalStorage
                      authLogout();
                      // 3. NextAuth SignOut & Redirect
                      signOut({ redirect: false }).then(() => {
                        window.location.href = "/login";
                      });
                    }
                  },
                  className: `p-2 shadow-2xl rounded-md border ${isDark ? 'bg-zinc-950 border-white/5' : 'bg-white border-slate-100'}`
                }}
              >
                <button 
                  className={`w-7 h-7 rounded ${isDark ? 'bg-zinc-900 hover:bg-zinc-800 text-slate-500' : 'bg-slate-50 hover:bg-slate-100 text-slate-500'} flex items-center justify-center transition-colors group`}
                >
                  <Settings size={14} className="group-hover:rotate-45 transition-transform duration-300" />
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
          height: 40px !important;
          line-height: 40px !important;
          margin-bottom: 4px !important;
          font-weight: 600 !important;
          font-size: 13px !important;
          border-radius: 4px !important;
          color: ${isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'} !important;
        }
        .premium-unified-menu.ant-menu .ant-menu-item:hover {
          color: ${isDark ? '#fff' : '#000'} !important;
          background: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} !important;
        }
        .premium-unified-menu.ant-menu .ant-menu-item-selected {
          background-color: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} !important;
          color: ${isDark ? '#fff' : 'hsl(var(--primary))'} !important;
          font-weight: 700 !important;
          position: relative;
        }
        .premium-unified-menu.ant-menu .ant-menu-item-selected::after {
          content: "";
          position: absolute;
          left: 0;
          top: 20%;
          height: 60%;
          width: 3px;
          background-color: hsl(var(--primary));
          border-radius: 0 4px 4px 0;
        }
      `}</style>
    </Sider>
  );
}
