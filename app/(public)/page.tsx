import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Feather,
} from "lucide-react";

import FeaturedPost from "@/components/home/FeaturedPost";
import PostCard from "@/components/home/PostCard";

import { getFeaturedPost, getPublishedPosts } from "@/lib/posts";

function formatDate(date: string | null) {
  if (!date) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

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

      <section className="hero home-hero">
        <div className="hero-inner">
          <div className="home-hero-top">
            <span className="eyebrow">A PERSONAL JOURNAL</span>

            <span className="home-hero-note">Stories · Poems · Thoughts</span>
          </div>

          <h1>
            Words for the things
            <br />
            we don&apos;t always <em>say.</em>
          </h1>

          <div className="home-hero-bottom">
            <p className="hero-description">
              Stories, poems, passing thoughts and little pieces of life — kept
              here before they disappear.
            </p>

            <Link href="#latest" className="explore-link">
              Explore the journal
              <ArrowDown size={14} strokeWidth={1.4} />
            </Link>
          </div>

          <span className="home-hero-decoration">✦</span>
        </div>
      </section>

      {/* ========================================
          QUOTE
      ======================================== */}

      <section className="quote-section home-quote">
        <div className="home-quote-inner">
          <span className="home-quote-label">BETWEEN THE LINES</span>

          <div className="quote-mark">“</div>

          <p>
            Some things are easier
            <br />
            to leave <em>between the lines.</em>
          </p>

          <span className="home-quote-line" />
        </div>
      </section>

      {/* ========================================
          LATEST WRITING
      ======================================== */}

      <section id="latest" className="latest-section">
        <div className="section-heading">
          <div>
            <span>01</span>

            <div>
              <small>FROM THE JOURNAL</small>

              <h2>Latest Writing</h2>
            </div>
          </div>

          <Link href="/writing" className="view-all">
            View all writing
            <ArrowRight size={13} />
          </Link>
        </div>

        {featuredPost ? (
          <FeaturedPost post={featuredPost} />
        ) : (
          <div className="empty-preview">
            <span>✦</span>

            <p>No featured writing yet.</p>

            <small>Something beautiful will live here soon.</small>
          </div>
        )}

        {otherPosts.length > 0 && (
          <div className="post-grid">
            {otherPosts.map((post, index) => (
              <PostCard
                key={post.id}
                number={String(index + 2).padStart(2, "0")}
                category={post.category}
                date={formatDate(post.published_at)}
                title={post.title}
                excerpt={post.excerpt ?? ""}
                image={post.cover_image}
                href={`/blog/${post.slug}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* ========================================
          BROWSE
      ======================================== */}

      <section className="categories-section">
        <div className="categories-inner">
          <div className="home-browse-heading">
            <div>
              <span className="eyebrow">BROWSE THE JOURNAL</span>

              <h2>
                Find something
                <br />
                for the mood you&apos;re in.
              </h2>
            </div>

            <p>
              A small collection of thoughts, poems, stories and ordinary
              moments worth remembering.
            </p>
          </div>

          <div className="category-list">
            <Link href="/writing">
              <span>01</span>

              <div>
                <small>PASSING NOTES</small>

                <strong>Thoughts</strong>
              </div>

              <ArrowUpRight />
            </Link>

            <Link href="/poems">
              <span>02</span>

              <div>
                <small>IN VERSE</small>

                <strong>Poetry</strong>
              </div>

              <ArrowUpRight />
            </Link>

            <Link href="/stories">
              <span>03</span>

              <div>
                <small>LONGER WORLDS</small>

                <strong>Stories</strong>
              </div>

              <ArrowUpRight />
            </Link>

            <Link href="/writing">
              <span>04</span>

              <div>
                <small>ORDINARY DAYS</small>

                <strong>Little Things</strong>
              </div>

              <ArrowUpRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================
          CLOSING
      ======================================== */}

      <section className="closing-section home-closing">
        <div className="home-closing-icon">
          <Feather size={18} strokeWidth={1.1} />
        </div>

        <span className="eyebrow">ONE LAST THOUGHT</span>

        <h2>
          Not everything needs
          <br />
          to be <em>understood.</em>
        </h2>

        <p>Some things only need to be felt.</p>

        <Link href="/writing" className="home-closing-link">
          <BookOpen size={14} strokeWidth={1.3} />
          Keep reading
        </Link>
      </section>
    </>
  );
}
