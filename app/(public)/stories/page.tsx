import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen } from "lucide-react";

import { getPublishedStories } from "@/lib/posts";
import type { Post } from "@/types/post";

export const metadata: Metadata = {
  title: "Stories",
  description:
    "Stories about people, places, memories and the moments between them.",
};

/* ========================================
   TYPES
======================================== */

type StorySeries = {
  type: "series";

  key: string;

  title: string;

  chapters: Post[];

  firstChapter: Post;

  latestChapter: Post;

  coverImage: string | null;

  excerpt: string | null;
};

type StandaloneStory = {
  type: "standalone";

  key: string;

  post: Post;
};

type StoryCollectionItem = StorySeries | StandaloneStory;

/* ========================================
   DATE
======================================== */

function formatDate(date: string | null) {
  if (!date) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

/* ========================================
   GROUP STORIES
======================================== */

function buildStoryCollections(stories: Post[]): StoryCollectionItem[] {
  const seriesMap = new Map<string, Post[]>();

  const standaloneStories: Post[] = [];

  for (const story of stories) {
    /*
      A post only counts as a chapter when all
      important series fields exist.
    */

    if (story.series_slug && story.series_title && story.chapter_number) {
      const existing = seriesMap.get(story.series_slug) ?? [];

      existing.push(story);

      seriesMap.set(story.series_slug, existing);
    } else {
      standaloneStories.push(story);
    }
  }

  const seriesItems: StorySeries[] = Array.from(seriesMap.entries()).map(
    ([seriesSlug, chapters]) => {
      /*
          Chapter order:
          1 → 2 → 3 → 4...
        */

      const orderedChapters = [...chapters].sort(
        (a, b) => (a.chapter_number ?? 0) - (b.chapter_number ?? 0),
      );

      const firstChapter = orderedChapters[0];

      /*
          Latest chapter based on published date.
        */

      const latestChapter = [...orderedChapters].sort((a, b) => {
        const aDate = a.published_at ? new Date(a.published_at).getTime() : 0;

        const bDate = b.published_at ? new Date(b.published_at).getTime() : 0;

        return bDate - aDate;
      })[0];

      /*
          Prefer Chapter 1's cover/excerpt.
          If unavailable, find another chapter
          containing one.
        */

      const coverImage =
        firstChapter.cover_image ??
        orderedChapters.find((chapter) => chapter.cover_image)?.cover_image ??
        null;

      const excerpt =
        firstChapter.excerpt ??
        orderedChapters.find((chapter) => chapter.excerpt)?.excerpt ??
        null;

      return {
        type: "series",
        key: `series-${seriesSlug}`,
        title: firstChapter.series_title ?? "Untitled Story",
        chapters: orderedChapters,
        firstChapter,
        latestChapter,
        coverImage,
        excerpt,
      };
    },
  );

  const standaloneItems: StandaloneStory[] = standaloneStories.map((post) => ({
    type: "standalone",
    key: `story-${post.id}`,
    post,
  }));

  /*
    Put series + standalone stories together.

    Then sort by most recent activity.
  */

  const collections: StoryCollectionItem[] = [
    ...seriesItems,
    ...standaloneItems,
  ];

  return collections.sort((a, b) => {
    const aDate =
      a.type === "series" ? a.latestChapter.published_at : a.post.published_at;

    const bDate =
      b.type === "series" ? b.latestChapter.published_at : b.post.published_at;

    const aTime = aDate ? new Date(aDate).getTime() : 0;

    const bTime = bDate ? new Date(bDate).getTime() : 0;

    return bTime - aTime;
  });
}

/* ========================================
   PAGE
======================================== */

export default async function StoriesPage() {
  const stories = await getPublishedStories();

  const collections = buildStoryCollections(stories);

  return (
    <section className="stories-page">
      <div className="stories-page-inner">
        {/* ====================================
            INTRO
        ==================================== */}

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

        {/* ====================================
            EMPTY
        ==================================== */}

        {collections.length === 0 ? (
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
          <div className="story-library">
            {collections.map((collection, index) => {
              /* ============================
                   CONNECTED STORY
                ============================ */

              if (collection.type === "series") {
                const {
                  title,
                  chapters,
                  firstChapter,
                  latestChapter,
                  coverImage,
                  excerpt,
                } = collection;

                return (
                  <article key={collection.key} className="story-series-card">
                    {/* IMAGE */}

                    <Link
                      href={`/blog/${firstChapter.slug}`}
                      className="story-series-cover"
                    >
                      {coverImage ? (
                        <img src={coverImage} alt="" />
                      ) : (
                        <div className="story-series-placeholder">
                          <BookOpen size={26} strokeWidth={1} />

                          <span>✦</span>
                        </div>
                      )}

                      <span className="story-series-index">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </Link>

                    {/* CONTENT */}

                    <div className="story-series-content">
                      <div className="story-series-meta">
                        <span>SERIAL STORY</span>

                        <span>
                          {chapters.length}{" "}
                          {chapters.length === 1 ? "chapter" : "chapters"}
                        </span>
                      </div>

                      <Link
                        href={`/blog/${firstChapter.slug}`}
                        className="story-series-title"
                      >
                        <h2>{title}</h2>
                      </Link>

                      {excerpt && (
                        <p className="story-series-excerpt">{excerpt}</p>
                      )}

                      {/* CHAPTER LIST */}

                      <div className="story-chapter-preview">
                        {chapters.slice(0, 4).map((chapter) => (
                          <Link
                            key={chapter.id}
                            href={`/blog/${chapter.slug}`}
                            className="story-chapter-preview-item"
                          >
                            <span>
                              {String(chapter.chapter_number).padStart(2, "0")}
                            </span>

                            <strong>{chapter.title}</strong>

                            <ArrowUpRight size={14} strokeWidth={1.2} />
                          </Link>
                        ))}

                        {chapters.length > 4 && (
                          <div className="story-more-chapters">
                            +{chapters.length - 4} more{" "}
                            {chapters.length - 4 === 1 ? "chapter" : "chapters"}
                          </div>
                        )}
                      </div>

                      {/* FOOTER */}

                      <div className="story-series-footer">
                        <span>
                          Updated {formatDate(latestChapter.published_at)}
                        </span>

                        <Link href={`/blog/${firstChapter.slug}`}>
                          Begin reading
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              }

              /* ============================
                   STANDALONE STORY
                ============================ */

              const story = collection.post;

              return (
                <article key={collection.key} className="standalone-story-card">
                  <div className="standalone-story-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  {story.cover_image ? (
                    <Link
                      href={`/blog/${story.slug}`}
                      className="standalone-story-image"
                    >
                      <img src={story.cover_image} alt="" />
                    </Link>
                  ) : (
                    <div className="standalone-story-symbol">✦</div>
                  )}

                  <div className="standalone-story-content">
                    <div className="standalone-story-meta">
                      <span>SHORT STORY</span>

                      <span>{formatDate(story.published_at)}</span>
                    </div>

                    <Link href={`/blog/${story.slug}`}>
                      <h2>{story.title}</h2>
                    </Link>

                    {story.excerpt && <p>{story.excerpt}</p>}

                    <Link
                      href={`/blog/${story.slug}`}
                      className="standalone-story-read"
                    >
                      Read story
                      <ArrowUpRight size={14} strokeWidth={1.2} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* ====================================
            END
        ==================================== */}

        {collections.length > 0 && (
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
