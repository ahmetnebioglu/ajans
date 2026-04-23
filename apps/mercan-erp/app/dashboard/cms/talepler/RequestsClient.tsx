"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Mail, Calendar, User, MessageSquare, CheckCircle2, Clock, ShieldCheck, Building2, Map, FileText, Inbox, Search, Filter, MailQuestion, Reply, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { markRequestAsRead, markRequestAsUnread } from "../../../actions/admin-actions";
import { useRouter } from "next/navigation";

interface RequestsClientProps {
  contactRequests: any[];
  referenceRequests: any[];
}

type RequestType = "contact" | "reference";

export default function RequestsClient({ contactRequests, referenceRequests }: RequestsClientProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | RequestType>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Manuel olarak okunmadı işaretlenen mesajları takip et
  const manuallyUnreadIds = useRef<Set<string>>(new Set());

  // --- OTOMATİK YENİLEME (HER 60 SANİYE) ---
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Sistem: Talepler otomatik olarak yenileniyor...");
      router.refresh();
    }, 60000); // 60 saniye

    return () => clearInterval(interval);
  }, [router]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Tüm talepleri birleştir ve tarihe göre sırala
  const allRequests = useMemo(() => {
    const combined = [
      ...contactRequests.map(r => ({ ...r, type: "contact" as const })),
      ...referenceRequests.map(r => ({ ...r, type: "reference" as const }))
    ];
    return combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [contactRequests, referenceRequests]);

  // Filtreleme mantığı
  const filteredRequests = useMemo(() => {
    return allRequests.filter(r => {
      const matchesFilter = filter === "all" || r.type === filter;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        (r.name || r.fullName || "").toLowerCase().includes(searchLower) ||
        (r.subject || r.companyName || "").toLowerCase().includes(searchLower) ||
        (r.email || "").toLowerCase().includes(searchLower);
      return matchesFilter && matchesSearch;
    });
  }, [allRequests, filter, searchTerm]);

  // Seçili talebi bul
  const selectedRequest = useMemo(() => {
    if (!selectedId) return null;
    return allRequests.find(r => r.id === selectedId) || null;
  }, [selectedId, allRequests]);

  // Akıllı Okundu Mantığı
  useEffect(() => {
    if (selectedRequest && !selectedRequest.isRead && !manuallyUnreadIds.current.has(selectedRequest.id)) {
      markRequestAsRead(selectedRequest.id, selectedRequest.type);
    }
  }, [selectedId]);

  const handleSelect = (id: string) => {
    manuallyUnreadIds.current.delete(id);
    setSelectedId(id);
  };

  const handleMarkAsUnread = async () => {
    if (selectedRequest) {
      manuallyUnreadIds.current.add(selectedRequest.id);
      await markRequestAsUnread(selectedRequest.id, selectedRequest.type);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-250px)] min-h-[600px] border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden bg-white dark:bg-[#0F172A] w-full max-w-full shadow-2xl">
      
      {/* Top Header / Action & Filter Bar */}
      <div className="flex flex-col xl:flex-row items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/5 gap-4 overflow-hidden">
        
        {/* Left: Filters & Refresh */}
        <div className="flex items-center gap-4 w-full xl:w-auto">
          <div className="flex items-center gap-2 bg-white dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/5 overflow-x-auto no-scrollbar shrink-0">
            <FilterButton active={filter === "all"} onClick={() => setFilter("all")} label="Tümü" count={allRequests.length} />
            <FilterButton active={filter === "contact"} onClick={() => setFilter("contact")} label="İletişim" count={contactRequests.length} />
            <FilterButton active={filter === "reference"} onClick={() => setFilter("reference")} label="Referans" count={referenceRequests.length} />
          </div>
          
          <button 
            onClick={handleManualRefresh}
            className={`p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 hover:text-blue-500 transition-all shadow-sm ${isRefreshing ? "text-blue-500" : ""}`}
            title="Şimdi Yenile"
          >
            <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Right: Actions & Search */}
        <div className="flex items-center gap-3 w-full xl:w-auto">
          {selectedRequest && (
            <div className="flex items-center gap-2 pr-4 border-r border-slate-200 dark:border-white/10 animate-in fade-in slide-in-from-right-4">
              <a 
                href={`mailto:${selectedRequest.email}`}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-black text-[10px] uppercase italic tracking-widest rounded-xl shadow-lg shadow-blue-600/20 hover:scale-105 transition-all shrink-0"
              >
                <Reply size={14} /> YANITLA
              </a>
              <button 
                onClick={handleMarkAsUnread}
                disabled={!selectedRequest.isRead}
                className={`flex items-center gap-2 px-4 py-2.5 font-black text-[10px] uppercase italic tracking-widest rounded-xl transition-all shrink-0 border ${
                  selectedRequest.isRead 
                    ? "bg-white dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10" 
                    : "bg-slate-100 dark:bg-white/5 text-slate-300 border-transparent cursor-not-allowed"
                }`}
              >
                <MailQuestion size={14} /> OKUNMADI YAP
              </button>
            </div>
          )}

          <div className="relative flex-1 xl:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Talep ara..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 transition-all dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden w-full">
        {/* Left Side: Message List */}
        <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-white/5 overflow-y-auto overflow-x-hidden bg-slate-50/50 dark:bg-black/10 shrink-0">
          {filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center space-y-3">
              <Inbox size={40} strokeWidth={1.5} />
              <p className="text-xs font-black uppercase tracking-widest italic">Talep Bulunamadı</p>
            </div>
          ) : (
            filteredRequests.map((req) => (
              <button
                key={req.id}
                onClick={() => handleSelect(req.id)}
                className={`w-full text-left p-5 border-b border-slate-100 dark:border-white/5 transition-all relative group overflow-hidden ${
                  selectedRequest?.id === req.id 
                    ? "bg-white dark:bg-blue-600/10 border-r-4 border-r-blue-600 shadow-sm" 
                    : "hover:bg-white dark:hover:bg-white/[0.03]"
                }`}
              >
                <div className="flex justify-between items-start mb-1 gap-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    {!req.isRead && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.6)] shrink-0"></div>
                    )}
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded shrink-0 ${
                      req.type === "contact" ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400" : "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400"
                    }`}>
                      {req.type === "contact" ? "İLETİŞİM" : "REFERANS"}
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 shrink-0">
                    {format(new Date(req.createdAt), "HH:mm")}
                  </span>
                </div>
                <h4 className={`text-sm uppercase italic tracking-tighter truncate ${
                  !req.isRead ? "font-black text-slate-900 dark:text-white" : "font-bold text-slate-500 dark:text-slate-400"
                } ${selectedRequest?.id === req.id ? "text-blue-600 dark:text-blue-400" : ""}`}>
                  {req.name || req.fullName}
                </h4>
                <p className={`text-[10px] truncate font-medium italic mt-0.5 ${!req.isRead ? "text-slate-700 dark:text-slate-200" : "text-slate-400"}`}>
                  {req.subject || req.companyName || "Konu Belirtilmemiş"}
                </p>
                {!req.isVerified && (
                  <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-1.5 h-1.5 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                )}
              </button>
            ))
          )}
        </div>

        {/* Right Side: Message Detail */}
        <div className="hidden md:flex flex-1 flex-col bg-white dark:bg-[#0F172A] overflow-y-auto overflow-x-hidden">
          {selectedRequest ? (
            <div className="p-8 lg:p-12 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Detail Header */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 dark:border-white/5 pb-8">
                <div className="flex items-center gap-5">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                    selectedRequest.isVerified ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-100 dark:bg-white/5 text-slate-400"
                  }`}>
                    {selectedRequest.type === "contact" ? <User size={32} /> : <Building2 size={32} />}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                        {selectedRequest.name || selectedRequest.fullName}
                      </h2>
                      {selectedRequest.isVerified && (
                        <span className="px-3 py-1 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-[0.2em] italic rounded-lg shadow-lg shadow-emerald-500/20">
                          DOĞRULANMIŞ
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500 italic uppercase tracking-widest">
                       <span className="flex items-center gap-1.5 text-blue-500"><Mail size={14} /> {selectedRequest.email}</span>
                       <span className="flex items-center gap-1.5 text-slate-400"><Calendar size={14} /> {format(new Date(selectedRequest.createdAt), "dd MMMM yyyy | HH:mm", { locale: tr })}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail Body */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                    {selectedRequest.subject || selectedRequest.companyName || "Talep Detayı"}
                  </h3>
                </div>

                <div className={`p-8 rounded-[2rem] border leading-relaxed text-slate-700 dark:text-slate-300 font-medium italic shadow-inner ${
                  selectedRequest.isVerified ? "bg-emerald-500/5 border-emerald-500/10" : "bg-slate-50 dark:bg-white/[0.02] border-slate-100 dark:border-white/5"
                }`}>
                  {selectedRequest.type === "reference" ? (
                    <div className="space-y-4">
                      <p className="text-blue-500 font-black uppercase tracking-widest text-[10px]">REFERANS TALEBİ AYRINTILARI</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="p-4 bg-white dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5">
                          <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Firma Adı</p>
                          <p className="text-sm font-black dark:text-white">{selectedRequest.companyName}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5">
                          <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Sektör</p>
                          <p className="text-sm font-black dark:text-white">{selectedRequest.sector}</p>
                        </div>
                      </div>
                      <p className="pt-4 border-t border-slate-200 dark:border-white/5 text-xs">Bu kullanıcı sektörel referans listenizi talep etti.</p>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{selectedRequest.message}</div>
                  )}
                </div>
              </div>

              {/* Action Footer (Status info only now) */}
              <div className="pt-4">
                {!selectedRequest.isVerified && (
                  <div className="inline-flex items-center gap-2 text-amber-500 font-black text-[10px] uppercase tracking-widest italic bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-500/20">
                    <Clock size={14} /> E-Posta Onayı Bekleniyor
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 space-y-6">
              <div className="p-10 rounded-full bg-slate-50 dark:bg-white/5">
                <Mail size={80} strokeWidth={1} />
              </div>
              <p className="font-black uppercase italic tracking-[0.3em] text-sm">Görüntülemek için bir mesaj seçin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest italic transition-all flex items-center gap-2 ${
        active 
          ? "bg-slate-900 dark:bg-blue-600 text-white shadow-lg" 
          : "text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10"
      }`}
    >
      {label} <span className={`px-1.5 py-0.5 rounded-md text-[8px] ${active ? "bg-white/20" : "bg-slate-200 dark:bg-white/10"}`}>{count}</span>
    </button>
  );
}
