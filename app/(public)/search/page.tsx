import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

import { searchPublishedPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Search",
  description: "Search through Her Journal.",
};

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

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
  if (category === "story") return "Story";
  if (category === "journal") return "Journal";

  return "Thoughts";
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;

  const query = q.trim();

  const results = query ? await searchPublishedPosts(query) : [];

  return (
    <section className="search-page">
      <div className="search-page-inner">
        {/* INTRO */}

        <header className="search-intro">
          <span className="eyebrow">FIND SOMETHING</span>

          <h1>
            Search<span>.</span>
          </h1>

          <p>A word, a feeling, a title — perhaps it&apos;s somewhere here.</p>
        </header>

        {/* SEARCH FORM */}

        <form action="/search" method="get" className="journal-search-form">
          <Search size={20} strokeWidth={1.2} />

          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search the journal..."
            aria-label="Search the journal"
            autoFocus
          />

          <button type="submit">
            Search
            <ArrowRight size={14} strokeWidth={1.3} />
          </button>
        </form>

        {/* BEFORE SEARCH */}

        {!query && (
          <div className="search-message">
            <span>✦</span>

            <p>Type something above and see where the words take you.</p>
          </div>
        )}

        {/* SEARCHED */}

        {query && (
          <div className="search-results">
            <div className="search-results-heading">
              <span>RESULTS FOR &ldquo;{query}&rdquo;</span>

              <span>{String(results.length).padStart(2, "0")}</span>
            </div>

            {results.length === 0 ? (
              <div className="search-empty">
                <span>✦</span>

                <h2>Nothing found.</h2>

                <p>
                  No writing seems to contain &ldquo;{query}&rdquo;. Try another
                  word or phrase.
                </p>
              </div>
            ) : (
              <div className="search-results-list">
                {results.map((post, index) => (
                  <article key={post.id} className="search-result">
                    <div className="search-result-number">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="search-result-content">
                      <div className="search-result-meta">
                        <span>{formatCategory(post.category)}</span>

                        <span>•</span>

                        <span>{formatDate(post.published_at)}</span>
                      </div>

                      <Link
                        href={`/blog/${post.slug}`}
                        className="search-result-title"
                      >
                        <h2>{post.title}</h2>
                      </Link>

                      {post.excerpt && <p>{post.excerpt}</p>}

                      <Link
                        href={`/blog/${post.slug}`}
                        className="search-result-read"
                      >
                        Read piece
                        <ArrowRight size={13} strokeWidth={1.3} />
                      </Link>
                    </div>

                    {post.cover_image && (
                      <Link
                        href={`/blog/${post.slug}`}
                        className="search-result-image"
                      >
                        <img src={post.cover_image} alt="" loading="lazy" />
                      </Link>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
