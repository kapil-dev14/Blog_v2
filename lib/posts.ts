import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/types/post";

/* ========================================
   PUBLIC POSTS
======================================== */

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
   STORIES
======================================== */

export async function getPublishedStories(): Promise<Post[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .eq("category", "story")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error fetching stories:", error);
    return [];
  }

  return data ?? [];
}

/*
  Returns all published chapters belonging
  to one series in chapter order.
*/

export async function getSeriesChapters(seriesSlug: string): Promise<Post[]> {
  if (!seriesSlug) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .eq("category", "story")
    .eq("series_slug", seriesSlug)
    .order("chapter_number", {
      ascending: true,
    });

  if (error) {
    console.error("Error fetching story chapters:", error);

    return [];
  }

  return data ?? [];
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

/* ========================================
   SEARCH
======================================== */

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
      post.series_title ?? "",
      post.content_html.replace(/<[^>]*>/g, " "),
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(cleanQuery);
  });
}
