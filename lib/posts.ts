import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/types/post";

export async function getPublishedPosts(): Promise<Post[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }

  return data ?? [];
}

export async function getFeaturedPost(): Promise<Post | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .eq("featured", true)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching featured post:", error);
    return null;
  }

  return data;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    console.error("Error fetching post:", error);
    return null;
  }

  return data;
}

/* ========================================
   ADMIN
======================================== */

export async function getAllPosts(): Promise<Post[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching admin posts:", error);
    return [];
  }

  return data ?? [];
}
export async function getPostById(id: string): Promise<Post | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching admin post:", error);
    return null;
  }

  return data;
}
export async function searchPublishedPosts(query: string): Promise<Post[]> {
  const cleanQuery = query.trim().toLowerCase();

  if (!cleanQuery) {
    return [];
  }

  const posts = await getPublishedPosts();

  return posts.filter((post) => {
    const searchableText = [
      post.title,
      post.excerpt ?? "",
      post.category,
      post.content_html.replace(/<[^>]*>/g, " "),
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(cleanQuery);
  });
}
