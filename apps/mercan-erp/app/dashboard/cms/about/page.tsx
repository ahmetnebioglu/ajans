"use client";

import React, { useState, useEffect } from "react";
import { Save, Loader2, Info, Image as ImageIcon, Type, Eye, Bold, Italic, Underline as UnderlineIcon, List, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { getHomepageSettings, updateHomepageSettings } from "../../../actions/homepage-actions";

// MenuBar component for Tiptap
const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const btnClass = (active: boolean) =>
    `p-2 rounded-lg transition-all ${active ? "bg-emerald-600 text-white" : "text-slate-400 hover:bg-slate-700 hover:text-white"}`;

  return (
    <div className="flex flex-wrap items-center gap-1 p-3 border-b border-slate-800 bg-slate-800/50">
      <button onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }} className={btnClass(editor.isActive("bold"))} title="Kalın"><Bold size={15} /></button>
      <button onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }} className={btnClass(editor.isActive("italic"))} title="İtalik"><Italic size={15} /></button>
      <button onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }} className={btnClass(editor.isActive("underline"))} title="Altı Çizili"><UnderlineIcon size={15} /></button>

      <div className="w-px h-5 bg-slate-700 mx-1" />

      <button onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 1 }).run(); }} className={`px-2 py-1 rounded-lg text-[11px] font-black transition-all ${btnClass(editor.isActive("heading", { level: 1 }))}`} title="Başlık 1">H1</button>
      <button onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run(); }} className={`px-2 py-1 rounded-lg text-[11px] font-black transition-all ${btnClass(editor.isActive("heading", { level: 2 }))}`} title="Başlık 2">H2</button>
      <button onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }} className={btnClass(editor.isActive("bulletList"))} title="Liste"><List size={15} /></button>

      <div className="w-px h-5 bg-slate-700 mx-1" />

      <button onClick={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('left').run(); }} className={btnClass(editor.isActive({ textAlign: 'left' }))} title="Sola Hizala"><AlignLeft size={15} /></button>
      <button onClick={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('center').run(); }} className={btnClass(editor.isActive({ textAlign: 'center' }))} title="Ortala"><AlignCenter size={15} /></button>
      <button onClick={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('right').run(); }} className={btnClass(editor.isActive({ textAlign: 'right' }))} title="Sağa Hizala"><AlignRight size={15} /></button>
    </div>
  );
};

export default function AboutSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    aboutTitle: "Biz Kimiz?",
    aboutContent: "",
    aboutImage: "",
  });

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      setFormData(prev => ({ ...prev, aboutContent: editor.getHTML() }));
    },
  });

  useEffect(() => {
    async function loadData() {
      const settings = await getHomepageSettings();
      if (settings) {
        setFormData({
          aboutTitle: settings.aboutTitle || "Biz Kimiz?",
          aboutContent: settings.aboutContent || "",
          aboutImage: settings.aboutImage || "",
        });
        if (editor) {
          editor.commands.setContent(settings.aboutContent || "");
        }
      }
      setLoading(false);
    }
    loadData();
  }, [editor]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Get other settings first to not overwrite them
      const currentSettings = await getHomepageSettings();
      const result = await updateHomepageSettings({
        ...currentSettings,
        aboutTitle: formData.aboutTitle,
        aboutContent: formData.aboutContent,
        aboutImage: formData.aboutImage,
      });

      if (result.success) {
        alert("Kurumsal bilgiler başarıyla güncellendi.");
      } else {
        alert(result.error || "Bir hata oluştu.");
      }
    } catch (error) {
      alert("Kaydetme işlemi sırasında bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12 pb-32">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
            <Info size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">Kurumsal <span className="text-emerald-600">Bilgiler</span></h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Hakkımızda ve Biz Kimiz İçeriği</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-premium bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-5 text-[10px] font-black uppercase tracking-widest disabled:opacity-50 flex items-center gap-3 shadow-lg shadow-emerald-600/20"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />}
          {saving ? "KAYDEDİLİYOR..." : "BİLGİLERİ GÜNCELLE"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content (Editor) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
             <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center gap-3">
                <Type size={18} className="text-emerald-600" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white italic">Ana İçerik (Editör)</span>
             </div>
             <MenuBar editor={editor} />
             <div 
               className="p-8 min-h-[400px] cursor-text"
               onClick={() => editor?.chain().focus().run()}
             >
                <EditorContent 
                  editor={editor}
                  className="min-h-[350px] [&_.ProseMirror]:min-h-[350px] [&_.ProseMirror]:outline-none [&_.ProseMirror]:text-slate-300 [&_.ProseMirror]:leading-relaxed [&_.ProseMirror]:font-medium [&_.ProseMirror_p]:mb-4 [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-black [&_.ProseMirror_h1]:uppercase [&_.ProseMirror_h1]:mb-4 [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-black [&_.ProseMirror_h2]:mb-3 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ul]:mb-4 [&_.ProseMirror_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child]:before:text-slate-600 [&_.ProseMirror_p.is-editor-empty:first-child]:before:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child]:before:float-left [&_.ProseMirror_p.is-editor-empty:first-child]:before:h-0"
                />
             </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-8">
          {/* Title Setting */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 space-y-6">
             <div className="flex items-center gap-3">
                <Type size={18} className="text-emerald-600" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white italic">Sayfa Başlığı</span>
             </div>
             <input
                type="text"
                value={formData.aboutTitle}
                onChange={(e) => setFormData({ ...formData, aboutTitle: e.target.value })}
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-slate-900 dark:text-white outline-none"
                placeholder="Örn: Mercan İSG Hakkında"
             />
          </div>

          {/* Image/Media Setting */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 space-y-6">
             <div className="flex items-center gap-3">
                <ImageIcon size={18} className="text-emerald-600" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white italic">Kapak Görseli</span>
             </div>
             <div className="aspect-video bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 gap-2 cursor-pointer hover:bg-slate-100 transition-colors">
                <ImageIcon size={32} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Görsel Seçin</span>
             </div>
             <p className="text-[9px] text-slate-400 italic">Sayfanın üst kısmında görünecek ana görsel.</p>
          </div>

          {/* View Website Link */}
          <a 
            href="/kurumsal" 
            target="_blank"
            className="flex items-center justify-between p-6 bg-slate-900 text-white rounded-[2rem] hover:bg-emerald-600 transition-all group"
          >
             <span className="text-[10px] font-black uppercase tracking-widest">Sayfayı Görüntüle</span>
             <Eye size={20} className="group-hover:scale-110 transition-transform" />
          </a>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .ProseMirror { outline: none; min-height: 350px; color: #cbd5e1; }
        .ProseMirror p { margin-bottom: 1rem; font-weight: 500; line-height: 1.8; }
        .ProseMirror h1 { font-size: 1.75rem; font-weight: 900; text-transform: uppercase; font-style: italic; margin-bottom: 1rem; color: #f1f5f9; }
        .ProseMirror h2 { font-size: 1.35rem; font-weight: 800; text-transform: uppercase; font-style: italic; margin-bottom: 0.75rem; color: #f1f5f9; }
        .ProseMirror ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
        .ProseMirror li { margin-bottom: 0.5rem; }
        .ProseMirror strong { color: #f1f5f9; font-weight: 700; }
        .ProseMirror.is-editor-empty > p.is-empty::before {
          content: "İçeriğinizi buraya yazın...";
          color: #475569;
          pointer-events: none;
          float: left;
          height: 0;
        }
      `}} />
    </div>
  );
}
