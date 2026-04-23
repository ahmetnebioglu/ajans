import React from "react";
import { getBlogPosts, getBlogCategories } from "../../../actions/blog-actions";
import BlogClient from "./BlogClient";

export default async function BlogPage() {
  const posts = await getBlogPosts();
  const categories = await getBlogCategories();

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">
          Haberler & Blog Yönetimi
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Web sitesindeki haberleri ve sektörel makaleleri buradan yönetebilirsiniz.
        </p>
      </div>

      <BlogClient initialPosts={posts} categories={categories} />
    </div>
  );
}
