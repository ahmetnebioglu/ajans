"use client";

import React, { useState, useEffect } from "react";
import { Bell, Check, Info, AlertCircle, Loader2 } from "lucide-react";
import { getNotifications, markNotificationsAsRead } from "../../actions/admin-actions";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import Link from "next/link";

export default function NotificationCenter({ 
  externalOpen, 
  onToggle 
}: { 
  externalOpen?: boolean; 
  onToggle?: (open: boolean) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setIsOpen = (val: boolean) => {
    if (onToggle) onToggle(val);
    else setInternalOpen(val);
  };

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await getNotifications();
      if (res && res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.notifications?.filter((n: any) => !n.isRead).length || 0);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadNotifications();
    // 30 saniyede bir güncelle
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const handleMarkAllRead = async () => {
    const res = await markNotificationsAsRead();
    if (res.success) {
      loadNotifications();
    }
  };

  return (
    <div className="relative">
      {/* BELL ICON */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[4px] hover:border-blue-200 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-zinc-800 shadow-sm transition-all relative group active:scale-95"
      >
        <Bell className={`w-5 h-5 transition-colors ${unreadCount > 0 ? "text-blue-600 dark:text-blue-400 animate-swing" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600"}`} />
        {unreadCount > 0 && (
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white dark:border-slate-900 rounded-full animate-ping" />
        )}
      </button>

      {/* POPOVER */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full right-0 mb-3 w-52 bg-white dark:bg-zinc-900 rounded-[4px] shadow-[0_10px_30px_rgba(0,0,0,0.3)] border border-zinc-200 dark:border-zinc-800 z-[101] overflow-hidden animate-in slide-in-from-bottom-2 duration-300 italic">
            {/* Header */}
            <div className="p-4 border-b dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-800/50">
               <div className="flex items-center gap-2">
                  <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter italic text-[10px]">Bildirimler</h4>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-blue-600 text-white text-[7px] font-black rounded-full uppercase">{unreadCount} YENİ</span>
                  )}
               </div>
               {unreadCount > 0 && (
                 <button 
                   onClick={handleMarkAllRead}
                   className="text-[8px] font-black uppercase text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                 >
                   <Check size={10} /> Hepsini Oku
                 </button>
               )}
            </div>

            {/* List */}
            <div className="max-h-[300px] overflow-y-auto hide-those-scrollbars">
               {loading && notifications.length === 0 ? (
                 <div className="p-8 text-center text-slate-300">
                    <Loader2 className="animate-spin mx-auto mb-2" size={16} />
                    <span className="text-[9px] font-black uppercase italic">Yükleniyor...</span>
                 </div>
               ) : notifications.length === 0 ? (
                 <div className="p-10 text-center text-slate-400 italic">
                    <Bell className="mx-auto mb-3 opacity-20" size={24} />
                    <p className="text-[9px] font-bold uppercase tracking-widest leading-relaxed">Henüz bir bildiriminiz <br /> bulunmuyor.</p>
                 </div>
               ) : (
                 <div className="divide-y dark:divide-zinc-800">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-4 flex gap-3 transition-colors hover:bg-slate-50 dark:hover:bg-zinc-800/50 ${!n.isRead ? "bg-blue-50/30 dark:bg-blue-900/10" : ""}`}
                      >
                         <div className={`w-8 h-8 rounded-[4px] flex-shrink-0 flex items-center justify-center ${n.type === 'URGENT' ? "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400" : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"}`}>
                            {n.type === 'URGENT' ? <AlertCircle size={16} /> : <Info size={16} />}
                         </div>
                         <div className="space-y-0.5">
                            <p className={`text-[10px] leading-relaxed ${!n.isRead ? "font-bold text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}>
                               {n.message}
                            </p>
                            <span className="text-[8px] font-black uppercase text-slate-400 dark:text-slate-600 italic">
                               {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: tr })}
                            </span>
                         </div>
                      </div>
                    ))}
                 </div>
               )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 border-t dark:border-zinc-800 text-center">
               <Link 
                 href="/dashboard/notifications" 
                 onClick={() => setIsOpen(false)}
                 className="text-[8px] font-black uppercase text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors tracking-widest italic"
               >
                  Tüm Bildirimleri Gör
               </Link>
            </div>
          </div>
        </>
      )}

      <style jsx global>{`
        @keyframes swing {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(15deg); }
          40% { transform: rotate(-10deg); }
          60% { transform: rotate(5deg); }
          80% { transform: rotate(-5deg); }
        }
        .animate-swing {
          animation: swing 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
