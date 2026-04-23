"use client";

import React, { useState, useEffect, use } from "react";
import { 
  ChevronLeft, 
  Plus, 
  Layout, 
  Settings2, 
  Trash2, 
  Save, 
  MoveUp, 
  MoveDown,
  Image as ImageIcon,
  Type,
  Grid,
  FileText,
  Loader2,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { getPageSections, addSection, deleteSection, savePageSections } from "../../../../actions/cms-actions";
import MediaPicker from "../../../../components/cms/MediaPicker";
import RichEditor from "../../../../components/cms/RichEditor";
import { parseSectionContent } from "@ajans/db/src/section-types";

export default function PageBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: pageId } = use(params);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [activeMediaTarget, setActiveMediaTarget] = useState<{ sectionId: string; field: string } | null>(null);

  const loadSections = async () => {
    setLoading(true);
    const data = await getPageSections(pageId);
    // Veriyi şemaya göre normalize et (Hydration)
    const hydratedData = data.map((s: any) => ({
      ...s,
      content: parseSectionContent(s.type, s.content)
    }));
    setSections(hydratedData);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await savePageSections(sections);
    if (res.success) {
      alert("Değişiklikler başarıyla kaydedildi!");
    } else {
      alert("Bir hata oluştu: " + res.error);
    }
    setSaving(false);
  };

  useEffect(() => {
    loadSections();
  }, [pageId]);

  const handleAddSection = async (type: string) => {
    // Merkezi tiplere göre default content oluştur
    const defaultContent = parseSectionContent(type, {});
    const res = await addSection(pageId, type, defaultContent);
    if (res.success) {
      loadSections();
    }
  };

  const handleDelete = async (sid: string) => {
    if (confirm("Bu bölümü silmek istediğinize emin misiniz?")) {
      const res = await deleteSection(sid, pageId);
      if (res.success) {
        loadSections();
      }
    }
  };

  const openMediaPicker = (sectionId: string, field: string) => {
    setActiveMediaTarget({ sectionId, field });
    setIsMediaPickerOpen(true);
  };

  const handleMediaSelect = (fileId: string) => {
    if (!activeMediaTarget) return;
    
    setSections(prev => prev.map(s => {
      if (s.id === activeMediaTarget.sectionId) {
        return {
          ...s,
          content: { ...s.content, [activeMediaTarget.field]: fileId }
        };
      }
      return s;
    }));
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newSections.length) return;
    
    const [moved] = newSections.splice(index, 1);
    newSections.splice(targetIndex, 0, moved);
    
    // Düzeni güncelle
    const reordered = newSections.map((s, i) => ({ ...s, order: i }));
    setSections(reordered);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700 italic font-medium">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
           <Link href="/dashboard/cms/pages" className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 transition-colors text-[10px] font-black uppercase tracking-widest mb-2 group">
              <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Sayfa Listesi
           </Link>
           <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
              Section <span className="text-emerald-600">Builder</span>
           </h1>
           <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">
              Sayfa içeriğini modüler bölümlerle inşa edin
           </p>
        </div>
        
        <div className="flex items-center gap-3">
           <button 
             onClick={handleSave}
             disabled={saving}
             className="px-8 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-emerald-600/20 flex items-center gap-3 hover:scale-105 transition-transform active:scale-95 disabled:opacity-50"
           >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Değişiklikleri Kaydet
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
         {/* LEFT: Section Canvas */}
         <div className="lg:col-span-3 space-y-6">
            {loading ? (
              <div className="py-24 text-center">
                 <Loader2 className="animate-spin mx-auto mb-4 text-emerald-600" size={32} />
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Builder Hazırlanıyor...</p>
              </div>
            ) : sections.length === 0 ? (
              <div className="py-32 text-center border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] bg-slate-50/30 dark:bg-slate-900/10">
                 <Sparkles className="mx-auto mb-6 text-emerald-200" size={64} />
                 <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">İçerik Macerasına Başla</h2>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Sağ taraftaki panelden bir bölüm ekleyerek başlayın</p>
              </div>
            ) : (
              sections.map((section, index) => (
                <div key={section.id} className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden relative">
                   {/* Section Toolbar */}
                   <div className="absolute top-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 transition-transform">
                      <button 
                         onClick={() => moveSection(index, 'up')}
                         disabled={index === 0}
                         className="p-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-emerald-600 rounded-xl transition-all disabled:opacity-30"
                       >
                          <MoveUp size={16} />
                       </button>
                       <button 
                         onClick={() => moveSection(index, 'down')}
                         disabled={index === sections.length - 1}
                         className="p-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-emerald-600 rounded-xl transition-all disabled:opacity-30"
                       >
                          <MoveDown size={16} />
                       </button>
                      <button 
                        onClick={() => handleDelete(section.id)}
                        className="p-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-rose-600 rounded-xl transition-all"
                      >
                         <Trash2 size={16} />
                      </button>
                   </div>

                   {/* Section Preview/Form */}
                   <div className="p-10 space-y-6">
                      <div className="flex items-center gap-4 mb-4">
                         <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 text-[8px] font-black uppercase tracking-widest rounded-full border border-emerald-100 dark:border-emerald-800">
                            #{index + 1} {section.type}
                         </div>
                      </div>

                      <div className="grid grid-cols-1 gap-8">
                         {section.type === 'CONTENT' && (
                           <div className="space-y-6">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bölüm Başlığı</label>
                                <input 
                                  type="text" 
                                  value={section.content.title || ""}
                                  onChange={(e) => {
                                    const newSections = [...sections];
                                    newSections[index].content.title = e.target.value;
                                    setSections(newSections);
                                  }}
                                  className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-emerald-600/5 transition-all"
                                />
                             </div>
                             <RichEditor 
                                label="İçerik Metni (Body)"
                                content={section.content.body || ""}
                                onChange={(val) => {
                                  const newSections = [...sections];
                                  newSections[index].content.body = val;
                                  setSections(newSections);
                                }}
                             />
                             <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resim (Drive ID)</label>
                                <div className="flex gap-2">
                                   <input 
                                     type="text" 
                                     value={section.content.image || ""}
                                     onChange={(e) => {
                                       const newSections = [...sections];
                                       newSections[index].content.image = e.target.value;
                                       setSections(newSections);
                                     }}
                                     className="flex-1 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none"
                                   />
                                   <button 
                                     onClick={() => openMediaPicker(section.id, 'image')}
                                     className="px-6 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest"
                                   >
                                      SEÇ
                                   </button>
                                </div>
                             </div>
                           </div>
                         )}

                         {(section.type === 'HERO' || section.type === 'SLIDER') && (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ana Başlık</label>
                                <input 
                                  type="text" 
                                  value={section.content.title || ""}
                                  onChange={(e) => {
                                    const newSections = [...sections];
                                    newSections[index].content.title = e.target.value;
                                    setSections(newSections);
                                  }}
                                  className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white outline-none"
                                />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Alt Başlık</label>
                                <input 
                                  type="text" 
                                  value={section.content.subtitle || ""}
                                  onChange={(e) => {
                                    const newSections = [...sections];
                                    newSections[index].content.subtitle = e.target.value;
                                    setSections(newSections);
                                  }}
                                  className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white outline-none"
                                />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">CTA Metni</label>
                                <input 
                                  type="text" 
                                  value={section.content.ctaText || ""}
                                  onChange={(e) => {
                                    const newSections = [...sections];
                                    newSections[index].content.ctaText = e.target.value;
                                    setSections(newSections);
                                  }}
                                  className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white outline-none"
                                />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resim (Drive ID)</label>
                                <div className="flex gap-2">
                                   <input 
                                     type="text" 
                                     value={section.content.image || ""}
                                     readOnly
                                     className="flex-1 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold"
                                   />
                                   <button 
                                     onClick={() => openMediaPicker(section.id, 'image')}
                                     className="px-6 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest"
                                   >
                                      SEÇ
                                   </button>
                                </div>
                             </div>
                           </div>
                         )}

                         {section.type === 'FEATURES' && (
                           <div className="space-y-6">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bölüm Başlığı</label>
                                <input 
                                  type="text" 
                                  value={section.content.title || ""}
                                  onChange={(e) => {
                                    const newSections = [...sections];
                                    newSections[index].content.title = e.target.value;
                                    setSections(newSections);
                                  }}
                                  className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white outline-none"
                                />
                             </div>
                             <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Özellik Kartları</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                   {(section.content.items || []).map((item: any, itemIdx: number) => (
                                     <div key={itemIdx} className="p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl space-y-3 relative group/item">
                                        <button 
                                          onClick={() => {
                                            const newSections = [...sections];
                                            newSections[index].content.items.splice(itemIdx, 1);
                                            setSections(newSections);
                                          }}
                                          className="absolute top-2 right-2 opacity-0 group-hover/item:opacity-100 text-rose-500 p-1"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                        <input 
                                          type="text"
                                          placeholder="Kart Başlığı"
                                          value={item.title || ""}
                                          onChange={(e) => {
                                            const newSections = [...sections];
                                            newSections[index].content.items[itemIdx].title = e.target.value;
                                            setSections(newSections);
                                          }}
                                          className="w-full bg-transparent border-b border-slate-200 dark:border-slate-600 text-xs font-black uppercase italic outline-none py-1"
                                        />
                                        <textarea 
                                          placeholder="Kart Açıklaması"
                                          value={item.description || ""}
                                          onChange={(e) => {
                                            const newSections = [...sections];
                                            newSections[index].content.items[itemIdx].description = e.target.value;
                                            setSections(newSections);
                                          }}
                                          className="w-full bg-transparent text-[11px] font-medium italic outline-none h-16 resize-none"
                                        />
                                     </div>
                                   ))}
                                   <button 
                                     onClick={() => {
                                       const newSections = [...sections];
                                       if (!newSections[index].content.items) newSections[index].content.items = [];
                                       newSections[index].content.items.push({ title: "Yeni Kart", description: "Açıklama...", icon: "" });
                                       setSections(newSections);
                                     }}
                                     className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-emerald-600 hover:bg-emerald-50 transition-all text-slate-400 hover:text-emerald-600"
                                   >
                                      <Plus size={20} />
                                      <span className="text-[10px] font-black uppercase tracking-widest">Yeni Kart Ekle</span>
                                   </button>
                                </div>
                             </div>
                           </div>
                         )}

                         {section.type === 'BLOG_FEED' && (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bölüm Başlığı</label>
                                <input 
                                  type="text" 
                                  value={section.content.title || ""}
                                  onChange={(e) => {
                                    const newSections = [...sections];
                                    newSections[index].content.title = e.target.value;
                                    setSections(newSections);
                                  }}
                                  className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white outline-none"
                                />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gösterim Limiti</label>
                                <input 
                                  type="number" 
                                  value={section.content.limit || 3}
                                  onChange={(e) => {
                                    const newSections = [...sections];
                                    newSections[index].content.limit = parseInt(e.target.value);
                                    setSections(newSections);
                                  }}
                                  className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white outline-none"
                                />
                             </div>
                           </div>
                         )}
                      </div>
                   </div>
                </div>
              ))
            )}
         </div>

         {/* RIGHT: Section Library */}
         <div className="space-y-8">
            <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-2xl sticky top-24">
               <h3 className="text-xl font-black italic uppercase tracking-tighter mb-6 flex items-center gap-3">
                  <Plus size={20} className="text-emerald-400" /> Bölüm Kitaplığı
               </h3>

               <div className="space-y-4">
                  {[
                    { type: 'SLIDER', icon: ImageIcon, label: 'Hero / Slider', desc: 'Giriş bölümü ve manşet' },
                    { type: 'FEATURES', icon: Grid, label: 'Feature Grid', desc: 'Özellikler ve ikonlu listeler' },
                    { type: 'CONTENT', icon: Type, label: 'Rich Text', desc: 'Serbest metin ve makale' },
                    { type: 'BLOG_FEED', icon: FileText, label: 'Document List', desc: 'Evraklar ve dosya listesi' }
                  ].map((item) => (
                    <button 
                      key={item.type}
                      onClick={() => handleAddSection(item.type)}
                      className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-left hover:bg-emerald-600 hover:border-emerald-500 transition-all group"
                    >
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                             <item.icon size={20} />
                          </div>
                          <div>
                             <div className="text-[11px] font-black uppercase tracking-tighter italic">{item.label}</div>
                             <div className="text-[8px] font-bold uppercase tracking-widest opacity-50">{item.desc}</div>
                          </div>
                       </div>
                    </button>
                  ))}
               </div>

               <div className="mt-10 p-6 bg-white/5 border border-white/10 rounded-2xl text-center">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-40 italic">Değişiklikler otomatik kaydedilmez. Kaydet butonuna basmayı unutmayın.</p>
               </div>
            </div>
         </div>
      </div>

      <MediaPicker 
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
      />
    </div>
  );
}
