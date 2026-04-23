"use client";

import React, { useState, useEffect } from "react";
import { 
  Mail, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  User, 
  Phone, 
  MessageSquare,
  Search,
  Filter,
  FileText,
  AlertCircle
} from "lucide-react";
import { getMessages, markRequestAsRead as markAsRead, deleteMessage } from "../../../actions/admin-actions";

export default function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "ref">("all");

  const loadMessages = async () => {
    setLoading(true);
    const data = await getMessages();
    setMessages(data);
    setLoading(false);
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const filteredMessages = messages.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(search.toLowerCase()) || 
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      (m.subject || "").toLowerCase().includes(search.toLowerCase());
    
    if (filter === "unread") return matchesSearch && !m.isRead;
    if (filter === "ref") return matchesSearch && (m.subject || "").includes("Referans");
    return matchesSearch;
  });

  const handleRead = async (id: string, type: "contact" | "reference") => {
    const res = await markAsRead(id, type);
    if (res.success) loadMessages();
  };

  const handleDelete = async (id: string, type: "contact" | "reference") => {
    if (confirm("Bu mesajı silmek istediğinize emin misiniz?")) {
      const res = await deleteMessage(id, type);
      if (res.success) loadMessages();
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700 font-medium italic">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
           <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
              Gelen <span className="text-blue-600">Mesajlar</span>
           </h1>
           <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">
              İletişim formu ve referans taleplerini yönetin
           </p>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
           <button 
             onClick={() => setFilter("all")}
             className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === "all" ? "bg-slate-900 text-white" : "text-slate-400 hover:bg-slate-50"}`}
           >
              Hepsi
           </button>
           <button 
             onClick={() => setFilter("unread")}
             className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === "unread" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-50"}`}
           >
              Okunmamış
           </button>
           <button 
             onClick={() => setFilter("ref")}
             className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === "ref" ? "bg-emerald-600 text-white" : "text-slate-400 hover:bg-slate-50"}`}
           >
              Referans Talepleri
           </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative group max-w-2xl">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
         <input 
           type="text" 
           value={search}
           onChange={(e) => setSearch(e.target.value)}
           placeholder="İsim, e-posta veya konu ile ara..."
           className="w-full pl-16 pr-8 py-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-600/5 transition-all shadow-sm"
         />
      </div>

      {/* Messages Grid */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="py-20 text-center text-slate-400 uppercase font-black italic tracking-widest text-xs animate-pulse">
             Mesajlar Yükleniyor...
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="py-20 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
             <Mail className="mx-auto mb-4 text-slate-200" size={64} />
             <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Mesaj Bulunamadı</p>
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <div 
              key={msg.id} 
              className={`group bg-white dark:bg-slate-900 border rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden relative ${!msg.isRead ? "border-l-8 border-l-blue-600 border-slate-200 dark:border-slate-800" : "border-slate-100 dark:border-slate-800"}`}
            >
               <div className="p-10 flex flex-col lg:flex-row gap-10">
                  {/* Left: Sender Info */}
                  <div className="lg:w-72 shrink-0 space-y-6">
                     <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-3 ${msg.subject?.includes("Referans") ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"}`}>
                           {msg.subject?.includes("Referans") ? <FileText size={28} /> : <User size={28} />}
                        </div>
                        <div className="min-w-0">
                           <div className="font-black text-slate-900 dark:text-white uppercase truncate tracking-tight">{msg.name}</div>
                           <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate">{msg.email}</div>
                        </div>
                     </div>

                     <div className="space-y-3 pt-4 border-t border-slate-50 dark:border-slate-800">
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-400">
                           <Clock size={14} /> {new Date(msg.createdAt).toLocaleString("tr-TR")}
                        </div>
                        {msg.subject && (
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${msg.subject.includes("Referans") ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-blue-50 text-blue-600 border-blue-100"}`}>
                             {msg.subject}
                          </div>
                        )}
                     </div>
                  </div>

                  {/* Right: Content */}
                  <div className="flex-1 space-y-6">
                     <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700 min-h-[120px] relative">
                        <MessageSquare className="absolute top-6 right-6 text-slate-200 dark:text-slate-700" size={32} />
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                           {msg.message}
                        </p>
                     </div>

                     <div className="flex items-center justify-end gap-3">
                        {!msg.isRead && (
                          <button 
                            onClick={() => handleRead(msg.id, msg.type)}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:scale-105 transition-transform"
                          >
                             Okundu İşaretle
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(msg.id, msg.type)}
                          className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                        >
                           <Trash2 size={18} />
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
