export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_html: string;
  category: string;
  cover_image: string | null;

  featured: boolean;
  published: boolean;

  published_at: string | null;
  created_at: string;
  updated_at: string;

  // Story / chapter system
  series_title: string | null;
  series_slug: string | null;
  chapter_number: number | null;
};
