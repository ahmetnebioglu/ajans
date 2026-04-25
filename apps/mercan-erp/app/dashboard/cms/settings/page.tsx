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
       <Loader2 className="animate-spin text-emerald-600" size={48} />
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-700 italic font-medium">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
           <Link href="/dashboard/cms" className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 transition-colors text-[9px] font-black uppercase tracking-widest mb-1 group">
              <ChevronLeft size={12} className="group-hover:-translate-x-1 transition-transform" /> CMS Hub
           </Link>
           <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
              Site <span className="text-emerald-600">Ayarları</span>
           </h1>
           <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              Kurumsal kimlik, sosyal medya ve genel yapılandırma
           </p>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-emerald-600 text-white rounded-[4px] text-[9px] font-black uppercase tracking-[0.2em] shadow-[0_10px_25px_rgba(16,185,129,0.4)] flex items-center gap-2 hover:scale-105 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 border border-emerald-500/50"
        >
           {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
           KAYDET
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
         {/* Left Column: General & Branding */}
         <div className="lg:col-span-2 space-y-4">
            {/* Branding Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[4px] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-emerald-600" />
               <div className="flex items-center gap-3 text-emerald-600">
                  <ImageIcon size={20} />
                  <h3 className="text-lg font-black uppercase tracking-tighter text-slate-900 dark:text-white"><span className="text-emerald-600">Marka</span> & Logo</h3>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Kurumsal Logo (Drive ID)</label>
                     <input 
                       type="text" 
                       value={settings.logo || ""}
                       onChange={(e) => setSettings({...settings, logo: e.target.value})}
                       className="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-[4px] text-xs font-bold focus:ring-1 focus:ring-emerald-600 transition-all outline-none text-slate-900 dark:text-white"
                       placeholder="1x8y2z..."
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Favicon (Drive ID)</label>
                     <input 
                       type="text" 
                       className="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-[4px] text-xs font-bold focus:ring-1 focus:ring-emerald-600 transition-all outline-none text-slate-900 dark:text-white"
                       placeholder="1a2b3c..."
                     />
                  </div>
               </div>
            </div>

            {/* Contact & Address */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[4px] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-emerald-600" />
               <div className="flex items-center gap-3 text-emerald-600">
                  <MapPin size={20} />
                  <h3 className="text-lg font-black uppercase tracking-tighter text-slate-900 dark:text-white italic"><span className="text-emerald-600">İletişim</span> Bilgileri</h3>
               </div>
               
               <div className="space-y-4">
                  <div className="space-y-2">
                     <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Açık Adres</label>
                     <textarea 
                       value={settings.address || ""}
                       onChange={(e) => setSettings({...settings, address: e.target.value})}
                       rows={3}
                       className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-[4px] text-xs font-bold focus:ring-1 focus:ring-emerald-600 transition-all outline-none resize-none text-slate-900 dark:text-white"
                       placeholder="Merkez mah. No:1..."
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Footer Metni (Copyright)</label>
                     <input 
                       type="text" 
                       value={settings.footerText || ""}
                       onChange={(e) => setSettings({...settings, footerText: e.target.value})}
                       className="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-[4px] text-xs font-bold focus:ring-1 focus:ring-emerald-600 transition-all outline-none text-slate-900 dark:text-white"
                       placeholder="© 2026 Mercan ERP"
                     />
                  </div>
               </div>
            </div>
         </div>

         {/* Right Column: Social Media */}
         <div className="space-y-4">
            <div className="bg-white dark:bg-slate-950 p-6 rounded-[4px] shadow-sm space-y-6 relative overflow-hidden border border-slate-200 dark:border-zinc-800/50">
               <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-600 opacity-10 rounded-full blur-3xl -mr-16 -mt-16" />
               <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 relative z-10">
                  <Share2 size={20} />
                  <h3 className="text-lg font-black uppercase tracking-tighter text-slate-900 dark:text-white">Sosyal <span className="text-emerald-600">Medya</span></h3>
               </div>

               <div className="space-y-4 relative z-10">
                  {[
                    { id: 'twitter', icon: LinkIcon, label: 'Twitter / X', color: 'text-sky-400' },
                    { id: 'linkedin', icon: LinkIcon, label: 'LinkedIn', color: 'text-blue-500' },
                    { id: 'instagram', icon: LinkIcon, label: 'Instagram', color: 'text-rose-400' },
                  ].map((social) => (
                    <div key={social.id} className="space-y-1.5">
                       <label className="text-[7px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
                          <social.icon size={10} className={social.color} /> {social.label}
                       </label>
                       <input 
                         type="text" 
                         className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[4px] text-[10px] font-bold focus:border-emerald-500 transition-all outline-none text-slate-900 dark:text-white"
                         placeholder="https://..."
                       />
                    </div>
                  ))}
               </div>
            </div>

            {/* SEO Info Placeholder */}
            <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[4px] text-center space-y-3 bg-white/50 dark:bg-transparent">
               <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-[4px] flex items-center justify-center mx-auto border border-slate-100 dark:border-slate-700">
                  <Globe className="text-slate-400" size={20} />
               </div>
               <div className="space-y-1">
                  <h4 className="text-sm font-black uppercase tracking-tighter text-slate-900 dark:text-white italic leading-none">SEO Yapılandırması</h4>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 opacity-60">Meta etiketleri ve robots.txt ayarları yakında eklenecek.</p>
               </div>
             </div>
          </div>
       </div>
    </div>
  );
}
