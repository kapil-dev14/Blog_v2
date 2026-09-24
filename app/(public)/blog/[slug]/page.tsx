import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import LikeButton from "@/components/blog/LikeButton";
import { getPostBySlug, getPublishedPosts } from "@/lib/posts";
import Comments from "@/components/blog/Comments";
type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatPostDate(date: string | null) {
  if (!date) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function calculateReadingTime(html: string) {
  const text = html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ");

  const words = text.trim().split(/\s+/).filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 200));
}

function formatCategory(category: string) {
  if (category === "poem") return "Poetry";
  if (category === "story") return "Story";
  if (category === "journal") return "Journal";

  return "Thoughts";
}

/* ========================================
   DYNAMIC SEO
======================================== */

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;

  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Writing not found",
    };
  }

  return {
    title: post.title,

    description: post.excerpt || "A piece from Her Journal.",

    openGraph: {
      title: post.title,

      description: post.excerpt || "A piece from Her Journal.",

      type: "article",

      publishedTime: post.published_at || undefined,

      images: post.cover_image
        ? [
            {
              url: post.cover_image,
              alt: post.title,
            },
          ]
        : undefined,
    },
  };
}

/* ========================================
   PAGE
======================================== */

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  const [post, posts] = await Promise.all([
    getPostBySlug(slug),
    getPublishedPosts(),
  ]);

  if (!post) {
    notFound();
  }

  const readingTime = calculateReadingTime(post.content_html);

  /*
   * getPublishedPosts() is newest → oldest.
   *
   * We use the current position to find the
   * pieces surrounding this one.
   */

  const currentIndex = posts.findIndex((item) => item.id === post.id);

  const newerPost = currentIndex > 0 ? posts[currentIndex - 1] : null;

  const olderPost =
    currentIndex >= 0 && currentIndex < posts.length - 1
      ? posts[currentIndex + 1]
      : null;

  const isPoem = post.category === "poem";

  return (
    <article className={`article-page ${isPoem ? "article-page-poem" : ""}`}>
      {/* ====================================
          HEADER
      ==================================== */}

      <header className="article-header">
        <div className="article-header-inner">
          <Link href="/writing" className="article-back">
            <ArrowLeft size={14} strokeWidth={1.5} />
            All writing
          </Link>

          <div className="article-meta">
            <span>{formatCategory(post.category)}</span>

            <span>•</span>

            <span>{formatPostDate(post.published_at)}</span>

            <span>•</span>

            <span>{readingTime} min read</span>
          </div>

          <h1>{post.title}</h1>

          {post.excerpt && <p className="article-intro">{post.excerpt}</p>}

          <div className="article-header-mark">✦</div>
        </div>
      </header>

      {/* ====================================
          COVER
      ==================================== */}

      {post.cover_image && (
        <div className="article-cover-section">
          <div className="article-cover-wrap">
            <img
              src={post.cover_image}
              alt={post.title}
              className="article-cover"
            />
          </div>
        </div>
      )}

      {/* ====================================
          WRITING
      ==================================== */}

      <div className="article-layout">
        <aside className="article-side">
          <span>{isPoem ? "VERSE" : "WORDS"}</span>

          <div />
        </aside>

        <div
          className="article-content"
          dangerouslySetInnerHTML={{
            __html: post.content_html,
          }}
        />

        <aside className="article-side article-side-right">
          <div />
          <span>✦</span>
        </aside>
      </div>

      {/* ====================================
          END
      ==================================== */}

      <footer className="article-end">
        <span className="article-end-mark">✦</span>
        <section className="article-reaction">
          <LikeButton postId={post.id} />
        </section>
        <Comments postId={post.id} />

        <p>
          {isPoem
            ? "Some words are meant to linger."
            : "Thank you for staying until the last line."}
        </p>

        <Link href="/writing">
          Back to all writing
          <ArrowUpRight size={13} strokeWidth={1.3} />
        </Link>
      </footer>

      {/* ====================================
          PREVIOUS / NEXT
      ==================================== */}

      {(olderPost || newerPost) && (
        <nav className="article-navigation" aria-label="More writing">
          {olderPost ? (
            <Link
              href={`/blog/${olderPost.slug}`}
              className="article-navigation-item article-navigation-previous"
            >
              <span className="article-navigation-label">
                <ArrowLeft size={13} strokeWidth={1.3} />
                Older
              </span>

              <strong>{olderPost.title}</strong>
            </Link>
          ) : (
            <div />
          )}

          {newerPost ? (
            <Link
              href={`/blog/${newerPost.slug}`}
              className="article-navigation-item article-navigation-next"
            >
              <span className="article-navigation-label">
                Newer
                <ArrowRight size={13} strokeWidth={1.3} />
              </span>

              <strong>{newerPost.title}</strong>
            </Link>
          ) : (
            <div />
          )}
        </nav>
      )}
    </article>
  );
}
