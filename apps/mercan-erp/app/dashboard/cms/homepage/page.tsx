"use client";

import React, { useState, useEffect } from "react";
import {
  Save,
  Loader2,
  Home,
  ArrowRight,
  Layout,
  Info,
  AlertCircle,
  Globe,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import {
  getHomepageSettings,
  updateHomepageSettings,
} from "../../../actions/homepage-actions";
import MediaPicker from "../../../components/cms/MediaPicker";
import RichTextEditor from "../../../components/cms/RichTextEditor";

export default function HomepageSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("hero");
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({
    heroTitle: "",
    heroSubtitle: "",
    heroButtonText: "",
    heroImages: [] as string[],
    katipProcess: [
      { title: "", desc: "" },
      { title: "", desc: "" },
      { title: "", desc: "" },
    ],
    naceBannerTitle: "",
    naceBannerSubtitle: "",
    mapUrl: "",
    aboutTitle: "",
    aboutContent: "",
    aboutImage: "",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const settings = await getHomepageSettings();
    if (settings) {
      setFormData({
        heroTitle: settings.heroTitle || "",
        heroSubtitle: settings.heroSubtitle || "",
        heroButtonText: settings.heroButtonText || "",
        heroImages: (settings.heroImages as string[]) || [],
        katipProcess: settings.katipProcess || [
          { title: "", desc: "" },
          { title: "", desc: "" },
          { title: "", desc: "" },
        ],
        naceBannerTitle: settings.naceBannerTitle || "",
        naceBannerSubtitle: settings.naceBannerSubtitle || "",
        mapUrl: settings.mapUrl || "",
        aboutTitle: settings.aboutTitle || "",
        aboutContent: settings.aboutContent || "",
        aboutImage: settings.aboutImage || "",
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await updateHomepageSettings(formData);
    if (result.success) {
      alert("Ana sayfa ayarları güncellendi.");
    } else {
      alert("Hata: " + result.error);
    }
    setSaving(false);
  };

  const updateKatipStep = (index: number, field: string, value: string) => {
    const newProcess = [...formData.katipProcess];
    newProcess[index] = { ...newProcess[index], [field]: value };
    setFormData({ ...formData, katipProcess: newProcess });
  };

  const addHeroImage = () => {
    setFormData({ ...formData, heroImages: [...formData.heroImages, ""] });
  };

  const updateHeroImage = (index: number, value: string) => {
    setFormData(prev => {
      const newImages = [...prev.heroImages];
      newImages[index] = value;
      return { ...prev, heroImages: newImages };
    });
  };

  const removeHeroImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      heroImages: prev.heroImages.filter((_, i) => i !== index)
    }));
  };

  const openMediaPicker = (index: number) => {
    setActiveImageIndex(index);
    setIsMediaPickerOpen(true);
  };

  const openAboutMediaPicker = () => {
    setActiveImageIndex(-1); // Special index for About image
    setIsMediaPickerOpen(true);
  };

  const handleMediaSelect = (fileId: string, fileUrl?: string) => {
    const imageUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    
    if (activeImageIndex === -1) {
      setFormData(prev => ({ ...prev, aboutImage: imageUrl }));
    } else if (activeImageIndex !== null) {
      updateHeroImage(activeImageIndex, imageUrl);
    }
    setIsMediaPickerOpen(false);
    setActiveImageIndex(null);
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <span className="text-xs font-black uppercase tracking-widest text-slate-400">
          Ayarlar Yükleniyor...
        </span>
      </div>
    );
  }

  const tabs = [
    { id: "hero", name: "Hero Alanı", icon: Layout },
    { id: "about", name: "Hakkımızda", icon: Info },
    { id: "katip", name: "Katip Süreci", icon: Info },
    { id: "nace", name: "Nace Vurgusu", icon: AlertCircle },
    { id: "map", name: "Harita & İletişim", icon: Globe },
  ];

  return (
    <div className="px-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-300 dark:border-slate-800">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-600/30">
            <Home size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white leading-none">
              Ana Sayfa <span className="text-blue-600">Yönetimi</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-2">
              Web sitesi ana sayfa içeriklerini buradan yönetin
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="animate-spin mr-3" size={18} />
          ) : (
            <Save className="mr-3" size={18} />
          )}
          AYARLARI KAYDET
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Tabs */}
        <div className="lg:col-span-1 space-y-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-6 py-5 rounded-3xl font-black uppercase tracking-widest text-[10px] transition-all border ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-600/20 translate-x-2"
                    : "bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <Icon size={18} />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl p-10 min-h-[500px]">
            {activeTab === "hero" && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <ArrowRight size={14} className="text-blue-600" />
                    Ana Başlık (Hero Title)
                  </label>
                  <input
                    type="text"
                    value={formData.heroTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, heroTitle: e.target.value })
                    }
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-600/5 outline-none transition-all"
                    placeholder="Örn: İşletmenizin Güvenliği İçin Uzman Dokunuş."
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <ArrowRight size={14} className="text-blue-600" />
                    Alt Başlık (Hero Subtitle)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.heroSubtitle}
                    onChange={(e) =>
                      setFormData({ ...formData, heroSubtitle: e.target.value })
                    }
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-600/5 outline-none transition-all resize-none"
                    placeholder="Kısa bir açıklama girin..."
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <ArrowRight size={14} className="text-blue-600" />
                    Buton Metni
                  </label>
                  <input
                    type="text"
                    value={formData.heroButtonText}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        heroButtonText: e.target.value,
                      })
                    }
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-600/5 outline-none transition-all"
                    placeholder="Örn: Hizmetlerimizi Keşfedin"
                  />
                </div>

                <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <ImageIcon size={14} className="text-blue-600" />
                      Slider Görselleri (Slider Images)
                    </label>
                    <button
                      onClick={addHeroImage}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all"
                    >
                      YENİ GÖRSEL EKLE
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {formData.heroImages.map((img, i) => (
                      <div key={i} className="flex gap-4 items-center">
                        <div className="w-24 h-16 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                          {img ? (
                            <img 
                              src={img.includes('id=') ? `https://drive.google.com/thumbnail?id=${img.split('id=')[1]}&sz=w200` : img} 
                              className="w-full h-full object-cover" 
                              alt="" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <ImageIcon size={20} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                           <input
                            type="text"
                            value={img}
                            onChange={(e) => updateHeroImage(i, e.target.value)}
                            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white outline-none"
                            placeholder="Görsel URL veya kütüphaneden seçin..."
                          />
                        </div>
                        <button
                          onClick={() => openMediaPicker(i)}
                          className="p-4 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all"
                          title="Kütüphaneden Seç"
                        >
                          <ImageIcon size={20} />
                        </button>
                        <button
                          onClick={() => removeHeroImage(i)}
                          className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all"
                          title="Sil"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                    {formData.heroImages.length === 0 && (
                      <div className="p-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] text-center text-slate-400 italic text-xs">
                        Henüz slider görseli eklenmemiş.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "katip" && (
              <div className="space-y-10 animate-in fade-in duration-500">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="p-8 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 space-y-6"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black italic">
                        {i + 1}
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">
                        Adım {i + 1} Ayarları
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Adım Başlığı
                        </label>
                        <input
                          type="text"
                          value={formData.katipProcess[i]?.title}
                          onChange={(e) =>
                            updateKatipStep(i, "title", e.target.value)
                          }
                          className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white outline-none"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Adım Açıklaması
                        </label>
                        <input
                          type="text"
                          value={formData.katipProcess[i]?.desc}
                          onChange={(e) =>
                            updateKatipStep(i, "desc", e.target.value)
                          }
                          className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "about" && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <ArrowRight size={14} className="text-blue-600" />
                    Bölüm Başlığı (About Title)
                  </label>
                  <input
                    type="text"
                    value={formData.aboutTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, aboutTitle: e.target.value })
                    }
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-600/5 outline-none transition-all"
                    placeholder="Örn: Mercan OSGB Kimdir?"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <ArrowRight size={14} className="text-blue-600" />
                    Bölüm İçeriği
                  </label>
                  <RichTextEditor
                    content={formData.aboutContent}
                    onChange={(html) =>
                      setFormData({ ...formData, aboutContent: html })
                    }
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <ImageIcon size={14} className="text-blue-600" />
                    Bölüm Görseli
                  </label>
                  <div className="flex gap-6 items-start">
                    <div className="w-64 aspect-video bg-slate-100 dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                      {formData.aboutImage ? (
                        <img 
                          src={formData.aboutImage.includes('id=') ? `https://drive.google.com/thumbnail?id=${formData.aboutImage.split('id=')[1]}&sz=w400` : formData.aboutImage} 
                          className="w-full h-full object-cover" 
                          alt="" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <ImageIcon size={48} strokeWidth={1} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-4">
                      <input
                        type="text"
                        value={formData.aboutImage}
                        onChange={(e) => setFormData({ ...formData, aboutImage: e.target.value })}
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white outline-none"
                        placeholder="Görsel URL veya kütüphaneden seçin..."
                      />
                      <button
                        onClick={openAboutMediaPicker}
                        className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all"
                      >
                        <ImageIcon size={16} /> KÜTÜPHANEDEN SEÇ
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "nace" && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <ArrowRight size={14} className="text-blue-600" />
                    NACE Banner Başlığı
                  </label>
                  <input
                    type="text"
                    value={formData.naceBannerTitle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        naceBannerTitle: e.target.value,
                      })
                    }
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <ArrowRight size={14} className="text-blue-600" />
                    NACE Banner Alt Başlığı
                  </label>
                  <textarea
                    rows={4}
                    value={formData.naceBannerSubtitle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        naceBannerSubtitle: e.target.value,
                      })
                    }
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white outline-none resize-none"
                  />
                </div>
              </div>
            )}
            {activeTab === "map" && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Google Harita Paylaşım Linki (iframe src)</label>
                  <textarea
                    rows={6}
                    value={formData.mapUrl}
                    onChange={(e) => setFormData({ ...formData, mapUrl: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white outline-none resize-none"
                    placeholder="Google Maps > Paylaş > Harita Yerleştir kısmındaki 'src' değerini buraya yapıştırın."
                  />
                  <p className="text-[10px] text-slate-400 italic">Google Maps'ten aldığınız iframe kodunun sadece içindeki <b>src="..."</b> kısmını buraya yapıştırmanız yeterlidir.</p>
                </div>
              </div>
            )}
            <MediaPicker
              isOpen={isMediaPickerOpen}
              onClose={() => setIsMediaPickerOpen(false)}
              onSelect={handleMediaSelect}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
