"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { getService, createService, updateService } from "../../../../actions/service-actions";
import RichTextEditor from "../../../../components/cms/RichTextEditor";
import MediaPicker from "../../../../components/cms/MediaPicker";

export default function ServiceFormPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = React.use(paramsPromise);
  const router = useRouter();
  const isNew = params.id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    featuredImage: "",
    summary: "",
    content: "",
    order: 0,
    isPublished: true,
    seoTitle: "",
    seoDescription: "",
  });

  useEffect(() => {
    if (!isNew) {
      fetchService();
    }
  }, [params.id]);

  const fetchService = async () => {
    try {
      const data = await getService(params.id);
      if (data) {
        setFormData({
          title: data.title || "",
          slug: data.slug || "",
          featuredImage: data.featuredImage || "",
          summary: data.summary || "",
          content: data.content || "",
          order: data.order || 0,
          isPublished: data.isPublished,
          seoTitle: data.seoTitle || "",
          seoDescription: data.seoDescription || "",
        });
      }
    } catch (error) {
      console.error(error);
      alert("Hizmet bilgileri alınamadı.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.slug) {
      alert("Lütfen başlık ve URL alanlarını doldurun.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        order: Number(formData.order),
      };

      const res = isNew
        ? await createService(payload)
        : await updateService(params.id, payload);

      if (res.success) {
        router.push("/dashboard/cms/services");
      } else {
        alert("Kaydetme başarısız: " + res.error);
      }
    } catch (error) {
      console.error(error);
      alert("Bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Yükleniyor...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/cms/services"
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase">
              {isNew ? "YENİ HİZMET EKLE" : "HİZMETİ DÜZENLE"}
            </h1>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? "KAYDEDİLİYOR..." : "KAYDET"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                Hizmet Başlığı
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    title: e.target.value,
                    slug: isNew ? generateSlug(e.target.value) : formData.slug,
                  });
                }}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Örn: İSG Yönetim Hizmetleri"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kısa Özet
              </label>
              <textarea
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[100px]"
                placeholder="Hizmet kartlarında gösterilecek kısa özet..."
              />
            </div>
          </div>

          {/* Editor */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
              İçerik
            </label>
            <RichTextEditor
              content={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
            />
          </div>
        </div>

        <div className="space-y-6">
          {/* Settings */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-sm border-b border-slate-200 dark:border-slate-800 pb-2">
              Yayın Ayarları
            </h3>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                URL (Slug)
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              <label htmlFor="isPublished" className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Yayında
              </label>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                Sıralama
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Media */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-sm border-b border-slate-200 dark:border-slate-800 pb-2">
              Öne Çıkan Görsel
            </h3>
            
            {formData.featuredImage ? (
              <div className="relative group rounded-xl overflow-hidden aspect-video bg-slate-100">
                <img
                  src={formData.featuredImage.startsWith('http') ? formData.featuredImage : `https://drive.google.com/uc?export=view&id=${formData.featuredImage}`}
                  alt="Öne Çıkan Görsel"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="p-2 bg-white rounded-lg text-slate-900 hover:bg-slate-100 font-bold text-xs"
                  >
                    Değiştir
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, featuredImage: "" })}
                    className="p-2 bg-red-600 rounded-lg text-white hover:bg-red-700"
                  >
                    Kaldır
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsMediaPickerOpen(true)}
                className="w-full py-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex flex-col items-center gap-2"
              >
                <ImageIcon size={32} />
                <span className="text-sm font-bold">Görsel Seç</span>
              </button>
            )}
          </div>

          {/* SEO */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-sm border-b border-slate-200 dark:border-slate-800 pb-2">
              SEO Ayarları
            </h3>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                SEO Başlığı
              </label>
              <input
                type="text"
                value={formData.seoTitle}
                onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                SEO Açıklaması
              </label>
              <textarea
                value={formData.seoDescription}
                onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[100px]"
              />
            </div>
          </div>
        </div>
      </div>

      <MediaPicker
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(fileId) => {
          setFormData({ ...formData, featuredImage: `https://drive.google.com/uc?export=view&id=${fileId}` });
          setIsMediaPickerOpen(false);
        }}
      />
    </div>
  );
}
