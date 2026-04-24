import React from "react";
import { prisma as db } from "@/lib/db";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Calendar, Tag, ChevronRight } from "lucide-react";

export default async function HaberlerPage() {
  const posts = await db.blogPost.findMany({
    where: { isPublished: true },
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main className="min-h-screen bg-white">
      {/* HERO ALANI - Dinamik Koyu Tema */}
      <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden bg-[#0A0F1C]">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(10,15,28,0.8))]"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-black uppercase tracking-[0.3em] animate-pulse">
            MERCAN OSGB HABER MERKEZİ
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white uppercase italic tracking-tighter leading-none">
            SEKTÖREL <span className="text-teal-400 block md:inline">HABERLER & BLOG</span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-400 text-lg font-medium italic">
            İş Sağlığı ve Güvenliği dünyasından en son gelişmeler, güncel mevzuat haberleri ve uzman makaleleri.
          </p>
        </div>

        {/* Yansıma Efekti */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/50 to-transparent shadow-[0_0_20px_rgba(20,184,166,0.5)]"></div>
      </section>

      {/* LİSTE ALANI - Dinamik Aydınlık Tema */}
      <section className="py-24 container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {posts.map((post) => (
            <Link 
              href={`/haberler/${post.slug}`} 
              key={post.id}
              className="group flex flex-col bg-slate-50 rounded-[2.5rem] overflow-hidden border border-slate-100 hover:border-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/5 transition-all duration-500"
            >
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden">
                {post.featuredImage ? (
                  <img 
                    src={post.featuredImage} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                    <Tag size={48} strokeWidth={1} />
                  </div>
                )}
                <div className="absolute top-6 left-6">
                  <span className="px-4 py-1.5 bg-teal-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                    {post.category?.name || "GENEL"}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 flex flex-col flex-1 space-y-4">
                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><Calendar size={12} /> {format(new Date(post.createdAt), "dd MMMM yyyy", { locale: tr })}</span>
                </div>
                
                <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter leading-tight line-clamp-2 group-hover:text-teal-600 transition-colors">
                  {post.title}
                </h3>
                
                <p className="text-slate-500 text-sm font-medium line-clamp-3 italic">
                  {post.excerpt}
                </p>

                <div className="pt-4 mt-auto">
                  <div className="inline-flex items-center gap-2 text-teal-600 font-black text-xs uppercase tracking-widest group/btn">
                    DEVAMINI OKU 
                    <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-[3rem]">
            <p className="text-slate-400 font-bold uppercase italic tracking-widest">Henüz yayınlanmış bir haber bulunmuyor.</p>
          </div>
        )}
      </section>
    </main>
  );
}

