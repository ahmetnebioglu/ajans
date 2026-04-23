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
import { getAllUsers, updateUserRole, getCompanies, toggleExpertAccess } from "../../../actions/admin-actions";

export default function UserManagementPage() {
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
    if (userRes.success) setUsers(userRes.users || []);
    if (compRes.success) setCompanies(compRes.companies || []);
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
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 italic font-medium">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-2xl rotate-3">
                <Shield size={28} />
             </div>
             <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
               KULLANICI <span className="text-blue-600 dark:text-blue-400">YÖNETİMİ</span>
             </h1>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.2em] pl-1">Sistem yetkileri ve rol hiyerarşisi merkezi kontrolü.</p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center gap-4">
           <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Toplam Kullanıcı</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{users.length}</p>
           </div>
           <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
              <Users size={20} />
           </div>
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative group">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900" />
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                <th className="p-8 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Kullanıcı Bilgileri</th>
                <th className="p-8 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Mevcut Rol</th>
                <th className="p-8 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Atanmış Firmalar</th>
                <th className="p-8 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest text-right">Aksiyonlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all duration-300 group/row">
                  <td className="p-8">
                    <div className="flex items-center gap-4">
                      {user.image ? (
                        <img src={user.image} alt="" className="w-12 h-12 rounded-2xl shadow-lg border-2 border-white dark:border-slate-800 group-hover/row:scale-110 transition-transform" />
                      ) : (
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-md">
                          <UserCircle size={24} />
                        </div>
                      )}
                      <div>
                        <div className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm mb-1">{user.name || "İsimsiz Kullanıcı"}</div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          <Mail size={12} className="text-blue-500 dark:text-blue-400" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="p-8">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.15em] ${user.role === "ADMIN" ? "bg-slate-900 text-amber-500 shadow-lg" : user.role === "EXPERT" ? "bg-blue-600 text-white shadow-lg" : "bg-white border-2 border-slate-100 text-slate-500"}`}>
                      {user.role === "ADMIN" && <Shield size={10} />}
                      {user.role}
                    </span>
                  </td>

                  <td className="p-8">
                    <div className="flex flex-wrap gap-2 max-w-[250px]">
                      {user.companyAccess?.length > 0 ? (
                        user.companyAccess.map((access: any) => (
                          <span key={access.company.id} className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[8px] font-black uppercase tracking-tighter rounded-md border border-slate-100 dark:border-slate-700">
                            {access.company.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">Atanmış Firma Yok</span>
                      )}
                    </div>
                  </td>

                  <td className="p-8 text-right">
                    <div className="flex justify-end items-center gap-3">
                       {updatingId === user.id ? (
                         <Loader2 className="animate-spin text-blue-600" size={20} />
                       ) : (
                         <select 
                           value={user.role}
                           onChange={(e) => handleRoleChange(user.id, e.target.value)}
                           className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer dark:text-white"
                         >
                           <option value="ADMIN">ADMIN YAP</option>
                           <option value="EXPERT">EXPERT YAP</option>
                           <option value="CLIENT">CLIENT YAP</option>
                         </select>
                       )}
                       <button 
                         onClick={() => openAssignmentModal(user)}
                         className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm"
                       >
                         <Building size={16} />
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
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[0.75rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border dark:border-slate-800">
              <div className="bg-slate-900 p-8 text-white flex justify-between items-center bg-gradient-to-br from-slate-900 to-indigo-900">
                 <div className="space-y-1">
                    <h3 className="text-xl font-black tracking-tight uppercase italic">{selectedUser.name}</h3>
                    <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest leading-none">FİRMA YETKİLERİNİ DÜZENLE</p>
                 </div>
                 <button onClick={() => setSelectedUser(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all">
                    <X className="w-5 h-5" />
                 </button>
              </div>

              <div className="p-8 max-h-[400px] overflow-y-auto space-y-3">
                 {companies.map((company) => {
                    const hasAccess = userAccessIds.includes(company.id);
                    return (
                      <div key={company.id} className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all ${hasAccess ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/50" : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700"}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${hasAccess ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500"}`}>
                            <Building size={14} />
                          </div>
                          <div>
                            <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{company.name}</div>
                            <div className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{company._count?.reports || 0} Dosya</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggleAccess(selectedUser.id, company.id)}
                          className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${hasAccess ? "bg-slate-900 dark:bg-slate-700 text-white" : "bg-blue-600 text-white"}`}
                        >
                          {hasAccess ? "YETKİ KALDIR" : "YETKİ VER"}
                        </button>
                      </div>
                    )
                 })}
              </div>

              <div className="p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                 <button onClick={() => setSelectedUser(null)} className="w-full p-4 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-300 dark:hover:bg-slate-600 transition-all">
                    KAPAT VE KAYDET
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* FOOTER INFO */}
      <div className="p-8 bg-blue-50/50 dark:bg-slate-900/50 rounded-[2rem] border border-blue-100 dark:border-slate-800 flex items-start gap-4">
         <div className="p-3 bg-blue-600 dark:bg-blue-500 text-white rounded-xl shadow-lg">
            <CheckCircle2 size={24} />
         </div>
         <div className="space-y-1">
            <h4 className="font-black text-slate-900 dark:text-white tracking-tight uppercase italic text-sm">Güvenlik Notu</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase leading-relaxed tracking-widest italic">
              Rol değişiklikleri anında geçerli olur. Bir kullanıcıyı ADMIN yaptığınızda, tüm sistem ayarlarını değiştirme yetkisi kazanır. <br />
              Lütfen kritik değişiklikler yapmadan önce personelin yetki düzeyini doğrulayın.
            </p>
         </div>
      </div>

    </div>
  );
}
