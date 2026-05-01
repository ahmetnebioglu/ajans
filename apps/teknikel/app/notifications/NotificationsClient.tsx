"use client";

import React, { useState } from "react";
import { Avatar, Badge, Button, Tag, Typography, Card } from "antd";
import { 
  Bell, 
  Zap, 
  Search, 
  Crown, 
  CheckCircle2, 
  Clock,
  Trash2,
  MailOpen
} from "lucide-react";

const { Text } = Typography;

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "Katalog Görüntülendi",
      description: "Tekniker Isı Sistemleri az önce 2026 Ürün Kataloğunuzu inceledi.",
      time: "5 dakika önce",
      type: "CLICK",
      isRead: false,
      icon: <Zap size={18} className="text-blue-500" />,
    },
    {
      id: "2",
      title: "E-posta Açıldı",
      description: "Kombi Dünyası gönderdiğiniz 'Servis Paketi Teklifi' mailini açtı.",
      time: "2 saat önce",
      type: "OPEN",
      isRead: false,
      icon: <MailOpen size={18} className="text-emerald-500" />,
    },
    {
      id: "3",
      title: "Yeni Leadler Bulundu",
      description: "Google Places taraması (Kombi Servisi - Kadıköy) başarıyla tamamlandı. 5 yeni lead eklendi.",
      time: "4 saat önce",
      type: "SCRAPE",
      isRead: true,
      icon: <Search size={18} className="text-amber-500" />,
    },
    {
      id: "4",
      title: "Arama Planlandı",
      description: "Güneş Enerji için bugün saat 16:00'da bir hatırlatıcı oluşturuldu.",
      time: "Dün",
      type: "CALL",
      isRead: true,
      icon: <Clock size={18} className="text-indigo-500" />,
    },
    {
      id: "5",
      title: "VIP Başarısı",
      description: "İstanbul Kombi Tesisat skorunu 80'in üzerine çıkararak VIP statüsüne yükseldi.",
      time: "2 gün önce",
      type: "VIP",
      isRead: true,
      icon: <Crown size={18} className="text-rose-500" />,
    }
  ]);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto flex flex-col gap-6 animate-in fade-in duration-700">
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Bell className="text-blue-600" size={24} /> Bildirimler
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Tüm sistem aktiviteleri ve müşteri etkileşimleri</p>
        </div>
        <div className="flex gap-2">
          <Button size="small" onClick={markAllAsRead}>Tümünü Okundu İşaretle</Button>
          <Button size="small" danger type="text" icon={<Trash2 size={14} />}>Temizle</Button>
        </div>
      </div>

      <Card className="shadow-sm dark:bg-slate-900/50 dark:border-slate-800 overflow-hidden" bodyStyle={{ padding: 0 }}>
        <div className="flex flex-col">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`px-6 py-5 transition-all hover:bg-slate-50 dark:hover:bg-zinc-800/30 border-b last:border-0 border-slate-100 dark:border-zinc-800 cursor-pointer flex items-center justify-between ${!item.isRead ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
              onClick={() => {
                setNotifications(notifications.map(n => n.id === item.id ? { ...n, isRead: true } : n));
              }}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!item.isRead ? 'bg-white dark:bg-slate-800 shadow-sm' : 'bg-slate-50 dark:bg-slate-900 opacity-60'}`}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Text className={`text-[13px] font-bold ${item.isRead ? 'text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-white'}`}>
                      {item.title}
                    </Text>
                    {!item.isRead && <Badge status="processing" />}
                  </div>
                  <Text className={`text-[12px] block mb-1 ${item.isRead ? 'text-slate-400' : 'text-slate-600 dark:text-slate-300'}`}>
                    {item.description}
                  </Text>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    <Clock size={10} />
                    {item.time}
                  </div>
                </div>
              </div>
              
              <div className="ml-4">
                <Button 
                  key="delete" 
                  type="text" 
                  size="small" 
                  icon={<Trash2 size={14} className="text-slate-300 hover:text-rose-500" />} 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(item.id);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
