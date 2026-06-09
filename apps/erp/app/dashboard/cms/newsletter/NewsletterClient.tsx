"use client";

import React, { useState } from "react";
import { 
  Users, 
  Send, 
  Search, 
  Filter, 
  Trash2, 
  Mail, 
  Calendar, 
  Tag, 
  CheckCircle2, 
  XCircle,
  Loader2,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { deleteSubscriber, updateSubscriberStatus, sendNewsletter } from "../../../actions/newsletter-actions";
import RichTextEditor from "../../../components/cms/RichTextEditor";

interface NewsletterClientProps {
  initialSubscribers: any[];
  projects: string[];
}

export function NewsletterClient({ initialSubscribers, projects }: NewsletterClientProps) {
  const [activeTab, setActiveTab] = useState<"list" | "send">("list");
  const [subscribers, setSubscribers] = useState(initialSubscribers);
  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  // Mail Gönderim State
  const [mailData, setMailData] = useState({
    tenantId: "all",
    subject: "",
    content: ""
  });

  const filteredSubscribers = subscribers.filter(s => {
    const matchesSearch = s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = projectFilter === "all" || s.tenantId === projectFilter;
    return matchesSearch && matchesProject;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Bu aboneyi silmek istediğinize emin misiniz?")) return;
    const res = await deleteSubscriber(id);
    if (res.success) {
      setSubscribers(subscribers.filter(s => s.id !== id));
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "unsubscribed" : "active";
    const res = await updateSubscriberStatus(id, newStatus);
    if (res.success) {
      setSubscribers(subscribers.map(s => s.id === id ? { ...s, status: newStatus } : s));
    }
  };

  const handleSend = async () => {
    if (!mailData.subject || !mailData.content) {
      alert("Lütfen konu ve içerik alanlarını doldurun.");
      return;
    }
    setLoading(true);
    const res = await sendNewsletter(mailData);
    if (res.success) {
      alert(res.message);
      setMailData({ tenantId: "all", subject: "", content: "" });
    }
    setLoading(false);
  };
  return (
    <div className="space-y-6">
      {/* TABS */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-[4px] w-fit">
        <button 
          onClick={() => setActiveTab("list")}
          className={`px-6 py-2.5 rounded-[4px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'list' ? 'bg-white dark:bg-emerald-600 text-slate-900 dark:text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
        >
          <Users size={14} /> Aboneler
        </button>
        <button 
          onClick={() => setActiveTab("send")}
          className={`px-6 py-2.5 rounded-[4px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'send' ? 'bg-white dark:bg-emerald-600 text-slate-900 dark:text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
        >
          <Send size={14} /> Bülten Gönder
        </button>
      </div>

      {activeTab === "list" ? (
        <div className="space-y-4">
          {/* FILTERS */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text"
                placeholder="E-posta ile ara..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[4px] text-[11px] font-bold outline-none focus:ring-4 focus:ring-emerald-600/5 transition-all italic"
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Filter className="text-slate-400" size={16} />
              <select 
                value={projectFilter}
                onChange={e => setProjectFilter(e.target.value)}
                className="flex-1 md:w-44 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[4px] text-[11px] font-black outline-none cursor-pointer appearance-none uppercase italic"
              >
                <option value="all">TÜM PROJELER</option>
                {projects.map(p => (
                  <option key={p} value={p}>{p.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white dark:bg-slate-900 rounded-[4px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 italic">
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600">Abone Listesi</p>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 italic">
                  <th className="p-8 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">E-Posta</th>
                  <th className="p-8 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Durum</th>
                  <th className="p-8 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Kaynak</th>
                  <th className="p-8 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Kayıt Tarihi</th>
                  <th className="p-8 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {filteredSubscribers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-24 text-center text-slate-300 dark:text-slate-800 font-black uppercase tracking-widest italic">Abone bulunamadı.</td>
                  </tr>
                ) : (
                  filteredSubscribers.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="p-8">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-[4px] flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-colors border border-slate-200 dark:border-slate-800 shadow-inner">
                            <Mail size={16} />
                          </div>
                          <span className="text-[12px] font-bold text-slate-900 dark:text-white italic">{s.email}</span>
                        </div>
                      </td>
                      <td className="p-8">
                        <button 
                          onClick={() => handleStatusToggle(s.id, s.status)}
                          className={`px-4 py-1.5 rounded-[4px] text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all ${s.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'}`}
                        >
                          {s.status === 'active' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                          {s.status === 'active' ? 'AKTİF' : 'PASİF'}
                        </button>
                      </td>
                      <td className="p-8">
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-[4px] text-[8px] font-black uppercase tracking-widest border border-emerald-500/10 italic">
                          <Tag size={10} className="inline mr-1" /> {s.tenantId}
                        </span>
                      </td>
                      <td className="p-8">
                        <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                          <Calendar size={12} />
                          <span className="text-[10px] font-bold uppercase italic">{format(new Date(s.createdAt), "dd MMM yyyy", { locale: tr })}</span>
                        </div>
                      </td>
                      <td className="p-8 text-right">
                        <button 
                          onClick={() => handleDelete(s.id)}
                          className="p-3 text-slate-300 dark:text-slate-700 hover:text-rose-600 dark:hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-[4px] transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="p-8 bg-white dark:bg-slate-900 rounded-[4px] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-emerald-600 text-white rounded-[4px] flex items-center justify-center shadow-xl shadow-emerald-600/20 rotate-3">
                  <Send size={20} />
               </div>
               <div>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Bülten Hazırla</h3>
                  <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-1 italic">Hedef kitlenizi seçin ve mesajınızı oluşturun</p>
               </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 italic">Hedef Proje</label>
                  <select 
                    value={mailData.tenantId}
                    onChange={e => setMailData({...mailData, tenantId: e.target.value})}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[4px] text-[11px] font-black text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-emerald-600/5 transition-all appearance-none cursor-pointer uppercase italic"
                  >
                    <option value="all">TÜM ABONELER</option>
                    {projects.map(p => (
                      <option key={p} value={p}>{p.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 italic">E-Posta Konusu</label>
                  <input 
                    type="text"
                    value={mailData.subject}
                    onChange={e => setMailData({...mailData, subject: e.target.value})}
                    placeholder="Bülten başlığını girin..."
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[4px] text-[11px] font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-emerald-600/5 transition-all italic"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 italic">Bülten İçeriği</label>
                <div className="rounded-[4px] overflow-hidden border border-slate-100 dark:border-slate-800">
                   <RichTextEditor 
                     content={mailData.content} 
                     onChange={(content) => setMailData({...mailData, content})} 
                   />
                </div>
              </div>

              <button 
                onClick={handleSend}
                disabled={loading}
                className="w-full py-5 bg-emerald-600 text-white rounded-[4px] text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/20 disabled:opacity-50 transition-all hover:bg-slate-900 dark:hover:bg-emerald-700 hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3 italic"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <><Sparkles size={16} /> BÜLTENİ GÖNDER</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

