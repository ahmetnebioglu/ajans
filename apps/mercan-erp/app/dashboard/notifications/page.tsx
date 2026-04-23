"use client";

import React, { useState, useEffect } from "react";
import { 
  Bell, 
  Info, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  Filter,
  Trash2,
  ChevronLeft
} from "lucide-react";
import { getNotifications, markNotificationsAsRead } from "../../actions/admin-actions";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import Link from "next/link";

export default function NotificationsPage() {
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "URGENT" | "INFO">("ALL");

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await getNotifications();
      if (res && res.success) {
        setNotifications(res.notifications || []);
      }
    } catch (err) {
      console.error("Failed to load notifications page:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadNotifications();
  }, []);

  if (!mounted) return null;

  const handleMarkAllRead = async () => {
    const res = await markNotificationsAsRead();
    if (res.success) {
      loadNotifications();
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === "ALL") return true;
    return n.type === filter;
  });

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500 italic font-medium">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
           <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors text-[10px] font-black uppercase tracking-widest mb-2 group">
              <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Panele Dön
           </Link>
           <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
              Bildirim <span className="text-blue-600">Merkezi</span>
           </h1>
           <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">
              Sistemdeki tüm hareketler ve acil aksiyon bekleyen durumlar
           </p>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
           {(["ALL", "INFO", "URGENT"] as const).map((f) => (
             <button
               key={f}
               onClick={() => setFilter(f)}
               className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? "bg-slate-900 dark:bg-blue-600 text-white shadow-lg scale-105" : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
             >
               {f === "ALL" ? "Hepsi" : f === "INFO" ? "Bilgi" : "Acil"}
             </button>
           ))}
        </div>
      </div>

      {/* CONTENT CARD */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden min-h-[60vh] flex flex-col">
         {/* Actions Bar */}
         <div className="p-6 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
               <Filter size={14} /> {filteredNotifications.length} Bildirim Listeleniyor
            </div>
            <button 
              onClick={handleMarkAllRead}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center gap-2"
            >
              <CheckCircle2 size={14} /> Tümünü Okundu İşaretle
            </button>
         </div>

         {/* List */}
         <div className="flex-1 divide-y dark:divide-slate-800">
            {loading ? (
               <div className="flex flex-col items-center justify-center py-24 text-slate-300 gap-4">
                  <Loader2 className="animate-spin" size={48} />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Bildirimler Yükleniyor...</span>
               </div>
            ) : filteredNotifications.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-24 text-slate-400 text-center gap-4">
                  <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-2">
                     <Bell className="opacity-20" size={40} />
                  </div>
                  <div className="space-y-1">
                     <h3 className="font-black text-slate-900 dark:text-white uppercase italic">Henüz Bildirim Yok</h3>
                     <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Seçili kriterlere uygun kayıt bulunamadı.</p>
                  </div>
               </div>
            ) : (
               filteredNotifications.map((n) => (
                 <div 
                   key={n.id}
                   className={`p-8 flex flex-col md:flex-row md:items-center gap-6 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 group ${!n.isRead ? "bg-blue-50/30 dark:bg-blue-900/10 border-l-4 border-blue-600" : ""}`}
                 >
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${n.type === 'URGENT' ? "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400" : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"}`}>
                       {n.type === 'URGENT' ? <AlertCircle size={28} /> : <Info size={28} />}
                    </div>

                    {/* Text Area */}
                    <div className="flex-1 space-y-2">
                       <div className="flex items-center gap-3 flex-wrap">
                          <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${n.type === 'URGENT' ? "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-600" : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600"}`}>
                             {n.type}
                          </span>
                          {!n.isRead && (
                             <span className="w-2 h-2 bg-blue-600 rounded-full animate-ping" />
                          )}
                       </div>
                       <p className={`text-sm md:text-base leading-relaxed ${!n.isRead ? "font-bold text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}>
                          {n.message}
                       </p>
                       <div className="flex items-center gap-4 text-[10px] font-black uppercase text-slate-400 dark:text-slate-600 italic tracking-tighter">
                          <span className="flex items-center gap-1.5"><Clock size={12} /> {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: tr })}</span>
                          <span className="w-1.5 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full" />
                          <span>Mercan ERP Sistem Mesajı</span>
                       </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                       <button className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all" title="Sil">
                          <Trash2 size={18} />
                       </button>
                    </div>
                 </div>
               ))
            )}
         </div>

         {/* Pagination / Footer Placeholder */}
         <div className="p-10 border-t dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/10 text-center">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.5em] italic">Mercan ERP • Dijital Arşiv Bildirim Sistemi</p>
         </div>
      </div>
    </div>
  );
}
