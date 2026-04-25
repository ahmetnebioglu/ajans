"use client";

import { useState } from "react";
import { Trash2, Plus, XCircle, Search, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { addNaceCode, deleteNaceCode } from "../../../actions/cms-actions";

export function NaceCodesTable({ initialData }: { initialData: any[] }) {
  const [data, setData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newNace, setNewNace] = useState({
    code: "",
    description: "",
    dangerClass: "Az Tehlikeli"
  });

  const filteredData = data.filter(item => 
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = async () => {
    if (!newNace.code || !newNace.description) {
      alert("Lütfen kod ve açıklama alanlarını doldurun.");
      return;
    }

    setLoading(true);
    const res = await addNaceCode(newNace);
    if (res.success && res.data) {
      setData([res.data, ...data]);
      setIsAdding(false);
      setNewNace({ code: "", description: "", dangerClass: "Az Tehlikeli" });
    } else {
      alert(res.error || "Hata oluştu.");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu NACE kodunu silmek istediğinize emin misiniz?")) return;
    setLoading(true);
    const res = await deleteNaceCode(id);
    if (res.success) {
      setData(data.filter(d => d.id !== id));
    } else {
      alert(res.error || "Silinirken hata oluştu.");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 leading-none italic">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-1">
           <Link href="/dashboard/cms" className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 transition-colors text-[9px] font-black uppercase tracking-widest mb-2 group">
              <ChevronLeft size={12} className="group-hover:-translate-x-1 transition-transform" /> CMS Hub
           </Link>
           <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
              NACE <span className="text-emerald-600">Kodları</span>
           </h1>
           <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
              Tehlike Sınıfları listesini yönetin ve güncelleyin
           </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={16} />
            <input 
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="NACE Kodu veya açıklama ile ara..."
              className="w-full pl-14 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[4px] text-[11px] font-bold outline-none focus:ring-4 focus:ring-emerald-600/5 transition-all shadow-sm italic"
            />
          </div>
          <button 
            onClick={() => setIsAdding(!isAdding)} 
            className="px-8 py-4 bg-emerald-600 text-white rounded-[4px] text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all shadow-sm shadow-emerald-600/20 active:scale-95 hover:bg-slate-900 dark:hover:bg-emerald-700 w-full md:w-auto justify-center"
          >
            {isAdding ? <XCircle size={16} /> : <Plus size={16} />}
            {isAdding ? "İPTAL" : "YENİ KOD EKLE"}
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="p-8 border border-slate-200 dark:border-slate-800 rounded-[4px] bg-white dark:bg-slate-900 shadow-sm space-y-8 animate-in fade-in slide-in-from-top-4 duration-500 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-600" />
          <div className="flex items-center gap-5">
             <div className="w-12 h-12 bg-emerald-600 text-white rounded-[4px] flex items-center justify-center shadow-xl shadow-emerald-600/20 rotate-3">
                <Plus size={24} />
             </div>
             <div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">YENİ NACE KODU TANIMLA</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1 italic">Sektörel tehlike sınıfı veritabanına yeni kayıt ekleyin</p>
             </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 italic ml-1">NACE KODU</label>
                <input 
                  type="text"
                  value={newNace.code} 
                  onChange={e => setNewNace({...newNace, code: e.target.value})} 
                  placeholder="Örn: 01.11.07"
                  className="w-full p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[4px] text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-emerald-600/5 transition-all"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 italic ml-1">TEHLİKE SINIFI</label>
                <div className="relative">
                   <select 
                     value={newNace.dangerClass} 
                     onChange={e => setNewNace({...newNace, dangerClass: e.target.value})}
                     className="w-full p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[4px] text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-emerald-600/5 transition-all appearance-none cursor-pointer uppercase italic"
                   >
                     <option value="Az Tehlikeli">AZ TEHLİKELİ</option>
                     <option value="Tehlikeli">TEHLİKELİ</option>
                     <option value="Çok Tehlikeli">ÇOK TEHLİKELİ</option>
                   </select>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 italic ml-1">İŞ TANIMI / AÇIKLAMA</label>
              <textarea 
                value={newNace.description} 
                onChange={e => setNewNace({...newNace, description: e.target.value})} 
                placeholder="NACE koduna ait iş tanımını detaylıca girin..."
                rows={4}
                className="w-full p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[4px] text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-emerald-600/5 transition-all resize-none italic leading-relaxed"
              />
            </div>
          </div>

          <button 
            onClick={handleAdd} 
            disabled={loading}
            className="w-full py-5 bg-emerald-600 text-white rounded-[4px] text-[11px] font-black uppercase tracking-[0.2em] shadow-sm shadow-emerald-600/20 disabled:opacity-50 transition-all hover:bg-slate-900 dark:hover:bg-emerald-700 hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3 italic"
          >
            {loading ? "İŞLENİYOR..." : "KODU VERİTABANINA KAYDET"}
          </button>
        </div>
      )}

      <div className="overflow-hidden border border-slate-200 dark:border-slate-800 rounded-[4px] bg-white dark:bg-slate-900 shadow-sm">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600">NACE Kod Arşivi</p>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 italic">
              <th className="p-8 text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">KOD & TANIM</th>
              <th className="p-8 text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">TEHLİKE SINIFI</th>
              <th className="p-8 text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 text-right">İŞLEMLER</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-24 text-center text-slate-300 dark:text-slate-800 font-black uppercase tracking-widest text-[11px] italic">NACE kodu bulunamadı.</td>
              </tr>
            ) : (
              filteredData.slice(0, 50).map((item) => (
                <tr key={item.id} className="border-b border-slate-50 dark:border-slate-950 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all group">
                  <td className="p-8">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-[4px] flex items-center justify-center text-slate-400 dark:text-slate-600 group-hover:bg-emerald-600 group-hover:text-white group-hover:rotate-6 transition-all duration-500 shadow-inner shrink-0 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-black tracking-tighter italic leading-none">{item.code.split('.')[0]}</span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="font-black text-slate-900 dark:text-white text-base tracking-tighter uppercase italic leading-none group-hover:text-emerald-600 transition-colors">{item.code}</span>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 italic leading-relaxed max-w-2xl">{item.description}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-8">
                    <span className={`px-5 py-2 text-[9px] font-black uppercase tracking-[0.1em] rounded-[4px] border shadow-sm italic inline-block ${
                      item.dangerClass.includes("Çok") ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
                      item.dangerClass.includes("Az") ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                      'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    }`}>
                      {item.dangerClass}
                    </span>
                  </td>
                  <td className="p-8 text-right">
                    <button 
                      onClick={() => handleDelete(item.id)} 
                      disabled={loading} 
                      className="p-4 text-slate-300 dark:text-slate-700 hover:text-rose-600 dark:hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-[4px] transition-all shadow-sm"
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
  );
}
