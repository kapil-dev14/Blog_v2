import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { getPublishedPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Stories",
  description:
    "Stories about people, places, memories and the moments between them.",
};

function formatDate(date: string | null) {
  if (!date) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default async function StoriesPage() {
  const posts = await getPublishedPosts();

  const stories = posts.filter((post) => post.category === "story");

  const [firstStory, ...otherStories] = stories;

  return (
    <section className="stories-page">
      <div className="stories-page-inner">
        {/* INTRO */}

        <header className="stories-intro">
          <div>
            <span className="eyebrow">STORIES & FICTION</span>

            <h1>
              Stories<span>.</span>
            </h1>
          </div>

          <p>
            People imagined.
            <br />
            Places remembered.
            <br />
            Moments made into stories.
          </p>
        </header>

        {/* EMPTY STATE */}

        {stories.length === 0 ? (
          <div className="stories-empty">
            <span>✦</span>

            <h2>No stories yet.</h2>

            <p>
              Every story begins somewhere.
              <br />
              This page is still waiting for its first.
            </p>
          </div>
        ) : (
          <>
            {/* FIRST / LEAD STORY */}

            {firstStory && (
              <article className="story-lead">
                {firstStory.cover_image ? (
                  <Link
                    href={`/blog/${firstStory.slug}`}
                    className="story-lead-image"
                  >
                    <img src={firstStory.cover_image} alt="" />
                  </Link>
                ) : (
                  <div className="story-lead-placeholder">
                    <span>✦</span>
                  </div>
                )}

                <div className="story-lead-content">
                  <div className="story-lead-meta">
                    <span>01</span>

                    <span>{formatDate(firstStory.published_at)}</span>
                  </div>

                  <Link
                    href={`/blog/${firstStory.slug}`}
                    className="story-lead-title"
                  >
                    <h2>{firstStory.title}</h2>
                  </Link>

                  {firstStory.excerpt && <p>{firstStory.excerpt}</p>}

                  <Link
                    href={`/blog/${firstStory.slug}`}
                    className="story-read-link"
                  >
                    Read the story
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </article>
            )}

            {/* OTHER STORIES */}

            {otherStories.length > 0 && (
              <div className="stories-collection">
                <div className="stories-collection-heading">
                  <span>MORE STORIES</span>

                  <span>{String(otherStories.length).padStart(2, "0")}</span>
                </div>

                {otherStories.map((story, index) => (
                  <article key={story.id} className="story-row">
                    <span className="story-row-number">
                      {String(index + 2).padStart(2, "0")}
                    </span>

                    {story.cover_image && (
                      <Link
                        href={`/blog/${story.slug}`}
                        className="story-row-image"
                      >
                        <img src={story.cover_image} alt="" loading="lazy" />
                      </Link>
                    )}

                    <div className="story-row-content">
                      <span className="story-row-date">
                        {formatDate(story.published_at)}
                      </span>

                      <Link href={`/blog/${story.slug}`}>
                        <h2>{story.title}</h2>
                      </Link>

                      {story.excerpt && <p>{story.excerpt}</p>}
                    </div>

                    <Link
                      href={`/blog/${story.slug}`}
                      className="story-row-arrow"
                      aria-label={`Read ${story.title}`}
                    >
                      <ArrowUpRight size={17} strokeWidth={1.2} />
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        {/* CLOSING */}

        {stories.length > 0 && (
          <div className="stories-closing">
            <span>✦</span>

            <p>
              Every story leaves something
              <br />
              behind.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
