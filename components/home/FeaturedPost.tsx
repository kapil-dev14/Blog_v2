import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Post } from "@/types/post";

type FeaturedPostProps = {
  post: Post;
};

function formatPostDate(date: string | null) {
  if (!date) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default function FeaturedPost({ post }: FeaturedPostProps) {
  return (
    <article className="featured-post">
      <div className="featured-image">
        {post.cover_image ? (
          <img
            src={post.cover_image}
            alt={post.title}
            className="featured-cover"
          />
        ) : (
          <div className="image-placeholder">
            <span>featured writing</span>
          </div>
        )}
      </div>

      <div className="featured-content">
        <div className="post-meta">
          <span>{formatPostDate(post.published_at)}</span>

          <span className="meta-dot">•</span>

          <span>{post.category}</span>
        </div>

        <h3>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>

        {post.excerpt && <p>{post.excerpt}</p>}

        <Link href={`/blog/${post.slug}`} className="read-link">
          Read the entry
          <ArrowUpRight size={14} strokeWidth={1.5} />
        </Link>
      </div>
    </article>
  );
}
