"use client";

import { useState } from "react";
import { Trash2, Plus, XCircle, Search } from "lucide-react";
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
    if (res.success && res.nace) {
      setData([res.nace, ...data]);
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
    <div className="p-6 space-y-6 leading-none italic">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
          <input 
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="NACE Kodu veya açıklama ile ara..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-600/5 transition-all"
          />
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)} 
          className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-600 transition-colors shadow-lg active:scale-95"
        >
          {isAdding ? <XCircle size={16} /> : <Plus size={16} />}
          {isAdding ? "İptal" : "Yeni Kod Ekle"}
        </button>
      </div>

      {isAdding && (
        <div className="max-w-3xl mx-auto p-10 border border-slate-100 dark:border-slate-800 rounded-[3rem] bg-white dark:bg-slate-900 shadow-2xl space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center">
                <Plus size={24} />
             </div>
             <div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">Yeni NACE Kodu Ekle</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1 italic">Sisteme yeni bir tehlike sınıfı tanımı ekleyin</p>
             </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 italic">NACE Kodu</label>
                <input 
                  type="text"
                  value={newNace.code} 
                  onChange={e => setNewNace({...newNace, code: e.target.value})} 
                  placeholder="Örn: 01.11.07"
                  className="w-full p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-emerald-600/5 transition-all"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 italic">Tehlike Sınıfı</label>
                <div className="relative">
                   <select 
                     value={newNace.dangerClass} 
                     onChange={e => setNewNace({...newNace, dangerClass: e.target.value})}
                     className="w-full p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-emerald-600/5 transition-all appearance-none cursor-pointer"
                   >
                     <option value="Az Tehlikeli">Az Tehlikeli</option>
                     <option value="Tehlikeli">Tehlikeli</option>
                     <option value="Çok Tehlikeli">Çok Tehlikeli</option>
                   </select>
                   <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Search size={14} className="rotate-90" />
                   </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 italic">İş Tanımı</label>
              <textarea 
                value={newNace.description} 
                onChange={e => setNewNace({...newNace, description: e.target.value})} 
                placeholder="İş tanımını detaylıca girin..."
                rows={4}
                className="w-full p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-emerald-600/5 transition-all resize-none"
              />
            </div>
          </div>

          <button 
            onClick={handleAdd} 
            disabled={loading}
            className="w-full py-6 bg-emerald-600 text-white rounded-[2rem] text-[12px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-emerald-600/20 disabled:opacity-50 transition-all hover:bg-slate-900 dark:hover:bg-emerald-700 hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-4"
          >
            {loading ? "KAYDEDİLİYOR..." : "KODU SİSTEME KAYDET"}
          </button>
        </div>
      )}

      <div className="overflow-hidden border border-slate-100 dark:border-slate-800 rounded-[2rem] bg-white dark:bg-slate-900 shadow-2xl">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 italic">
              <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">NACE Kodu</th>
              <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">İş Tanımı</th>
              <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">Sınıf</th>
              <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-20 text-center text-slate-300 dark:text-slate-700 font-black uppercase tracking-widest italic">Veri bulunamadı.</td>
              </tr>
            ) : (
              filteredData.slice(0, 100).map((item) => (
                <tr key={item.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-5 font-bold text-slate-900 dark:text-white whitespace-nowrap">{item.code}</td>
                  <td className="p-5 text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">{item.description}</td>
                  <td className="p-5">
                    <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full border ${
                      item.dangerClass.includes("Çok") ? 'bg-rose-50 text-rose-600 border-rose-100' :
                      item.dangerClass.includes("Az") ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {item.dangerClass}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <button 
                      onClick={() => handleDelete(item.id)} 
                      disabled={loading} 
                      className="p-3 text-slate-300 dark:text-slate-700 hover:text-rose-600 dark:hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
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
