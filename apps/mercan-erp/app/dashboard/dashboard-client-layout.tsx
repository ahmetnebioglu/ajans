"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NotificationCenter from "../components/dashboard/NotificationCenter";
import {
  LayoutDashboard,
  Building2,
  FileBox,
  History,
  Menu,
  X,
  Home,
  Info,
  LogOut,
  TrendingUp,
  Shield,
  Monitor,
  ChevronUp,
  HardDrive,
  Mail as MailIcon,
  Globe,
  ExternalLink,
  Users as UsersIcon,
  Sun,
  Moon,
  UserCircle,
  Zap,
  PlusSquare,
  PenLine,
  Eye,
  Layout as LayoutIcon,
  Newspaper,
  Share2,
  MessageSquare,
  Settings,
  ArrowUpRight
} from "lucide-react";

import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isCms = pathname.startsWith("/dashboard/cms");
  const isCrm = pathname === "/dashboard/crm";
  
  const { data: session } = useSession();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = React.useState(false);
  const [simulatedRole, setSimulatedRole] = React.useState<string | null>(null);
  const [isMounted, setIsMounted] = React.useState(false);

  const profileRef = React.useRef<HTMLDivElement>(null);

  // Click outside detection & Mounting
  React.useEffect(() => {
    setIsMounted(true);
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
        setIsNotificationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const realRole = (session?.user as any)?.role;
  const userRole = simulatedRole || realRole;
  const user = session?.user;

  // ERP NAV ITEMS
  const erpNavItems = [
    { 
      name: userRole === "CLIENT" ? "Panelim" : "Kokpit", 
      href: "/dashboard", 
      icon: LayoutDashboard 
    },
    {
      name: userRole === "CLIENT" ? "Dosyalarım" : "Firmalar",
      href: "/dashboard/companies",
      icon: Building2,
      roles: ["ADMIN", "EXPERT", "CLIENT"],
    },
    { 
      name: "Rapor Arşivi", 
      href: "/dashboard/reports", 
      icon: FileBox,
      roles: ["ADMIN", "EXPERT"],
    },
    {
      name: "Kullanıcı Yönetimi",
      href: "/dashboard/admin/users",
      icon: Shield,
      roles: ["ADMIN"],
    },
    {
      name: "Sistem Günlüğü",
      href: "/dashboard/logs",
      icon: History,
      roles: ["ADMIN"],
    },
    {
      name: "CMS Yönetimi",
      href: "/dashboard/cms",
      icon: Globe,
      roles: ["ADMIN"],
    },
    {
      name: "CRM / Talepler",
      href: "/dashboard/crm",
      icon: MessageSquare,
      roles: ["ADMIN", "EXPERT"],
    },
  ];

  // CMS NAV ITEMS
  const cmsNavItems = [
    { name: "CMS Hub", href: "/dashboard/cms", icon: LayoutDashboard, roles: ["ADMIN"] },
    { name: "Ana Sayfa Yönetimi", href: "/dashboard/cms/homepage", icon: Home, roles: ["ADMIN"] },
    { name: "Kurumsal Bilgiler", href: "/dashboard/cms/about", icon: Info, roles: ["ADMIN"] },
    { name: "Hizmet Yönetimi", href: "/dashboard/cms/services", icon: LayoutDashboard, roles: ["ADMIN"] },
    { name: "Blog & İçerik", href: "/dashboard/cms/blog", icon: Newspaper, roles: ["ADMIN"] },
    { name: "İSG Kütüphanesi", href: "/dashboard/cms/isg-library", icon: FileBox, roles: ["ADMIN"] },
    { name: "NACE Kodları", href: "/dashboard/cms/nace-codes", icon: LayoutIcon, roles: ["ADMIN"] },
    { name: "Gelen Talepler", href: "/dashboard/cms/talepler", icon: MessageSquare, roles: ["ADMIN"] },
    { name: "Bülten & Mesajlar", href: "/dashboard/cms/engagement", icon: Newspaper, roles: ["ADMIN"] },
    { name: "Site Ayarları", href: "/dashboard/cms/settings", icon: Settings, roles: ["ADMIN"] },
    { name: "ERP'ye Dön", href: "/dashboard", icon: Zap, color: "text-blue-500" },
  ];

  const navItems = (isCms ? cmsNavItems : erpNavItems).filter((item) => !(item as any).roles || (item as any).roles.includes(userRole));

  const themeColor = isCms ? "emerald" : "blue";
  const themeHex = isCms ? "emerald-600" : "blue-600";
  const themeBg = isCms ? "emerald-600" : "blue-600";
  const themeText = isCms ? "text-emerald-600" : "text-blue-600";
  const themeActiveBg = isCms ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-blue-50 dark:bg-blue-900/20";
  const themeActiveText = isCms ? "text-emerald-700 dark:text-emerald-400" : "text-blue-700 dark:text-blue-400";
  const themeActiveBorder = isCms ? "border-emerald-100 dark:border-emerald-900/30" : "border-blue-100 dark:border-blue-900/30";
  const themeDot = isCms ? "bg-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.6)]" : "bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]";

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row font-sans selection:bg-blue-100 dark:selection:bg-blue-900 italic font-medium transition-colors duration-500 ${isCrm ? 'h-screen overflow-hidden' : ''}`}>
      {/* MOBILE HEADER */}
      <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center shadow-sm sticky top-0 z-[60]">
        <div className="text-slate-900 dark:text-white font-black italic tracking-tighter text-xl flex-1">
          MERCAN <span className="text-blue-600">ERP</span>
        </div>
        <div className="flex items-center gap-3">
          <NotificationCenter 
            externalOpen={isNotificationOpen} 
            onToggle={(open) => {
              setIsNotificationOpen(open);
              if (open) setIsProfileOpen(false);
            }} 
          />
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-slate-600 dark:text-slate-400 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-[4px]"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* SIDEBAR */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800 transform transition-all duration-300 ease-in-out
        md:relative md:translate-x-0 h-screen
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        ${isCrm ? "w-20" : "w-64"}
      `}
      >
        <div className={`h-full flex flex-col transition-all duration-300 ${isCrm ? 'p-3' : 'p-6'}`}>
          {/* Brand Row */}
          <div className="flex items-center gap-2 mb-8 px-2 not-italic">
            <div className={`w-10 h-10 ${isCms ? "bg-emerald-600 shadow-emerald-500/50" : "bg-blue-600 shadow-blue-500/50"} rounded-[4px] flex items-center justify-center shadow-lg transform rotate-3 transition-colors duration-500`}>
              {isCms ? <Globe className="text-white" size={24} /> : <TrendingUp className="text-white" size={24} />}
            </div>
            <div className={`text-slate-900 dark:text-white font-black text-xl tracking-tighter uppercase leading-none transition-opacity duration-300 ${isCrm ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
              Mercan
              <br />
              <span className={`${isCms ? "text-emerald-600" : "text-blue-600"} font-black transition-colors`}>{isCms ? "CMS" : "ERP"}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    group flex items-center transition-all duration-200
                    ${isCrm ? 'p-2 justify-center rounded-[4px]' : 'p-2.5 justify-between rounded-[4px]'}
                    ${
                      isActive
                        ? `${themeActiveBg} ${themeActiveText} shadow-sm border border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900`
                        : "text-slate-500 dark:text-zinc-500 hover:bg-slate-50 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white"
                    }
                  `}
                >
                  <div className={`flex items-center ${isCrm ? 'justify-center' : 'gap-3'}`}>
                    <item.icon
                      size={20}
                      className={
                        isActive ? (isCms ? "text-emerald-600" : "text-blue-600") : "text-slate-400 dark:text-slate-500 group-hover:text-blue-600"
                      }
                    />
                    <span className={`text-sm font-black uppercase tracking-tight italic transition-opacity duration-300 ${isCrm ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                      {item.name}
                    </span>
                  </div>
                  {isActive && !isCrm && (
                    <div className={`w-1.5 h-1.5 rounded-full ${themeDot}`} />
                  )}

                  {/* TOOLTIP FOR COLLAPSED STATE */}
                  {isCrm && (
                    <div className="absolute left-[calc(100%+10px)] px-3 py-2 bg-slate-950 text-white text-[10px] font-black uppercase tracking-widest rounded-none opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-[100] shadow-[0_10px_30px_rgba(0,0,0,0.3)] border border-slate-800 translate-x-[-10px] group-hover:translate-x-0">
                      {item.name}
                      <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-950 rotate-45 border-l border-b border-slate-800" />
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Card & Apps Menu */}
          <div className="mt-auto pt-4 border-t border-slate-200 dark:border-zinc-800 relative" ref={profileRef}>
            {/* FLY-OUT MENU */}
            {isProfileOpen && (
              <>
                <div className={`absolute bottom-full left-0 mb-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[4px] shadow-[0_10px_30px_rgba(0,0,0,0.3)] z-[100] p-4 animate-in slide-in-from-bottom-2 duration-300 overflow-hidden leading-none italic ${isCrm ? 'w-60 -left-2' : 'w-full'}`}>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />

                  {/* Site View Link */}
                  <div className="mb-4 pb-3 border-b border-slate-100 dark:border-zinc-800">
                    <a 
                      href="/" 
                      target="_blank"
                      className="w-full px-3 py-2.5 bg-emerald-600 text-white rounded-[4px] text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
                    >
                       <ExternalLink size={12} /> Siteyi Görüntüle
                    </a>
                  </div>

                  {/* ADMIN: IMPERSONATION TOOL */}
                  {realRole === "ADMIN" && (
                    <div className="mb-3 p-2.5 bg-slate-50 dark:bg-zinc-800/50 rounded-[4px] border border-slate-100 dark:border-zinc-800 italic">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap size={10} className="text-amber-500" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Rolü Simüle Et</span>
                      </div>
                      <div className="flex gap-1">
                         {["ADMIN", "EXPERT", "CLIENT"].map(r => (
                           <button 
                             key={r}
                             onClick={() => setSimulatedRole(r === realRole ? null : r)}
                             className={`flex-1 py-1 rounded-[4px] text-[8px] font-black transition-all ${userRole === r ? 'bg-zinc-900 dark:bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-zinc-900 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-100 dark:border-zinc-800'}`}
                           >
                             {r}
                           </button>
                         ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Modüller & Ayarlar</span>
                    <button 
                      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                      className="w-10 h-5 bg-slate-100 dark:bg-zinc-800 rounded-[4px] p-0.5 relative flex items-center transition-colors shadow-inner"
                    >
                      <div className={`w-4 h-4 rounded-[4px] bg-white dark:bg-zinc-700 shadow-sm flex items-center justify-center transition-transform ${isMounted && resolvedTheme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`}>
                         {isMounted ? (
                           resolvedTheme === 'dark' ? <Moon size={10} className="text-indigo-400" /> : <Sun size={10} className="text-amber-500" />
                         ) : <div className="w-2 h-2 bg-slate-200 animate-pulse rounded-[4px]" />}
                      </div>
                    </button>
                  </div>

                  <div className="space-y-1">
                    {[
                      {
                        name: "Drive",
                        desc: "Belge Arşivi",
                        url: "/dashboard",
                        icon: HardDrive,
                        color: "text-blue-500",
                        bg: "bg-blue-50 dark:bg-blue-900/10",
                        action: { icon: PlusSquare, label: "Yeni Rapor" }
                      },
                      {
                        name: "Mail",
                        desc: "İletişim",
                        url: "http://localhost:3002",
                        icon: MailIcon,
                        color: "text-indigo-500",
                        bg: "bg-indigo-50 dark:bg-indigo-900/10",
                        action: { icon: PenLine, label: "E-Posta" }
                      },
                      {
                        name: "CMS",
                        desc: "Yayıncılık",
                        url: "/dashboard/cms",
                        icon: Globe,
                        color: "text-emerald-500",
                        bg: "bg-emerald-50 dark:bg-emerald-900/10",
                        action: { icon: Eye, label: "Siteyi Gör" }
                      },
                    ].map((app) => (
                      <div key={app.name} className="flex items-center gap-1 group">
                        <a
                          href={app.url}
                          className="flex-1 flex items-center gap-2.5 p-2 rounded-[4px] hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-all"
                        >
                          <div
                            className={`w-8 h-8 ${app.bg} ${app.color} rounded-[4px] flex items-center justify-center group-hover:scale-105 transition-transform`}
                          >
                            <app.icon size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[9px] font-black text-slate-900 dark:text-zinc-100 uppercase tracking-tight flex items-center justify-between">
                              {app.name}
                            </div>
                            <div className="text-[7px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                              {app.desc}
                            </div>
                          </div>
                        </a>
                        <button className="p-2.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-[4px] transition-all" title={app.action.label}>
                           <app.action.icon size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 flex flex-col gap-0.5">
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-2.5 p-2 rounded-[4px] text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-all font-black text-[9px] uppercase tracking-widest"
                    >
                      <UserCircle size={14} /> Profil Ayarları
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="w-full flex items-center gap-2.5 p-2 rounded-[4px] text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all font-black text-[9px] uppercase tracking-widest text-left"
                    >
                      <LogOut size={14} /> Çıkış Yap
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center gap-1.5 w-full">
              {/* THE CARD TRIGGER */}
              <button
                onClick={() => {
                  const newState = !isProfileOpen;
                  setIsProfileOpen(newState);
                  if (newState) setIsNotificationOpen(false);
                }}
                className={`flex-1 flex items-center gap-2.5 rounded-[4px] border transition-all text-left group ${isCrm ? 'p-1.5 justify-center' : 'p-1'} ${
                  isProfileOpen
                    ? "bg-slate-900 dark:bg-zinc-900 border-slate-900 dark:border-zinc-900 shadow-xl"
                    : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-blue-200 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-zinc-800 shadow-sm"
                }`}
              >
                {user?.image ? (
                  <img
                    src={user.image}
                    alt=""
                    className="w-9 h-9 rounded-[4px] shadow-md border border-white dark:border-zinc-800"
                  />
                ) : (
                  <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-[4px] flex items-center justify-center shadow-inner">
                    <UsersIcon size={18} />
                  </div>
                )}
                <div className={`flex-1 min-w-0 leading-tight transition-opacity duration-300 ${isCrm ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                  <div
                    className={`text-[9px] font-black uppercase tracking-tight truncate ${
                      isProfileOpen ? "text-white" : "text-slate-900 dark:text-white"
                    }`}
                  >
                    {user?.name || "Kullanıcı"}
                  </div>
                  <div
                    className={`text-[7px] font-bold uppercase tracking-widest truncate ${
                      isProfileOpen ? "text-blue-300" : "text-slate-400 dark:text-zinc-500"
                    }`}
                  >
                    {userRole || "USER"}
                  </div>
                </div>
                {!isCrm && (
                  <ChevronUp
                    className={`transition-transform duration-300 ${
                      isProfileOpen ? "rotate-180 text-white" : "text-slate-300 group-hover:text-blue-500"
                    }`}
                    size={14}
                  />
                )}
              </button>

              {/* Action Group: Notifications */}
              {!isCrm && (
                <div className="flex items-center justify-center w-12 h-12">
                   <NotificationCenter 
                      externalOpen={isNotificationOpen} 
                      onToggle={(open) => {
                        setIsNotificationOpen(open);
                        if (open) setIsProfileOpen(false);
                      }} 
                   />
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile overlays */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* MAIN CONTENT */}
      <main className={`flex-1 h-screen overflow-y-auto relative transition-colors duration-500 ${isCms ? "bg-emerald-50/20 dark:bg-slate-950" : "bg-slate-50/50 dark:bg-slate-950"}`}>
        <div className="relative z-10">
           {children}
        </div>
      </main>
    </div>
  );
}
