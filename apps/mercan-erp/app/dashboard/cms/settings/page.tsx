"use client";

import React, { useState, useEffect } from "react";
import { 
  Settings, 
  Save, 
  Globe, 
  Image as ImageIcon, 
  MapPin, 
  Share2, 
  Link as LinkIcon,
  Loader2,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { getSiteSettings, updateSiteSettings } from "../../../actions/cms-actions";

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const s = await getSiteSettings();
      setSettings(s);
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await updateSiteSettings(settings);
    if (res.success) {
      alert("Ayarlar başarıyla güncellendi!");
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
       <Loader2 className="animate-spin text-blue-600" size={48} />
    </div>
  );

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700 italic font-medium">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
           <Link href="/dashboard/cms" className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors text-[10px] font-black uppercase tracking-widest mb-2 group">
              <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> CMS Hub
           </Link>
           <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
              Site <span className="text-blue-600">Ayarları</span>
           </h1>
           <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">
              Kurumsal kimlik, sosyal medya ve genel yapılandırma
           </p>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-10 py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center gap-3 hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
        >
           {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
           Değişiklikleri Kaydet
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Left Column: General & Branding */}
         <div className="lg:col-span-2 space-y-8">
            {/* Branding Card */}
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl space-y-8">
               <div className="flex items-center gap-4 text-blue-600">
                  <ImageIcon size={24} />
                  <h3 className="text-xl font-black uppercase tracking-tighter">Marka & Logo</h3>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kurumsal Logo (Drive ID)</label>
                     <input 
                       type="text" 
                       value={settings.logo || ""}
                       onChange={(e) => setSettings({...settings, logo: e.target.value})}
                       className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-600/5 transition-all outline-none"
                       placeholder="1x8y2z..."
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Favicon (Drive ID)</label>
                     <input 
                       type="text" 
                       className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-600/5 transition-all outline-none"
                       placeholder="1a2b3c..."
                     />
                  </div>
               </div>
            </div>

            {/* Contact & Address */}
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl space-y-8">
               <div className="flex items-center gap-4 text-emerald-600">
                  <MapPin size={24} />
                  <h3 className="text-xl font-black uppercase tracking-tighter">İletişim Bilgileri</h3>
               </div>
               
               <div className="space-y-6">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Açık Adres</label>
                     <textarea 
                       value={settings.address || ""}
                       onChange={(e) => setSettings({...settings, address: e.target.value})}
                       rows={3}
                       className="w-full p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-[2rem] text-sm font-bold focus:ring-4 focus:ring-blue-600/5 transition-all outline-none resize-none"
                       placeholder="Merkez mah. No:1..."
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Footer Metni (Copyright)</label>
                     <input 
                       type="text" 
                       value={settings.footerText || ""}
                       onChange={(e) => setSettings({...settings, footerText: e.target.value})}
                       className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-600/5 transition-all outline-none"
                       placeholder="© 2026 Mercan ERP"
                     />
                  </div>
               </div>
            </div>
         </div>

         {/* Right Column: Social Media */}
         <div className="space-y-8">
            <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl space-y-8 relative overflow-hidden">
               <div className="absolute right-0 top-0 w-32 h-32 bg-blue-600 opacity-20 rounded-full blur-3xl -mr-16 -mt-16" />
               <div className="flex items-center gap-4 text-blue-400 relative z-10">
                  <Share2 size={24} />
                  <h3 className="text-xl font-black uppercase tracking-tighter">Sosyal Medya</h3>
               </div>

               <div className="space-y-6 relative z-10">
                  {[
                    { id: 'twitter', icon: LinkIcon, label: 'Twitter / X', color: 'text-sky-400' },
                    { id: 'linkedin', icon: LinkIcon, label: 'LinkedIn', color: 'text-blue-500' },
                    { id: 'instagram', icon: LinkIcon, label: 'Instagram', color: 'text-rose-400' },
                  ].map((social) => (
                    <div key={social.id} className="space-y-2">
                       <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                          <social.icon size={12} className={social.color} /> {social.label}
                       </label>
                       <input 
                         type="text" 
                         className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold focus:border-blue-500 transition-all outline-none"
                         placeholder="https://..."
                       />
                    </div>
                  ))}
               </div>
            </div>

            {/* SEO Info Placeholder */}
            <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] text-center space-y-4">
               <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto">
                  <Globe className="text-slate-400" size={24} />
               </div>
               <div className="space-y-1">
                  <h4 className="font-black uppercase tracking-tighter text-slate-900 dark:text-white italic">SEO Yapılandırması</h4>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Meta etiketleri ve robots.txt ayarları yakında eklenecek.</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
