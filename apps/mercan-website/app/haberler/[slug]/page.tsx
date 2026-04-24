import React from "react";
import { prisma as db } from "@/lib/db";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Calendar, Tag, ChevronLeft } from "lucide-react";
import Link from "next/link";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await db.blogPost.findUnique({
    where: { slug },
    include: { category: true }
  });

  if (!post) notFound();

  return (
    <main className="min-h-screen bg-white pb-24">
      {/* Header / Nav */}
      <div className="bg-[#0A0F1C] py-6 border-b border-white/5">
        <div className="container mx-auto px-6">
          <Link href="/haberler" className="inline-flex items-center gap-2 text-teal-400 font-black text-[10px] uppercase tracking-[0.2em] italic hover:text-white transition-colors">
            <ChevronLeft size={16} /> HABERLERE GERİ DÖN
          </Link>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative h-[40vh] md:h-[60vh] overflow-hidden bg-slate-900">
        {post.featuredImage && (
          <img 
            src={post.featuredImage} 
            alt={post.title}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent"></div>
      </div>

      <article className="container mx-auto px-6 -mt-32 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Article Meta */}
          <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100 space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <span className="px-4 py-1.5 bg-teal-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                {post.category?.name || "GENEL"}
              </span>
              <span className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">
                <Calendar size={14} /> {format(new Date(post.createdAt), "dd MMMM yyyy", { locale: tr })}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-slate-900 uppercase italic tracking-tighter leading-[1.1]">
              {post.title}
            </h1>

            <p className="text-xl text-slate-500 font-bold italic leading-relaxed border-l-4 border-teal-500 pl-6">
              {post.excerpt}
            </p>

            {/* Content Area */}
            <div className="pt-12 border-t border-slate-100">
              <div 
                className="prose prose-lg prose-teal max-w-none dark:prose-invert prose-headings:font-black prose-headings:uppercase prose-headings:italic prose-headings:tracking-tighter prose-p:font-medium prose-p:italic prose-p:text-slate-700"
                dangerouslySetInnerHTML={{ __html: post.content }} 
              />
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}
