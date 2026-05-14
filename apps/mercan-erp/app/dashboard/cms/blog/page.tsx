import React from "react";
import { getBlogPosts, getBlogCategories } from "../../../actions/blog-actions";
import BlogClient from "./BlogClient";

export default async function BlogPage() {
  const postsResponse = await getBlogPosts();
  const categoriesResponse = await getBlogCategories();

  // Handle ActionResponse type
  const posts = postsResponse.success ? postsResponse.data : [];
  const categories = categoriesResponse.success ? categoriesResponse.data : [];

  return (
    <div className="p-8 space-y-8">
      <BlogClient initialPosts={posts} categories={categories} />
    </div>
  );
}
