import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";

import FeaturedPost from "@/components/home/FeaturedPost";
import PostCard from "@/components/home/PostCard";

import { getFeaturedPost, getPublishedPosts } from "@/lib/posts";

export default async function Home() {
  const [featuredPost, posts] = await Promise.all([
    getFeaturedPost(),
    getPublishedPosts(),
  ]);

  const otherPosts = posts
    .filter((post) => post.id !== featuredPost?.id)
    .slice(0, 3);

  return (
    <>
      {/* ========================================
          HERO
      ======================================== */}

      <section className="hero">
        <div className="hero-inner">
          <span className="eyebrow">A PERSONAL JOURNAL</span>

          <h1>
            Words for the things
            <br />
            we don&apos;t always say.
          </h1>

          <p className="hero-description">
            Stories, poems, passing thoughts and little pieces of life — kept
            here before they disappear.
          </p>

          <Link href="#latest" className="explore-link">
            Explore the journal
            <ArrowDown size={15} strokeWidth={1.5} />
          </Link>
        </div>
      </section>

      {/* ========================================
          QUOTE
      ======================================== */}

      <section className="quote-section">
        <div className="quote-mark">“</div>

        <p>
          Some things are easier to leave
          <br />
          between the lines.
        </p>
      </section>

      {/* ========================================
          LATEST WRITING
      ======================================== */}

      <section id="latest" className="latest-section">
        <div className="section-heading">
          <div>
            <span>01</span>
            <h2>Latest Writing</h2>
          </div>

          <Link href="/writing" className="view-all">
            View all
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* FEATURED POST */}

        {featuredPost ? (
          <FeaturedPost post={featuredPost} />
        ) : (
          <div className="empty-preview">
            <p>No featured writing yet.</p>

            <span>Something beautiful will live here soon.</span>
          </div>
        )}

        {/* OTHER POSTS */}

        {otherPosts.length > 0 && (
          <div className="post-grid">
            {otherPosts.map((post, index) => (
              <PostCard
                key={post.id}
                number={String(index + 2).padStart(2, "0")}
                category={post.category}
                date={
                  post.published_at
                    ? new Intl.DateTimeFormat("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      }).format(new Date(post.published_at))
                    : ""
                }
                title={post.title}
                excerpt={post.excerpt ?? ""}
                /* NEW */
                image={post.cover_image}
                /* NEW */
                href={`/blog/${post.slug}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* ========================================
          CATEGORIES
      ======================================== */}

      <section className="categories-section">
        <div className="categories-inner">
          <span className="eyebrow">BROWSE BY MOOD</span>

          <div className="category-list">
            <Link href="/writing">
              <span>01</span>
              <strong>Thoughts</strong>
              <ArrowRight />
            </Link>

            <Link href="/poems">
              <span>02</span>
              <strong>Poetry</strong>
              <ArrowRight />
            </Link>

            <Link href="/stories">
              <span>03</span>
              <strong>Stories</strong>
              <ArrowRight />
            </Link>

            <Link href="/writing">
              <span>04</span>
              <strong>Little Things</strong>
              <ArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================
          CLOSING
      ======================================== */}

      <section className="closing-section">
        <span>✦</span>

        <h2>
          Not everything needs
          <br />
          to be understood.
        </h2>

        <p>Some things only need to be felt.</p>
      </section>
    </>
  );
}
