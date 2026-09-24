import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { getPublishedPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Writing",
  description: "Thoughts, poems, stories and little pieces of life.",
};

type WritingPageProps = {
  searchParams: Promise<{
    category?: string;
  }>;
};

const categories = [
  {
    label: "All",
    value: "all",
    href: "/writing",
  },
  {
    label: "Thoughts",
    value: "thoughts",
    href: "/writing?category=thoughts",
  },
  {
    label: "Poetry",
    value: "poem",
    href: "/writing?category=poem",
  },
  {
    label: "Stories",
    value: "story",
    href: "/writing?category=story",
  },
  {
    label: "Journal",
    value: "journal",
    href: "/writing?category=journal",
  },
];

function formatDate(date: string | null) {
  if (!date) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function formatCategory(category: string) {
  if (category === "poem") return "Poetry";
  if (category === "story") return "Stories";
  if (category === "journal") return "Journal";

  return "Thoughts";
}

export default async function WritingPage({ searchParams }: WritingPageProps) {
  const { category } = await searchParams;

  const posts = await getPublishedPosts();

  const validCategories = ["thoughts", "poem", "story", "journal"];

  const activeCategory =
    category && validCategories.includes(category) ? category : "all";

  const filteredPosts =
    activeCategory === "all"
      ? posts
      : posts.filter((post) => post.category === activeCategory);

  return (
    <section className="writing-page">
      <div className="writing-page-inner">
        {/* INTRO */}

        <header className="writing-intro">
          <span className="eyebrow">THE ARCHIVE</span>

          <h1>Writing.</h1>

          <p>
            Thoughts, poems, stories and little pieces of life — gathered here
            in one place.
          </p>
        </header>

        {/* FILTERS */}

        <nav className="writing-filters" aria-label="Writing categories">
          {categories.map((item) => (
            <Link
              key={item.value}
              href={item.href}
              className={activeCategory === item.value ? "active" : ""}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* POSTS */}

        {filteredPosts.length === 0 ? (
          <div className="writing-empty">
            <span>✦</span>

            <h2>Nothing here yet.</h2>

            <p>
              No{" "}
              {activeCategory === "all"
                ? "writing"
                : formatCategory(activeCategory).toLowerCase()}{" "}
              has been published yet.
            </p>
          </div>
        ) : (
          <div className="writing-list">
            {filteredPosts.map((post, index) => (
              <article key={post.id} className="writing-item">
                <div className="writing-item-number">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="writing-item-body">
                  <div className="writing-item-meta">
                    <span>{formatCategory(post.category)}</span>

                    <span>{formatDate(post.published_at)}</span>
                  </div>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="writing-item-title"
                  >
                    <h2>{post.title}</h2>
                  </Link>

                  {post.excerpt && (
                    <p className="writing-item-excerpt">{post.excerpt}</p>
                  )}

                  <Link
                    href={`/blog/${post.slug}`}
                    className="writing-item-read"
                  >
                    Read piece
                    <ArrowUpRight size={14} strokeWidth={1.3} />
                  </Link>
                </div>

                {post.cover_image && (
                  <Link
                    href={`/blog/${post.slug}`}
                    className="writing-item-image"
                  >
                    <img src={post.cover_image} alt="" loading="lazy" />
                  </Link>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
