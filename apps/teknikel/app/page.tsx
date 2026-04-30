"use client";

import React, { useEffect, useState } from "react";
import { Row, Col, Statistic, Timeline, Badge, Avatar, Typography } from "antd";
import {
  TeamOutlined,
  ClockCircleOutlined,
  FireOutlined,
  SendOutlined,
  RiseOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";

const { Title, Text } = Typography;

// --- SAHTE OTURUM (MOCK SESSION) ---
const session = { 
  user: { name: "Ahmet Teknikel", email: "sunum@teknikel.com", id: "999999", role: "admin" } 
};
// -----------------------------------

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    pendingCalls: 0,
    vipLeads: 0,
    smsSent: 0,
  });

  const [vipLeads, setVipLeads] = useState([]);
  const [activities, setActivities] = useState([
    { time: "10:30", text: "Tekniker Isı Sistemleri kataloğa tıkladı", type: "CLICK" },
    { time: "09:45", text: "Kombi Dünyası maili açtı", type: "OPEN" },
    { time: "Dün", text: "Arçelik Servis VIP statüsüne yükseldi", type: "VIP" },
  ]);

  useEffect(() => {
    setStats({
      totalLeads: 128,
      pendingCalls: 12,
      vipLeads: 8,
      smsSent: 45,
    });
    
    setVipLeads([
      { name: "Tekniker Isı", score: 85, status: "CLICKED" },
      { name: "Kombi Dünyası", score: 42, status: "OPENED" },
      { name: "Güneş Enerji", score: 38, status: "NEW" },
    ]);
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6 animate-in fade-in duration-700">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 border-b border-slate-100 dark:border-zinc-800 pb-4">
        <div className="space-y-0.5">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">
            Ana Ekran (Durum Özeti)
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Dükkan ve Müşteri Analiz Paneli
          </p>
          {/* Mock Session User Display */}
          <div className="mt-1 flex items-center gap-2">
            <Badge status="success" />
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">Aktif Oturum: {session.user.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[12px] font-medium text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-md border border-slate-100 dark:border-slate-800 shadow-sm">
          <ClockCircleOutlined className="text-primary" /> Son Güncelleme: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* METRIC CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { name: "Toplam Kayıtlı Usta", value: stats.totalLeads, icon: TeamOutlined, color: "text-primary", bg: "bg-red-50" },
          { name: "Aranacak Ustalar", value: stats.pendingCalls, icon: ClockCircleOutlined, color: "text-orange-600", bg: "bg-orange-50" },
          { name: "En Değerli Ustalar", value: stats.vipLeads, icon: FireOutlined, color: "text-rose-600", bg: "bg-rose-50" },
          { name: "Giden Mesaj Sayısı", value: stats.smsSent, icon: SendOutlined, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((s) => (
          <div key={s.name} className="bg-white dark:bg-slate-900/50 p-4 rounded-md border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
            <div className={`absolute -right-2 -bottom-2 opacity-5 group-hover:scale-110 transition-transform ${s.color}`}>
               <s.icon style={{ fontSize: '48px' }} />
            </div>
            <div className="flex items-center gap-3 relative z-10">
               <div className={`w-9 h-9 ${s.bg} dark:bg-zinc-950 ${s.color} rounded-md border border-transparent dark:border-zinc-800 flex items-center justify-center`}>
                  <s.icon style={{ fontSize: '18px' }} />
               </div>
               <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{s.name}</div>
                  <div className="text-lg font-bold text-slate-800 dark:text-white leading-none">{s.value}</div>
               </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* VIP Radar */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/50 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-950/20">
            <h3 className="text-[13px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <FireOutlined className="text-rose-500" /> Özel Müşteri Takibi
            </h3>
            <Badge status="processing" text={<span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase">Canlı</span>} />
          </div>
          <div className="flex flex-col">
            {vipLeads.map((item: any, index: number) => (
              <div 
                key={index}
                className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 px-6 py-5 transition-all group cursor-pointer border-b border-slate-100 dark:border-zinc-800 last:border-0 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <Avatar size={36} className="bg-red-50 dark:bg-red-900/20 text-primary font-bold rounded-md shrink-0">
                    {item.name[0]}
                  </Avatar>
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-white text-[13px]">{item.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">{item.status}</span>
                      <div className="w-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">Son görülme: 5dk önce</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded text-[11px] font-bold border border-rose-100 dark:border-zinc-800">
                    Güven Puanı: {item.score}
                  </div>
                  <ArrowRightOutlined className="text-slate-300 group-hover:text-primary transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Aktivite Akışı */}
        <div className="bg-white dark:bg-slate-900/50 p-6 rounded-md border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
               <RiseOutlined className="text-indigo-600" /> Son İşlemler (Sistem Günlüğü)
            </h3>
          </div>
          
          <Timeline
            items={activities.map(act => ({
              color: act.type === 'CLICK' ? '#ed1c24' : act.type === 'VIP' ? '#f43f5e' : '#10b981',
              content: (
                <div className="flex flex-col mb-2">
                  <Text className="text-[10px] text-slate-400 font-medium mb-0.5">{act.time}</Text>
                  <Text className="text-[12px] text-slate-600 dark:text-slate-400 leading-snug">{act.text}</Text>
                </div>
              )
            }))}
          />
        </div>
      </div>
    </div>
  );
}
