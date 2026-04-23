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
  getCompanyAccess, 
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
    if (res.success) setCompanies(res.companies || []);
    setLoading(false);
  };

  const loadExperts = async () => {
    const res = await getExperts();
    if (res.success) setExperts(res.experts || []);
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
      driveFolderId: newFolderId 
    });
    if (res && (res as any).id) {
      setNewName("");
      setNewFolderId("");
      loadCompanies();
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
    const res = await getCompanyAccess(company.id);
    if (res.success) {
      setAuthorizedUserIds(res.access?.map((a: any) => a.userId) || []);
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
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3 uppercase">
             <Building2 className="text-blue-600 dark:text-blue-400" size={32} />
             {userRole === "CLIENT" ? "Dosyalarım" : "Firma Yönetimi"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium italic">
            {userRole === "CLIENT" ? "Erişim yetkiniz bulunan firmalar ve dijital arşivleri." : "Firma ve uzman yetki tanımlamaları merkezi."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
         {/* ADD COMPANY FORM (ADMIN ONLY) */}
        {isAdmin && (
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 p-7 rounded-[0.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg transform -rotate-3">
                    <UserPlus size={20} />
                 </div>
                 <h2 className="font-black text-slate-900 dark:text-white tracking-tight uppercase text-sm">Yeni Firma Ekle</h2>
              </div>
              <form onSubmit={handleAddCompany} className="space-y-4">
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Firma Adı"
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm"
                />
                <input 
                  type="text" 
                  value={newFolderId}
                  onChange={(e) => setNewFolderId(e.target.value)}
                  placeholder="Google Drive Folder ID"
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-xs"
                />
                <button 
                  type="submit"
                  disabled={isSubmitting || !newName}
                  className="w-full p-5 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-black uppercase tracking-tighter shadow-xl hover:bg-black dark:hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                  KAYDET
                </button>
              </form>
            </div>
          </div>
        )}

        {/* COMPANIES TABLE */}
        <div className={isAdmin ? "lg:col-span-2" : "lg:col-span-3"}>
          <div className="bg-white dark:bg-slate-900 rounded-[0.625rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b dark:border-slate-800">
                  <tr>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Firma</th>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">İstatistik</th>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800 italic">
                  {loading ? (
                    <tr><td colSpan={3} className="p-16 text-center animate-pulse text-slate-300 dark:text-slate-700 font-bold tracking-widest">YÜKLENİYOR...</td></tr>
                  ) : companies.length === 0 ? (
                    <tr><td colSpan={3} className="p-16 text-center text-slate-400 dark:text-slate-600 font-medium italic">Henüz firma bulunmuyor.</td></tr>
                  ) : (
                    companies.map((company) => (
                        <tr key={company.id} className="group hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-all">
                        <td className="p-6">
                           <Link href={`/dashboard/companies/${company.id}`} className="block group/link">
                              <div className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm mb-0.5 group-hover/link:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-2">
                                 {company.name}
                                 <ArrowUpRight size={14} className="opacity-0 group-hover/link:opacity-100 transition-all" />
                              </div>
                              <div className="text-[10px] font-mono text-slate-400 dark:text-slate-600 font-medium">ID: {company.id?.slice(-8)}</div>
                           </Link>
                        </td>
                        <td className="p-6">
                           <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                                 <Users size={14} className="text-blue-500 dark:text-blue-400" /> {company._count?.userAccess || 0}
                              </span>
                              <span className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                                 <Building2 size={14} className="text-zinc-400 dark:text-slate-600" /> {company._count?.reports || 0}
                              </span>
                           </div>
                        </td>
                        <td className="p-6 text-right flex justify-end gap-2">
                          {isAdmin && (
                            <button 
                              onClick={() => openExpertManager(company)}
                              className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm"
                              title="Uzman Yönetimi"
                            >
                              <Users size={18} />
                            </button>
                          )}
                          <a 
                            href={`https://drive.google.com/drive/folders/${company.driveFolderId}`} 
                            target="_blank" 
                            className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm"
                            title="Drive Gözat"
                          >
                            <FolderOpen size={18} />
                          </a>
                          {isAdmin && (
                            <button 
                              onClick={() => handleDelete(company.id)} 
                              className="p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-sm"
                              title="Sil"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[0.75rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border dark:border-slate-800">
              {/* Modal Header */}
              <div className="bg-slate-900 p-8 text-white flex justify-between items-center bg-gradient-to-br from-slate-900 to-blue-900">
                 <div className="space-y-1">
                    <h3 className="text-2xl font-black tracking-tight uppercase italic">{selectedCompany.name}</h3>
                    <p className="text-xs text-blue-300 font-bold uppercase tracking-widest flex items-center gap-2">
                       <ShieldCheck size={14} /> Uzman Yetkilendirme
                    </p>
                 </div>
                 <button 
                   onClick={() => setSelectedCompany(null)}
                   className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all"
                 >
                    <X size={20} />
                 </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 max-h-[450px] overflow-y-auto space-y-4">
                 {modalLoading ? (
                    <div className="flex flex-col items-center justify-center p-12 text-slate-400 dark:text-slate-600">
                        <Loader2 className="animate-spin mb-2" size={32} />
                        <span className="font-bold text-xs uppercase">Uzmanlar Yükleniyor...</span>
                    </div>
                 ) : experts.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 dark:text-slate-600 italic">Sistemde henüz uzman tanımlanmamış.</div>
                 ) : (
                    experts.map((user) => {
                       const hasAccess = authorizedUserIds.includes(user.id);
                       return (
                          <div 
                            key={user.id} 
                            className={`p-5 rounded-md border-2 flex items-center justify-between transition-all ${hasAccess ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/50 translate-x-2" : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800"}`}
                          >
                             <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-md flex items-center justify-center shadow-md ${hasAccess ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500"}`}>
                                   <UserIcon size={24} />
                                </div>
                                <div>
                                   <div className="font-black text-slate-900 dark:text-white text-sm tracking-tight">{user.name}</div>
                                   <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500">{user.email}</div>
                                </div>
                             </div>
                             
                             <button
                               onClick={() => handleToggleAccess(user.id)}
                               className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${hasAccess ? "bg-slate-900 dark:bg-slate-700 text-white" : "bg-blue-600 text-white"}`}
                             >
                                {hasAccess ? "YETKİYİ AL" : "YETKİ VER"}
                             </button>
                          </div>
                       )
                    })
                 )}
              </div>

              {/* Modal Footer */}
              <div className="p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                 <button 
                  onClick={() => setSelectedCompany(null)}
                  className="w-full p-4 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
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
