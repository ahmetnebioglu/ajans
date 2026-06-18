"use client";

import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Plus, 
  Trash2, 
  Loader2,
  FolderOpen,
  Users,
  X,
  ShieldCheck,
  UserCheck,
  UserPlus,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { 
  getCompanies, 
  createCompany, 
  deleteCompany, 
  getExperts, 
  getWorkspaceAccess, 
  toggleExpertAccess 
} from "../../actions/admin-actions";

export default function CompaniesPage() {
  const { data: session } = useSession();
  const [companies, setCompanies] = useState<any[]>([]);
  const [experts, setExperts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newName, setNewName] = useState("");
  const [newFolderId, setNewFolderId] = useState("");

  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === "ADMIN";

  // Expert Modal State
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);
  const [authorizedUserIds, setAuthorizedUserIds] = useState<string[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  const loadCompanies = async () => {
    setLoading(true);
    const res = await getCompanies();
    if (res.success) setCompanies(res.data || []);
    setLoading(false);
  };

  const loadExperts = async () => {
    const res = await getExperts();
    if (res.success) setExperts(res.data || []);
  };

  useEffect(() => {
    loadCompanies();
    loadExperts();
  }, []);

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    setIsSubmitting(true);
    const res = await createCompany({ 
      name: newName, 
    });
    if (res.success) {
      setNewName("");
      await loadCompanies();
    } else {
      alert(res.error || "Firma eklenirken bir hata oluştu.");
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bu firmayı silmek istediğinize emin misiniz?")) {
      const res = await deleteCompany(id);
      if (res.success) loadCompanies();
    }
  };

  const openExpertManager = async (company: any) => {
    setSelectedCompany(company);
    setModalLoading(true);
    const res = await getWorkspaceAccess(company.id);
    if (res.success) {
      setAuthorizedUserIds(res.data?.map((a: any) => a.userId) || []);
    }
    setModalLoading(false);
  };

  const handleToggleAccess = async (userId: string) => {
    if (!selectedCompany) return;
    const hasAccess = authorizedUserIds.includes(userId);
    const newHasAccess = !hasAccess;

    // UI'da anında güncelle (Optimistic)
    if (newHasAccess) setAuthorizedUserIds(prev => [...prev, userId]);
    else setAuthorizedUserIds(prev => prev.filter(id => id !== userId));

    const res = await toggleExpertAccess(userId, selectedCompany.id, newHasAccess);
    if (!res.success) {
        // Hata durumunda eski haline getir
        if (newHasAccess) setAuthorizedUserIds(prev => prev.filter(id => id !== userId));
        else setAuthorizedUserIds(prev => [...prev, userId]);
        alert(res.error);
    } else {
        // Ana sayfadaki istatistikleri güncellemek için firmaları tekrar çek
        loadCompanies();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-2 uppercase italic leading-none">
             <Building2 className="text-blue-600 dark:text-blue-400" size={28} />
             {userRole === "CLIENT" ? "Dosyalarım" : "Firma Yönetimi"}
          </h1>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest italic">
            {userRole === "CLIENT" ? "Erişim yetkiniz bulunan firmalar ve dijital arşivleri." : "Firma ve uzman yetki tanımlamaları merkezi."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
         {/* ADD COMPANY FORM (ADMIN ONLY) */}
        {isAdmin && (
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-[4px] border border-slate-200 dark:border-zinc-800 shadow-2xl space-y-4">
              <div className="flex items-center gap-2">
                 <div className="w-9 h-9 bg-zinc-950 dark:bg-blue-600 text-white rounded-[4px] flex items-center justify-center shadow-lg rotate-2">
                    <UserPlus size={18} />
                 </div>
                 <h2 className="font-black text-slate-900 dark:text-white tracking-tighter uppercase text-[11px]">Yeni Firma Ekle</h2>
              </div>
               <form onSubmit={handleAddCompany} className="space-y-3">
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Firma Adı"
                  className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 dark:text-white rounded-[4px] outline-none focus:ring-1 focus:ring-blue-500 transition-all font-black text-[10px] uppercase"
                />
                <button 
                  type="submit"
                  disabled={isSubmitting || !newName}
                  className="w-full p-4 bg-zinc-900 dark:bg-blue-600 text-white rounded-[4px] font-black uppercase tracking-tighter shadow-xl hover:bg-black dark:hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95 text-[10px]"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                  KAYDET
                </button>
              </form>
            </div>
          </div>
        )}

        {/* COMPANIES TABLE */}
        <div className={isAdmin ? "lg:col-span-2" : "lg:col-span-3"}>
          <div className="bg-white dark:bg-zinc-900 rounded-[4px] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-zinc-50 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-950/40 italic">
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Firma Listesi</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 italic">
                  <tr>
                    <th className="p-8 text-[9px] font-black uppercase text-slate-400 dark:text-zinc-500 tracking-widest">Firma</th>
                    <th className="p-8 text-[9px] font-black uppercase text-slate-400 dark:text-zinc-500 tracking-widest">İstatistik</th>
                    <th className="p-8 text-[9px] font-black uppercase text-slate-400 dark:text-zinc-500 tracking-widest text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50 italic">
                  {loading ? (
                    <tr><td colSpan={3} className="p-16 text-center animate-pulse text-slate-300 dark:text-zinc-800 font-bold tracking-widest">YÜKLENİYOR...</td></tr>
                  ) : companies.length === 0 ? (
                    <tr><td colSpan={3} className="p-16 text-center text-slate-400 dark:text-zinc-700 font-medium italic">Henüz firma bulunmuyor.</td></tr>
                  ) : (
                    companies.map((company) => (
                        <tr key={company.id} className="group hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-all">
                        <td className="p-8">
                           <Link href={`/dashboard/companies/${company.id}`} className="block group/link">
                              <div className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-xs mb-0.5 group-hover/link:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-2">
                                 {company.name}
                                 <ArrowUpRight size={12} className="opacity-0 group-hover/link:opacity-100 transition-all" />
                              </div>
                              <div className="text-[9px] font-mono text-slate-400 dark:text-zinc-600 font-medium">ID: {company.id?.slice(-8)}</div>
                           </Link>
                        </td>
                        <td className="p-8">
                           <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1 text-[10px] font-black text-slate-500 dark:text-slate-400 italic">
                                 <Users size={12} className="text-blue-500 dark:text-blue-400" /> {company._count?.users || 0}
                              </span>
                              <span className="flex items-center gap-1 text-[10px] font-black text-slate-500 dark:text-slate-400 italic">
                                 <Building2 size={12} className="text-zinc-400 dark:text-slate-600" /> {company._count?.reports || 0}
                              </span>
                           </div>
                        </td>
                        <td className="p-8 text-right">
                          <div className="flex justify-end gap-1.5">
                            {isAdmin && (
                              <button 
                                onClick={() => openExpertManager(company)}
                                className="p-2 text-slate-400 dark:text-zinc-700 hover:text-indigo-600 transition-colors"
                                title="Uzman Yönetimi"
                              >
                                <Users size={16} />
                              </button>
                            )}
                            <a 
                              href={`/dashboard/companies/${company.id}`} 
                              className="p-2 text-slate-400 dark:text-zinc-700 hover:text-blue-600 transition-colors"
                              title="Dosyaları Görüntüle"
                            >
                              <FolderOpen size={16} />
                            </a>
                            {isAdmin && (
                              <button 
                                onClick={() => handleDelete(company.id)} 
                                className="p-2 text-slate-400 dark:text-zinc-700 hover:text-rose-600 transition-colors"
                                title="Sil"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[4px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-zinc-800">
              {/* Modal Header */}
              <div className="bg-zinc-950 p-6 text-white flex justify-between items-center bg-gradient-to-br from-zinc-950 to-blue-900 border-b border-zinc-800">
                 <div className="space-y-1">
                    <h3 className="text-xl font-black tracking-tighter uppercase italic">{selectedCompany.name}</h3>
                    <p className="text-[9px] text-blue-300 font-black uppercase tracking-widest flex items-center gap-2 italic">
                       <ShieldCheck size={12} /> Uzman Yetkilendirme
                    </p>
                 </div>
                 <button 
                   onClick={() => setSelectedCompany(null)}
                   className="p-1.5 bg-white/5 hover:bg-white/10 rounded-[4px] transition-all border border-white/10"
                 >
                    <X size={18} />
                 </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 max-h-[400px] overflow-y-auto space-y-3 italic font-medium">
                 {modalLoading ? (
                    <div className="flex flex-col items-center justify-center p-8 text-slate-400 dark:text-slate-600">
                        <Loader2 className="animate-spin mb-2" size={24} />
                        <span className="font-black text-[9px] uppercase tracking-widest">Uzmanlar Yükleniyor...</span>
                    </div>
                 ) : experts.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 dark:text-slate-600 italic font-black uppercase text-[9px]">Sistemde henüz uzman tanımlanmamış.</div>
                 ) : (
                    experts.map((user) => {
                       const hasAccess = authorizedUserIds.includes(user.id);
                       return (
                          <div 
                            key={user.id} 
                            className={`p-4 rounded-[4px] border flex items-center justify-between transition-all ${hasAccess ? "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/50 translate-x-1" : "bg-white dark:bg-zinc-800 border-slate-100 dark:border-zinc-800"}`}
                          >
                             <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-[4px] flex items-center justify-center shadow-md ${hasAccess ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-zinc-700 text-slate-400 dark:text-slate-500"}`}>
                                   <UserIcon size={20} />
                                </div>
                                <div>
                                   <div className="font-black text-slate-900 dark:text-white text-xs tracking-tighter uppercase leading-none mb-1">{user.name}</div>
                                   <div className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-tighter">{user.email}</div>
                                </div>
                             </div>
                             
                             <button
                               onClick={() => handleToggleAccess(user.id)}
                               className={`px-4 py-2 rounded-[4px] text-[8px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${hasAccess ? "bg-zinc-950 dark:bg-zinc-950 border border-zinc-800 text-white" : "bg-blue-600 text-white"}`}
                             >
                                {hasAccess ? "YETKİYİ AL" : "YETKİ VER"}
                             </button>
                          </div>
                       )
                    })
                 )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-slate-50 dark:bg-zinc-900/50 border-t border-slate-100 dark:border-zinc-800">
                 <button 
                  onClick={() => setSelectedCompany(null)}
                  className="w-full p-3 bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 rounded-[4px] font-black uppercase text-[10px] tracking-widest hover:bg-slate-300 dark:hover:bg-zinc-700 transition-all border border-transparent hover:border-zinc-400"
                 >
                    Kapat
                 </button>
              </div>
           </div>
        </div>
      )}
      
    </div>
  );
}

// Icon helper for consistent design
function UserIcon({ size, ...props }: any) {
    return <Users size={size} {...props} />;
}
