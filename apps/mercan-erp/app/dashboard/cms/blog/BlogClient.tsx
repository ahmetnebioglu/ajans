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
      <div className="flex justify-end">
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-black uppercase italic tracking-widest text-xs rounded-xl shadow-xl shadow-blue-600/20 hover:scale-105 transition-all"
        >
          <Plus size={16} /> YENİ YAZI EKLE
        </button>
      </div>

      {/* Blog List Table */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/5">
              <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Görsel</th>
              <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Başlık</th>
              <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Kategori</th>
              <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Durum</th>
              <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Tarih</th>
              <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400 italic text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                <td className="p-5">
                  {post.coverImage ? (
                    <img src={post.coverImage} className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-white/10" alt="" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
                      <ImageIcon size={20} />
                    </div>
                  )}
                </td>
                <td className="p-5">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-900 dark:text-white uppercase italic tracking-tighter line-clamp-1">{post.title}</span>
                    <span className="text-[10px] font-bold text-slate-400">/{post.slug}</span>
                  </div>
                </td>
                <td className="p-5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase italic">
                    <Tag size={10} /> {post.categories?.name || "Genel"}
                  </span>
                </td>
                <td className="p-5">
                  {post.isPublished ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 text-[9px] font-black uppercase italic tracking-widest">
                      <Eye size={10} /> YAYINDA
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500 text-[9px] font-black uppercase italic tracking-widest">
                      <EyeOff size={10} /> TASLAK
                    </span>
                  )}
                </td>
                <td className="p-5 text-[11px] font-bold text-slate-500 italic">
                  {format(new Date(post.createdAt), "dd MMM yyyy", { locale: tr })}
                </td>
                <td className="p-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenForm(post)}
                      className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#0F172A] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl border border-white/10 p-8 lg:p-12">
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
                    className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white font-bold italic"
                    placeholder="Haber başlığı..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic ml-2">Slug</label>
                  <input
                    name="slug"
                    defaultValue={editingPost?.slug}
                    required
                    className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white font-bold italic"
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
                    className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white font-bold italic"
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic ml-2">Kategori</label>
                  <select
                    name="categoryId"
                    defaultValue={editingPost?.categoryId}
                    className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white font-bold italic appearance-none"
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
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white font-bold italic resize-none"
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

                <button type="submit" className="px-10 py-4 bg-blue-600 text-white font-black uppercase italic tracking-widest text-sm rounded-2xl shadow-xl shadow-blue-600/30 hover:scale-105 transition-all">
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
