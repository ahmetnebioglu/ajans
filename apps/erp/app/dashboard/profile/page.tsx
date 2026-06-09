"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  User as UserIcon, 
  Shield, 
  Mail, 
  Calendar, 
  CheckCircle2,
  Settings,
  Bell,
  Lock,
  History,
  LogOut,
  X,
  Loader2,
  Save,
  Camera,
  Upload
} from "lucide-react";
import { getUserSessions, killSession, killOtherSessions, updateProfile } from "../../actions/system-actions";

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const [sessions, setSessions] = useState<any[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Edit States
  const [editName, setEditName] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const user = session?.user;
  const role = (user as any)?.role || "USER";

  const loadSessions = async () => {
     const res = await getUserSessions();
     if (res.success) setSessions(res.data || []);
  };

  useEffect(() => {
     if (user) {
        loadSessions();
        setEditName(user.name || "");
        setPreviewUrl(user.image || "");
     }
  }, [user]);

  const handleKillSession = async (id: string) => {
     const res = await killSession(id);
     if (res.success) loadSessions();
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append("name", editName);
    if (editFile) {
      formData.append("image", editFile);
    }

    const res = await updateProfile(formData);
    
    if (res.success) {
      const updatedUser = (res as any).data.user;
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          name: updatedUser.name,
          image: updatedUser.image,
        }
      });
      setShowEditModal(false);
      setEditFile(null);
    } else {
      alert(res.error || "Profil güncellenirken bir hata oluştu.");
    }
    setIsSubmitting(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500 font-medium italic">
      
      {/* PROFILE HEADER / HERO */}
      <div className="bg-white dark:bg-zinc-900 rounded-[4px] border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden relative">
         <div className="h-24 bg-gradient-to-r from-slate-100 to-indigo-100 dark:from-zinc-900 dark:to-indigo-950 relative overflow-hidden">
            <Shield className="absolute -right-5 -top-5 w-32 h-32 text-indigo-600/5 dark:text-white/5 rotate-12" />
         </div>
         
         <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row items-end gap-4 -mt-10 relative z-10">
                <div className="relative group">
                   {user?.image ? (
                     <img 
                       src={user.image} 
                       alt="" 
                       className="w-24 h-24 rounded-[4px] border-2 border-white dark:border-zinc-800 shadow-2xl group-hover:scale-105 transition-transform object-cover" 
                       onError={(e) => {
                         (e.target as HTMLImageElement).style.display = 'none';
                         const fallback = (e.target as HTMLImageElement).parentElement?.querySelector('.image-fallback');
                         if (fallback) (fallback as HTMLElement).style.display = 'flex';
                       }}
                     />
                   ) : null}
                   <div className={`image-fallback w-24 h-24 bg-slate-100 dark:bg-zinc-800 rounded-[4px] border-2 border-white dark:border-zinc-800 shadow-2xl flex items-center justify-center text-slate-300 ${user?.image ? 'hidden' : 'flex'}`}>
                      <UserIcon size={48} />
                   </div>
                   <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 border-2 border-white dark:border-zinc-800 rounded-[4px] flex items-center justify-center text-white shadow-lg">
                      <CheckCircle2 size={16} />
                   </div>
                </div>
                
                <div className="flex-1 space-y-1 text-center md:text-left">
                   <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none not-italic">
                      {user?.name || "Kullanıcı Adı"}
                   </h1>
                   <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-[4px] text-[8px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-900/50 shadow-sm">
                         <Shield size={10} /> {role}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-[8px] font-bold uppercase tracking-widest">
                         <Mail size={10} /> {user?.email}
                      </div>
                   </div>
                </div>

                <button 
                  onClick={() => setShowEditModal(true)}
                  className="bg-slate-900 dark:bg-blue-600 text-white px-6 py-2.5 rounded-[4px] text-[9px] font-black uppercase tracking-widest hover:bg-black dark:hover:bg-blue-700 transition-all shadow-xl shadow-slate-900/20 dark:shadow-blue-600/20 active:scale-95 flex items-center gap-2"
                >
                   <Settings size={14} /> PROFİLİ DÜZENLE
                </button>
            </div>
         </div>
      </div>

      {/* STATS / INFO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bg-white dark:bg-zinc-900 p-6 rounded-[4px] border border-slate-200 dark:border-zinc-800 shadow-lg group hover:border-blue-200 dark:hover:border-blue-800 transition-all">
             <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-[4px] flex items-center justify-center shadow-inner">
                   <Calendar size={20} />
                </div>
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Kayıt Tarihi</div>
             </div>
             <p className="text-lg font-black text-slate-900 dark:text-white uppercase leading-none tracking-tight italic">NİSAN 2026</p>
         </div>

         <div className="bg-white dark:bg-zinc-900 p-6 rounded-[4px] border border-slate-200 dark:border-zinc-800 shadow-lg group hover:border-emerald-200 dark:hover:border-emerald-800 transition-all">
             <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-[4px] flex items-center justify-center shadow-inner">
                   <History size={20} />
                </div>
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Son Giriş</div>
             </div>
             <p className="text-lg font-black text-slate-900 dark:text-white uppercase leading-none tracking-tight italic">BUGÜN, 17:35</p>
         </div>

         <div className="bg-white dark:bg-zinc-900 p-6 rounded-[4px] border border-slate-200 dark:border-zinc-800 shadow-lg group hover:border-amber-200 dark:hover:border-amber-800 transition-all">
             <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-[4px] flex items-center justify-center shadow-inner">
                   <Bell size={20} />
                </div>
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Bildirimler</div>
             </div>
             <p className="text-lg font-black text-slate-900 dark:text-white uppercase leading-none tracking-tight italic">3 YENİ MESAJ</p>
         </div>
      </div>

      {/* SESSION MANAGEMENT */}
      <div className="bg-white dark:bg-zinc-900 rounded-[4px] border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden relative group">
         <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/30">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 text-slate-900 dark:text-slate-300">
               <History className="text-blue-600" size={14} /> Aktif Oturumlar
            </h3>
            <button 
               onClick={async () => {
                  const res = await killOtherSessions(""); 
                  if (res.success) loadSessions();
               }}
               className="text-[8px] font-black text-rose-600 hover:text-rose-500 uppercase tracking-widest transition-colors"
            >
               Tüm Diğer Oturumları Kapat
            </button>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px]">
               <thead>
                  <tr className="bg-slate-50 dark:bg-zinc-950/50 border-b border-slate-100 dark:border-zinc-800">
                     <th className="p-4 font-black uppercase text-slate-400 tracking-widest">Oturum ID</th>
                     <th className="p-4 font-black uppercase text-slate-400 tracking-widest">Geçerlilik</th>
                     <th className="p-4 font-black uppercase text-slate-400 tracking-widest text-right">İşlem</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {sessions.length > 0 ? sessions.map((s: any) => (
                     <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-all italic">
                        <td className="p-4 font-mono text-[9px] text-slate-500">{s.id}</td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">
                           {new Date(s.expires).toLocaleString("tr-TR")}
                        </td>
                        <td className="p-4 text-right">
                           <button 
                              onClick={() => handleKillSession(s.id)}
                              className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 hover:bg-rose-600 hover:text-white rounded-[4px] transition-all"
                           >
                              <LogOut size={12} />
                           </button>
                        </td>
                     </tr>
                  )) : (
                     <tr>
                        <td colSpan={3} className="p-8 text-center text-slate-400 uppercase font-black tracking-widest text-[10px]">
                           Aktif oturum kaydı bulunamadı
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[4px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-zinc-800">
              <div className="p-8 space-y-6">
                 <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-black italic tracking-tighter uppercase text-slate-900 dark:text-white leading-none">PROFİLİ DÜZENLE</h3>
                    <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                       <X size={24} />
                    </button>
                 </div>

                 <form onSubmit={handleUpdateProfile} className="space-y-6">
                    {/* Image Preview / Upload Section */}
                    <div className="flex flex-col items-center gap-4">
                       <div className="relative group">
                          {previewUrl ? (
                            <img src={previewUrl} className="w-28 h-28 rounded-[4px] object-cover border-2 border-slate-100 dark:border-zinc-800 shadow-xl" alt="Preview" />
                          ) : (
                            <div className="w-28 h-28 bg-slate-100 dark:bg-zinc-950 rounded-[4px] flex items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 dark:border-zinc-800">
                               <UserIcon size={40} />
                            </div>
                          )}
                          <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-[4px]">
                             <Camera className="text-white" size={24} />
                             <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                          </label>
                       </div>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fotoğrafı değiştirmek için üzerine tıklayın</p>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Ad Soyad</label>
                       <div className="relative">
                          <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            type="text" 
                            required
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-[4px] text-xs font-bold outline-none focus:border-blue-500 transition-all italic"
                          />
                       </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                       <button 
                         type="button"
                         onClick={() => setShowEditModal(false)}
                         className="flex-1 px-6 py-3 bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-slate-400 rounded-[4px] text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-zinc-750 transition-all"
                       >
                          İPTAL
                       </button>
                       <button 
                         type="submit"
                         disabled={isSubmitting}
                         className="flex-1 px-6 py-3 bg-zinc-950 dark:bg-blue-600 text-white rounded-[4px] text-[10px] font-black uppercase tracking-widest hover:bg-black dark:hover:bg-blue-700 transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                       >
                          {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                          KAYDET
                       </button>
                    </div>
                 </form>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
