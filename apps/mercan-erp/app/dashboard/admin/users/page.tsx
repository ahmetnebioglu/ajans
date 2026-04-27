"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Shield, 
  Mail, 
  Calendar, 
  UserCircle, 
  Loader2,
  CheckCircle2,
  Building,
  ArrowRightLeft,
  X
} from "lucide-react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useTheme } from "next-themes";
import { getAllUsers, updateUserRole, getCompanies, toggleExpertAccess } from "../../../actions/admin-actions";

export default function UserManagementPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark" || (theme === "system" && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const { data: session, status } = useSession();
  const [users, setUsers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Sayfa kilit kontrolü (Client-side)
  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && userRole !== "ADMIN")) {
       redirect("/dashboard");
    }
  }, [status, userRole]);

  const loadData = async () => {
    setLoading(true);
    const [userRes, compRes] = await Promise.all([
      getAllUsers(),
      getCompanies()
    ]);
    if (userRes.success) setUsers(userRes.data || []);
    if (compRes.success) setCompanies(compRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (userRole === "ADMIN") {
      loadData();
    }
  }, [userRole]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    const res = await updateUserRole(userId, newRole);
    if (res.success) {
      await loadData();
    } else {
      alert(res.error);
    }
    setUpdatingId(null);
  };

  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userAccessIds, setUserAccessIds] = useState<string[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  const openAssignmentModal = (user: any) => {
    setSelectedUser(user);
    setUserAccessIds(user.companyAccess.map((a: any) => a.companyId || a.company.id));
  };

  const handleToggleAccess = async (userId: string, companyId: string) => {
    setModalLoading(true);
    const hasAccess = userAccessIds.includes(companyId);
    const res = await toggleExpertAccess(userId, companyId, !hasAccess);
    if (res.success) {
      if (!hasAccess) setUserAccessIds(prev => [...prev, companyId]);
      else setUserAccessIds(prev => prev.filter(id => id !== companyId));
      await loadData();
    }
    setModalLoading(false);
  };

  if (loading || status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={48} />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600">Yönetim Paneli Hazırlanıyor</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700 italic font-medium">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-zinc-900 dark:bg-blue-600 text-white rounded-[4px] flex items-center justify-center shadow-xl rotate-2">
                <Shield size={24} />
             </div>
             <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none not-italic">
               KULLANICI <span className="text-blue-600 dark:text-blue-400">YÖNETİMİ</span>
             </h1>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.2em] pl-1">Sistem yetkileri ve rol hiyerarşisi merkezi kontrolü.</p>
        </div>
        
        <div className="bg-white dark:bg-zinc-900 px-4 py-3 rounded-[4px] border border-slate-200 dark:border-zinc-800 shadow-xl flex items-center gap-4">
           <div className="text-right">
              <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Toplam Kullanıcı</p>
              <p className="text-xl font-black text-slate-900 dark:text-white leading-none">{users.length}</p>
           </div>
           <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-[4px] flex items-center justify-center">
              <Users size={16} />
           </div>
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="bg-white dark:bg-zinc-900 rounded-[4px] border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden relative group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-zinc-900" />
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-950/50 border-b border-slate-100 dark:border-zinc-800">
                <th className="p-4 text-[9px] font-black uppercase text-slate-400 dark:text-zinc-600 tracking-widest">Kullanıcı Bilgileri</th>
                <th className="p-4 text-[9px] font-black uppercase text-slate-400 dark:text-zinc-600 tracking-widest">Mevcut Rol</th>
                <th className="p-4 text-[9px] font-black uppercase text-slate-400 dark:text-zinc-600 tracking-widest">Atanmış Firmalar</th>
                <th className="p-4 text-[9px] font-black uppercase text-slate-400 dark:text-zinc-600 tracking-widest text-right">Aksiyonlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-all duration-300 group/row">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {user.image ? (
                        <img src={user.image} alt="" className="w-10 h-10 rounded-[4px] shadow-lg border border-white dark:border-zinc-800 group-hover/row:scale-110 transition-transform" />
                      ) : (
                        <div className="w-10 h-10 bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-slate-500 rounded-[4px] flex items-center justify-center border border-white dark:border-zinc-800 shadow-md">
                          <UserCircle size={20} />
                        </div>
                      )}
                      <div>
                        <div className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-xs mb-0.5">{user.name || "İsimsiz Kullanıcı"}</div>
                        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          <Mail size={10} className="text-blue-500 dark:text-blue-400" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-[4px] text-[8px] font-black uppercase tracking-[0.15em] ${user.role === "ADMIN" ? "bg-zinc-950 dark:bg-blue-600/10 border border-zinc-800 dark:border-blue-900/30 text-amber-500 shadow-lg" : user.role === "EXPERT" ? "bg-blue-600 text-white shadow-lg" : "bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 text-slate-500"}`}>
                      {user.role === "ADMIN" && <Shield size={10} />}
                      {user.role}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex flex-wrap gap-1.5 max-w-[250px]">
                      {user.companyAccess?.length > 0 ? (
                        user.companyAccess.map((access: any) => (
                          <span key={access.company.id} className="px-2 py-0.5 bg-slate-50 dark:bg-zinc-800 text-slate-500 dark:text-slate-400 text-[8px] font-black uppercase tracking-tighter rounded-[4px] border border-slate-100 dark:border-zinc-700">
                            {access.company.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-[8px] text-slate-300 font-bold uppercase tracking-widest">Atanmış Firma Yok</span>
                      )}
                    </div>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                       {updatingId === user.id ? (
                         <Loader2 className="animate-spin text-blue-600" size={16} />
                       ) : (
                         <select 
                           value={user.role}
                           onChange={(e) => handleRoleChange(user.id, e.target.value)}
                           className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-2 rounded-[4px] text-[9px] font-black uppercase outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer dark:text-white"
                         >
                           <option value="ADMIN">ADMIN YAP</option>
                           <option value="EXPERT">EXPERT YAP</option>
                           <option value="CLIENT">CLIENT YAP</option>
                         </select>
                       )}
                       <button 
                         onClick={() => openAssignmentModal(user)}
                         className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white rounded-[4px] transition-all shadow-sm"
                       >
                         <Building size={14} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

       {/* ASSIGNMENT MODAL (Dynamic for any User) */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[4px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200 dark:border-zinc-800">
              <div className="bg-zinc-900 p-6 text-white flex justify-between items-center bg-gradient-to-br from-zinc-900 to-indigo-950">
                 <div className="space-y-1">
                    <h3 className="text-lg font-black tracking-tight uppercase italic">{selectedUser.name}</h3>
                    <p className="text-[9px] text-indigo-300 font-bold uppercase tracking-widest leading-none">FİRMA YETKİLERİNİ DÜZENLE</p>
                 </div>
                 <button onClick={() => setSelectedUser(null)} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-[4px] transition-all">
                    <X className="w-4 h-4" />
                 </button>
              </div>

              <div className="p-6 max-h-[400px] overflow-y-auto space-y-2">
                 {companies.map((company) => {
                    const hasAccess = userAccessIds.includes(company.id);
                    return (
                      <div key={company.id} className={`p-3 rounded-[4px] border flex items-center justify-between transition-all ${hasAccess ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/50 shadow-inner" : "bg-white dark:bg-zinc-800 border-slate-100 dark:border-zinc-700"}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-[4px] flex items-center justify-center ${hasAccess ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-slate-100 dark:bg-zinc-700 text-slate-400 dark:text-zinc-500"}`}>
                            <Building size={14} />
                          </div>
                          <div>
                            <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{company.name}</div>
                            <div className="text-[8px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">{company._count?.reports || 0} Dosya</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggleAccess(selectedUser.id, company.id)}
                          className={`px-3 py-1.5 rounded-[4px] text-[8px] font-black uppercase tracking-widest transition-all ${hasAccess ? "bg-zinc-900 dark:bg-zinc-700 text-white" : "bg-blue-600 text-white"}`}
                        >
                          {hasAccess ? "YETKİ KALDIR" : "YETKİ VER"}
                        </button>
                      </div>
                    )
                 })}
              </div>

              <div className="p-6 bg-slate-50 dark:bg-zinc-800/50 border-t border-slate-100 dark:border-zinc-800">
                 <button onClick={() => setSelectedUser(null)} className="w-full p-3 bg-zinc-900 dark:bg-zinc-700 text-white dark:text-zinc-300 rounded-[4px] font-black uppercase text-[10px] tracking-widest hover:bg-black dark:hover:bg-zinc-600 transition-all shadow-xl">
                    KAPAT VE KAYDET
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* FOOTER INFO */}
      <div className="p-6 bg-blue-50/50 dark:bg-zinc-900/50 rounded-[4px] border border-blue-100 dark:border-zinc-800 flex items-start gap-4 italic">
         <div className="p-2.5 bg-blue-600 dark:bg-blue-500 text-white rounded-[4px] shadow-lg">
            <CheckCircle2 size={20} />
         </div>
         <div className="space-y-1">
            <h4 className="font-black text-slate-900 dark:text-white tracking-tight uppercase italic text-xs leading-none">Güvenlik Notu</h4>
            <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase leading-relaxed tracking-widest italic">
              Rol değişiklikleri anında geçerli olur. Bir kullanıcıyı ADMIN yaptığınızda, tüm sistem ayarlarını değiştirme yetkisi kazanır. <br />
              Lütfen kritik değişiklikler yapmadan önce personelin yetki düzeyini doğrulayın.
            </p>
         </div>
      </div>

    </div>
  );
}
