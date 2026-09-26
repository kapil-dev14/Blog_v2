import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen } from "lucide-react";

import LikeButton from "@/components/blog/LikeButton";
import Comments from "@/components/blog/Comments";

import {
  getPostBySlug,
  getPublishedPosts,
  getSeriesChapters,
} from "@/lib/posts";

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
   METADATA
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

    description: post.excerpt || "A piece from Aashu.",

    openGraph: {
      title: post.title,

      description: post.excerpt || "A piece from Aashu.",

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

  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const readingTime = calculateReadingTime(post.content_html);

  const isPoem = post.category === "poem";

  const isChapter =
    post.category === "story" &&
    Boolean(post.series_slug && post.series_title && post.chapter_number);

  /* =====================================
     CHAPTER NAVIGATION
  ===================================== */

  const chapters =
    isChapter && post.series_slug
      ? await getSeriesChapters(post.series_slug)
      : [];

  const chapterIndex = isChapter
    ? chapters.findIndex((chapter) => chapter.id === post.id)
    : -1;

  const previousChapter = chapterIndex > 0 ? chapters[chapterIndex - 1] : null;

  const nextChapter =
    chapterIndex >= 0 && chapterIndex < chapters.length - 1
      ? chapters[chapterIndex + 1]
      : null;

  /* =====================================
     NORMAL POST NAVIGATION
  ===================================== */

  let olderPost = null;
  let newerPost = null;

  if (!isChapter) {
    const posts = await getPublishedPosts();

    const currentIndex = posts.findIndex((item) => item.id === post.id);

    newerPost = currentIndex > 0 ? posts[currentIndex - 1] : null;

    olderPost =
      currentIndex >= 0 && currentIndex < posts.length - 1
        ? posts[currentIndex + 1]
        : null;
  }

  return (
    <article className={`article-page ${isPoem ? "article-page-poem" : ""}`}>
      {/* =================================
          ARTICLE HEADER
      ================================= */}

      <header className="article-header">
        <div className="article-header-inner">
          <Link
            href={post.category === "story" ? "/stories" : "/writing"}
            className="article-back"
          >
            <ArrowLeft size={13} strokeWidth={1.4} />

            {post.category === "story" ? "Stories" : "All writing"}
          </Link>

          {/* SERIES */}

          {isChapter && (
            <div className="article-series-heading">
              <BookOpen size={14} strokeWidth={1.3} />

              <span>{post.series_title}</span>
            </div>
          )}

          {/* META */}

          <div className="article-meta">
            {isChapter ? (
              <>
                <span>
                  Chapter {String(post.chapter_number).padStart(2, "0")}
                </span>

                <span>•</span>

                <span>
                  {chapterIndex + 1} of {chapters.length}
                </span>
              </>
            ) : (
              <span>{formatCategory(post.category)}</span>
            )}

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

      {/* =================================
          COVER
      ================================= */}

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

      {/* =================================
          CONTENT
      ================================= */}

      <div className="article-layout">
        <div
          className="article-content"
          dangerouslySetInnerHTML={{
            __html: post.content_html,
          }}
        />
      </div>

      {/* =================================
          REACTION / ARTICLE END
      ================================= */}

      <section className="reader-response">
        <div className="reader-response-inner">
          <LikeButton postId={post.id} />

          <a href="#comments" className="reader-comment-link">
            Join the conversation
            <ArrowUpRight size={13} strokeWidth={1.3} />
          </a>
        </div>
      </section>

      <section className="article-farewell">
        <span>✦</span>

        <p>
          {isPoem
            ? "Some words are meant to linger."
            : "Thank you for staying until the last line."}
        </p>
      </section>

      {/* =================================
          CHAPTER NAVIGATION
      ================================= */}

      {isChapter && chapters.length > 0 && (
        <section className="chapter-navigation-section">
          <div className="chapter-navigation-top">
            <span>{post.series_title}</span>

            <strong>
              {chapters.length} {chapters.length === 1 ? "chapter" : "chapters"}
            </strong>
          </div>

          <nav className="chapter-navigation" aria-label="Story chapters">
            {previousChapter ? (
              <Link
                href={`/blog/${previousChapter.slug}`}
                className="chapter-nav-side chapter-nav-previous"
              >
                <span>
                  <ArrowLeft size={13} />
                  Previous chapter
                </span>

                <strong>
                  {String(previousChapter.chapter_number).padStart(2, "0")}.{" "}
                  {previousChapter.title}
                </strong>
              </Link>
            ) : (
              <div className="chapter-nav-side chapter-nav-empty" />
            )}

            <details className="chapter-all">
              <summary>
                <BookOpen size={14} strokeWidth={1.3} />

                <span>All chapters</span>
              </summary>

              <div className="chapter-all-list">
                {chapters.map((chapter) => (
                  <Link
                    key={chapter.id}
                    href={`/blog/${chapter.slug}`}
                    className={chapter.id === post.id ? "chapter-current" : ""}
                  >
                    <span>
                      {String(chapter.chapter_number).padStart(2, "0")}
                    </span>

                    <strong>{chapter.title}</strong>

                    {chapter.id === post.id && <small>Reading</small>}
                  </Link>
                ))}
              </div>
            </details>

            {nextChapter ? (
              <Link
                href={`/blog/${nextChapter.slug}`}
                className="chapter-nav-side chapter-nav-next"
              >
                <span>
                  Next chapter
                  <ArrowRight size={13} />
                </span>

                <strong>
                  {String(nextChapter.chapter_number).padStart(2, "0")}.{" "}
                  {nextChapter.title}
                </strong>
              </Link>
            ) : (
              <div className="chapter-nav-side chapter-nav-empty" />
            )}
          </nav>
        </section>
      )}

      {/* =================================
          NORMAL PREVIOUS / NEXT
      ================================= */}

      {!isChapter && (olderPost || newerPost) && (
        <nav className="article-navigation" aria-label="More writing">
          {olderPost ? (
            <Link
              href={`/blog/${olderPost.slug}`}
              className="article-navigation-item article-navigation-previous"
            >
              <span className="article-navigation-label">
                <ArrowLeft size={13} />
                Previous writing
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
                Next writing
                <ArrowRight size={13} />
              </span>

              <strong>{newerPost.title}</strong>
            </Link>
          ) : (
            <div />
          )}
        </nav>
      )}

      {/* =================================
          COMMENTS
      ================================= */}

      <Comments postId={post.id} />

      {/* =================================
          BACK
      ================================= */}

      <div className="article-bottom-link">
        <Link href={post.category === "story" ? "/stories" : "/writing"}>
          <ArrowLeft size={12} />

          {post.category === "story"
            ? "Back to stories"
            : "Back to all writing"}
        </Link>
      </div>
    </article>
  );
}
