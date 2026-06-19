"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Shield, Users, ChevronRight } from "lucide-react";

const settingsNav = [
  {
    href: "/dashboard/settings/workspace",
    label: "Çalışma Alanı",
    icon: <Building2 size={16} />,
    desc: "Genel ayarlar ve modüller",
  },
  {
    href: "/dashboard/settings/roles",
    label: "Roller",
    icon: <Shield size={16} />,
    desc: "Dinamik rol ve izin yönetimi",
  },
  {
    href: "/dashboard/settings/users",
    label: "Kullanıcılar",
    icon: <Users size={16} />,
    desc: "Kullanıcı davet ve yönetimi",
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
          AYARLAR
        </h1>
        <p className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.3em] mt-1">
          WORKSPACE YÖNETİMİ VE YAPILANDIRMA
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Side Navigation */}
        <nav className="lg:w-64 shrink-0">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-2xl p-2 space-y-1 shadow-sm">
            {settingsNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/30 text-blue-700 dark:text-blue-400"
                      : "hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <span
                    className={`${
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-[10px] font-black uppercase tracking-wide ${
                        isActive
                          ? "text-blue-700 dark:text-blue-300"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {item.label}
                    </div>
                    <div className="text-[8px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wider">
                      {item.desc}
                    </div>
                  </div>
                  <ChevronRight
                    size={14}
                    className={`${
                      isActive
                        ? "text-blue-500"
                        : "text-slate-300 dark:text-slate-700 group-hover:text-slate-400"
                    } transition-colors`}
                  />
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
