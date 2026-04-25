import React from "react";
import { getBlogPosts, getBlogCategories } from "../../../actions/blog-actions";
import BlogClient from "./BlogClient";

export default async function BlogPage() {
  const posts = await getBlogPosts();
  const categories = await getBlogCategories();

  return (
    <div className="p-8 space-y-8">
      <BlogClient initialPosts={posts} categories={categories} />
    </div>
  );
}
