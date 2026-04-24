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
  const [simulatedRole, setSimulatedRole] = React.useState<string | null>(null);
  const [isMounted, setIsMounted] = React.useState(false);

  const profileRef = React.useRef<HTMLDivElement>(null);

  // Click outside detection & Mounting
  React.useEffect(() => {
    setIsMounted(true);
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
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
          <NotificationCenter />
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-slate-600 dark:text-slate-400 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-none"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* SIDEBAR */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 bg-zinc-950 border-r border-zinc-800 transform transition-all duration-300 ease-in-out
        md:relative md:translate-x-0 h-screen
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        ${isCrm ? "w-20" : "w-64"}
      `}
      >
        <div className={`h-full flex flex-col transition-all duration-300 ${isCrm ? 'p-3' : 'p-6'}`}>
          {/* Brand Row */}
          <div className="flex items-center gap-3 mb-12 px-2 not-italic">
            <div className={`w-10 h-10 ${isCms ? "bg-emerald-600 shadow-emerald-500/50" : "bg-blue-600 shadow-blue-500/50"} rounded-none flex items-center justify-center shadow-lg transform rotate-3 transition-colors duration-500`}>
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
                    ${isCrm ? 'p-3 justify-center rounded-none' : 'p-3.5 justify-between rounded-none'}
                    ${
                      isActive
                        ? `${themeActiveBg} ${themeActiveText} shadow-sm border border-zinc-800 bg-zinc-900`
                        : "text-zinc-500 hover:bg-zinc-900 hover:text-white"
                    }
                  `}
                >
                  <div className={`flex items-center ${isCrm ? 'justify-center' : 'gap-3'}`}>
                    <item.icon
                      size={20}
                      className={
                        isActive ? (isCms ? "text-emerald-600" : "text-blue-600") : "text-slate-400 dark:text-slate-500 group-hover:text-blue-500"
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
          <div className="mt-auto pt-6 border-t border-slate-100 relative" ref={profileRef}>
            {/* FLY-OUT MENU */}
            {isProfileOpen && (
              <>
                <div className={`absolute bottom-full left-0 mb-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[1.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.15)] z-[100] p-5 animate-in slide-in-from-bottom-4 duration-300 overflow-hidden leading-none italic ${isCrm ? 'w-64 -left-2' : 'w-full'}`}>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />

                  {/* ADMIN: IMPERSONATION TOOL */}
                  {realRole === "ADMIN" && (
                    <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-none border border-slate-100 dark:border-slate-800 italic">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap size={12} className="text-amber-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Rolü Simüle Et</span>
                      </div>
                      <div className="flex gap-1">
                         {["ADMIN", "EXPERT", "CLIENT"].map(r => (
                           <button 
                             key={r}
                             onClick={() => setSimulatedRole(r === realRole ? null : r)}
                             className={`flex-1 py-1.5 rounded-lg text-[8px] font-black transition-all ${userRole === r ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800'}`}
                           >
                             {r}
                           </button>
                         ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-4 px-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Modüller & Ayarlar</span>
                    <button 
                      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                      className="w-12 h-6 bg-slate-100 dark:bg-slate-800 rounded-full p-1 relative flex items-center transition-colors"
                    >
                      <div className={`w-4 h-4 rounded-full bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center transition-transform ${isMounted && resolvedTheme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}>
                         {isMounted ? (
                           resolvedTheme === 'dark' ? <Moon size={10} className="text-indigo-400" /> : <Sun size={10} className="text-amber-500" />
                         ) : <div className="w-2 h-2 bg-slate-200 animate-pulse rounded-full" />}
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
                        bg: "bg-blue-50",
                        action: { icon: PlusSquare, label: "Yeni Rapor" }
                      },
                      {
                        name: "Mail",
                        desc: "İletişim",
                        url: "http://localhost:3002",
                        icon: MailIcon,
                        color: "text-indigo-500",
                        bg: "bg-indigo-50",
                        action: { icon: PenLine, label: "E-Posta" }
                      },
                      {
                        name: "CMS",
                        desc: "Yayıncılık",
                        url: "/dashboard/cms",
                        icon: Globe,
                        color: "text-emerald-500",
                        bg: "bg-emerald-50",
                        action: { icon: Eye, label: "Siteyi Gör" }
                      },
                    ].map((app) => (
                      <div key={app.name} className="flex items-center gap-1 group">
                        <a
                          href={app.url}
                          className="flex-1 flex items-center gap-3 p-3 rounded-none hover:bg-slate-50 transition-all"
                        >
                          <div
                            className={`w-9 h-9 ${app.bg} ${app.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}
                          >
                            <app.icon size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-black text-slate-900 uppercase tracking-tight flex items-center justify-between">
                              {app.name}
                            </div>
                            <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                              {app.desc}
                            </div>
                          </div>
                        </a>
                        <button className="p-3 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-none transition-all" title={app.action.label}>
                           <app.action.icon size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-1">
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-3 p-3 rounded-none text-slate-600 hover:bg-slate-50 transition-all font-black text-[10px] uppercase tracking-widest"
                    >
                      <UserCircle size={16} /> Profil Ayarları
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="w-full flex items-center gap-3 p-3 rounded-none text-rose-500 hover:bg-rose-50 transition-all font-black text-[10px] uppercase tracking-widest"
                    >
                      <LogOut size={16} /> Çıkış Yap
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* THE CARD TRIGGER */}
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={`w-full flex items-center gap-3 rounded-none border transition-all text-left group ${isCrm ? 'p-1.5 justify-center' : 'p-3'} ${
                isProfileOpen
                  ? "bg-slate-900 border-slate-900 shadow-xl"
                  : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm"
              }`}
            >
              {user?.image ? (
                <img
                  src={user.image}
                  alt=""
                  className="w-10 h-10 rounded-none shadow-md border border-white"
                />
              ) : (
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-none flex items-center justify-center shadow-inner">
                  <UsersIcon size={20} />
                </div>
              )}
              <div className={`flex-1 min-w-0 leading-tight transition-opacity duration-300 ${isCrm ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                <div
                  className={`text-[10px] font-black uppercase tracking-tight truncate ${
                    isProfileOpen ? "text-white" : "text-slate-900 dark:text-white"
                  }`}
                >
                  {user?.name || "Kullanıcı"}
                </div>
                <div
                  className={`text-[8px] font-bold uppercase tracking-widest truncate ${
                    isProfileOpen ? "text-blue-300" : "text-slate-400 dark:text-slate-500"
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
                  size={16}
                />
              )}

              {/* TOOLTIP FOR COLLAPSED PROFILE */}
              {isCrm && (
                <div className="absolute left-[calc(100%+10px)] px-3 py-2 bg-slate-950 text-white text-[10px] font-black uppercase tracking-widest rounded-none opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-[100] shadow-[0_10px_30px_rgba(0,0,0,0.3)] border border-slate-800 translate-x-[-10px] group-hover:translate-x-0">
                  {user?.name || "Profil"}
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-950 rotate-45 border-l border-b border-slate-800" />
                </div>
              )}
            </button>
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
        {/* DESKTOP TOPBAR */}
        <div className="hidden md:flex sticky top-0 z-[40] w-full p-6 justify-between items-center pointer-events-none">
           <div className="pointer-events-auto">
              {isCms && (
                <div className="flex items-center gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-1.5 pl-4 rounded-none border border-slate-100 dark:border-slate-800 shadow-xl">
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">CMS Mode</span>
                   <div className="h-4 w-px bg-slate-100 dark:bg-slate-800" />
                   <a 
                     href="/" 
                     target="_blank"
                     className="px-4 py-2 bg-emerald-600 text-white rounded-none text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
                   >
                      <ArrowUpRight size={14} /> Siteyi Görüntüle
                   </a>
                </div>
              )}
           </div>
           <div className="pointer-events-auto">
              <NotificationCenter />
           </div>
        </div>
        <div className="relative z-10">
           {children}
        </div>
      </main>
    </div>
  );
}
