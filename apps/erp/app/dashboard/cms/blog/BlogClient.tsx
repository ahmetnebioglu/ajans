"use client";

import React, { useState } from "react";
import { Plus, Edit2, Trash2, Globe, Eye, EyeOff, Image as ImageIcon, Calendar, Tag } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { createBlogPost, updateBlogPost, deleteBlogPost } from "../../../actions/blog-actions";
import RichTextEditor from "../../../components/cms/RichTextEditor";

interface BlogClientProps {
  initialPosts: any[];
  categories: any[];
}

export default function BlogClient({ initialPosts, categories }: BlogClientProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      slug: formData.get("slug") as string,
      excerpt: formData.get("excerpt") as string,
      content: content, // Rich Text Editor'den gelen veri
      coverImage: formData.get("coverImage") as string,
      categoryId: formData.get("categoryId") as string,
      isPublished: formData.get("isPublished") === "on",
    };

    if (editingPost) {
      await updateBlogPost(editingPost.id, data);
    } else {
      await createBlogPost(data);
    }

    window.location.reload();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bu yazıyı silmek istediğinize emin misiniz?")) {
      await deleteBlogPost(id);
      window.location.reload();
    }
  };

  const handleOpenForm = (post: any = null) => {
    setEditingPost(post);
    setContent(post?.content || "");
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
           <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
              Haberler & <span className="text-emerald-600">Blog Yönetimi</span>
           </h1>
           <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
              Web sitesindeki haberleri ve sektörel makaleleri yönetin
           </p>
        </div>

        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white font-black uppercase italic tracking-widest text-[11px] rounded-[4px] shadow-sm shadow-emerald-600/20 hover:scale-105 transition-all active:scale-95 shrink-0"
        >
          <Plus size={18} /> YENİ YAZI EKLE
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-[4px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 italic">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600">Blog Yazıları</p>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 italic">
              <th className="p-8 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Görsel & Başlık</th>
              <th className="p-8 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Durum</th>
              <th className="p-8 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Yayın Tarihi</th>
              <th className="p-8 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {posts.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-24 text-center text-slate-300 dark:text-slate-800 font-black uppercase tracking-widest italic leading-loose">Henüz yazı eklenmemiş.</td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="p-8">
                    <div className="flex items-center gap-5">
                      {post.image ? (
                        <div className="w-16 h-16 rounded-[4px] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
                          <img src={post.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-[4px] flex items-center justify-center text-slate-300 dark:text-slate-700 shrink-0 border border-slate-200 dark:border-slate-800 shadow-inner">
                          <ImageIcon size={24} />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900 dark:text-white text-base tracking-tighter uppercase italic leading-tight group-hover:text-emerald-600 transition-colors">{post.title}</span>
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest">/{post.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-8">
                    <span className={`px-4 py-1.5 rounded-[4px] text-[8px] font-black uppercase tracking-widest border shadow-md ${post.isPublished ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'}`}>
                      {post.isPublished ? 'YAYINDA' : 'TASLAK'}
                    </span>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 italic">
                      <Calendar size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{format(new Date(post.createdAt), "dd MMM yyyy", { locale: tr })}</span>
                    </div>
                  </td>
                  <td className="p-8 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => handleOpenForm(post)} 
                        className="p-3 text-slate-300 dark:text-slate-700 hover:text-emerald-600 dark:hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-[4px] transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(post.id)} 
                        className="p-3 text-slate-300 dark:text-slate-700 hover:text-rose-600 dark:hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-[4px] transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[4px] shadow-sm border border-slate-800 p-6 lg:p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                {editingPost ? "YAZIYI DÜZENLE" : "YENİ YAZI EKLE"}
              </h2>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                KAPAT
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic ml-2">Başlık</label>
                  <input
                    name="title"
                    defaultValue={editingPost?.title}
                    required
                    className="w-full px-5 py-3 rounded-[4px] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white font-bold italic"
                    placeholder="Haber başlığı..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic ml-2">Slug</label>
                  <input
                    name="slug"
                    defaultValue={editingPost?.slug}
                    required
                    className="w-full px-5 py-3 rounded-[4px] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white font-bold italic"
                    placeholder="haber-slug-adresi"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic ml-2">Kapak Görseli URL</label>
                  <input
                    name="coverImage"
                    defaultValue={editingPost?.coverImage}
                    className="w-full px-5 py-3 rounded-[4px] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white font-bold italic"
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic ml-2">Kategori</label>
                  <select
                    name="categoryId"
                    defaultValue={editingPost?.categoryId}
                    className="w-full px-5 py-3 rounded-[4px] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white font-bold italic appearance-none"
                  >
                    <option value="">Kategori Seçin</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic ml-2">Kısa Özet</label>
                <textarea
                  name="excerpt"
                  defaultValue={editingPost?.excerpt}
                  required
                  rows={3}
                  className="w-full px-5 py-3 rounded-[4px] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white font-bold italic resize-none"
                  placeholder="Yazı listesinde görünecek kısa açıklama..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic ml-2">İçerik</label>
                <RichTextEditor 
                  content={content} 
                  onChange={setContent} 
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" name="isPublished" defaultChecked={editingPost?.isPublished} className="sr-only" />
                    <div className="w-12 h-6 bg-slate-200 dark:bg-white/10 rounded-full transition-colors group-hover:bg-slate-300 dark:group-hover:bg-white/20"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                  </div>
                  <span className="text-xs font-black uppercase italic tracking-widest text-slate-500">Yayına Al</span>
                </label>

                 <button type="submit" className="px-10 py-4 bg-emerald-600 text-white font-black uppercase italic tracking-[0.2em] text-[10px] rounded-[4px] shadow-sm shadow-emerald-600/20 hover:bg-slate-900 dark:hover:bg-emerald-700 transition-all active:scale-95">
                  KAYDET VE GÜNCELLE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
