import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { getPublishedPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Poems",
  description:
    "Poems about feelings, memories, people and the things that stay.",
};

function formatDate(date: string | null) {
  if (!date) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default async function PoemsPage() {
  const posts = await getPublishedPosts();

  const poems = posts.filter((post) => post.category === "poem");

  return (
    <section className="poems-page">
      <div className="poems-page-inner">
        {/* INTRO */}

        <header className="poems-intro">
          <span className="eyebrow">WORDS IN VERSE</span>

          <h1>
            Poems<span>.</span>
          </h1>

          <p>
            For the feelings that asked
            <br />
            to become words.
          </p>
        </header>

        {/* SMALL DIVIDER */}

        <div className="poems-divider">
          <span>✦</span>
        </div>

        {/* POEMS */}

        {poems.length === 0 ? (
          <div className="poems-empty">
            <span>✦</span>

            <h2>No poems yet.</h2>

            <p>Perhaps some feelings are still looking for their words.</p>
          </div>
        ) : (
          <div className="poems-list">
            {poems.map((poem, index) => (
              <article
                key={poem.id}
                className={`poem-entry ${
                  poem.cover_image ? "poem-entry-with-image" : ""
                }`}
              >
                <div className="poem-entry-number">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="poem-entry-content">
                  <span className="poem-entry-date">
                    {formatDate(poem.published_at)}
                  </span>

                  <Link
                    href={`/blog/${poem.slug}`}
                    className="poem-entry-title"
                  >
                    <h2>{poem.title}</h2>
                  </Link>

                  {poem.excerpt && (
                    <p className="poem-entry-excerpt">{poem.excerpt}</p>
                  )}

                  <Link href={`/blog/${poem.slug}`} className="poem-entry-read">
                    Read poem
                    <ArrowUpRight size={14} strokeWidth={1.3} />
                  </Link>
                </div>

                {poem.cover_image && (
                  <Link
                    href={`/blog/${poem.slug}`}
                    className="poem-entry-image"
                  >
                    <img src={poem.cover_image} alt="" loading="lazy" />
                  </Link>
                )}
              </article>
            ))}
          </div>
        )}

        {/* END NOTE */}

        {poems.length > 0 && (
          <div className="poems-ending">
            <span>✦</span>

            <p>
              Some things sound better
              <br />
              when they are not explained.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
