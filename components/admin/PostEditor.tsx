"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, ImagePlus, Loader2 } from "lucide-react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/client";
import type { Post } from "@/types/post";

import RichTextEditor from "./RichTextEditor";

type PostEditorProps = {
  post?: Post;
};

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function PostEditor({ post }: PostEditorProps) {
  const router = useRouter();
  const supabase = createClient();

  // ==================================================
  // BASIC POST STATE
  // ==================================================

  const [title, setTitle] = useState(post?.title ?? "");

  const [slug, setSlug] = useState(post?.slug ?? "");

  const [slugEdited, setSlugEdited] = useState(Boolean(post));

  const [category, setCategory] = useState(post?.category ?? "thoughts");

  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");

  const [content, setContent] = useState(post?.content_html ?? "");

  const [featured, setFeatured] = useState(post?.featured ?? false);

  // ==================================================
  // STORY / CHAPTER STATE
  // ==================================================

  const [seriesTitle, setSeriesTitle] = useState(post?.series_title ?? "");

  const [seriesSlug, setSeriesSlug] = useState(post?.series_slug ?? "");

  const [seriesSlugEdited, setSeriesSlugEdited] = useState(
    Boolean(post?.series_slug),
  );

  const [chapterNumber, setChapterNumber] = useState(
    post?.chapter_number ? String(post.chapter_number) : "",
  );

  // ==================================================
  // COVER IMAGE
  // ==================================================

  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [coverPreview, setCoverPreview] = useState(post?.cover_image ?? "");

  // ==================================================
  // STATUS
  // ==================================================

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  // ==================================================
  // TITLE
  // ==================================================

  function handleTitleChange(event: ChangeEvent<HTMLInputElement>) {
    const newTitle = event.target.value;

    setTitle(newTitle);

    if (!slugEdited) {
      setSlug(createSlug(newTitle));
    }
  }

  // ==================================================
  // POST SLUG
  // ==================================================

  function handleSlugChange(event: ChangeEvent<HTMLInputElement>) {
    setSlugEdited(true);

    setSlug(createSlug(event.target.value));
  }

  // ==================================================
  // SERIES TITLE
  // ==================================================

  function handleSeriesTitleChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;

    setSeriesTitle(value);

    if (!seriesSlugEdited) {
      setSeriesSlug(createSlug(value));
    }
  }

  // ==================================================
  // SERIES SLUG
  // ==================================================

  function handleSeriesSlugChange(event: ChangeEvent<HTMLInputElement>) {
    setSeriesSlugEdited(true);

    setSeriesSlug(createSlug(event.target.value));
  }

  // ==================================================
  // CATEGORY
  // ==================================================

  function handleCategoryChange(event: ChangeEvent<HTMLSelectElement>) {
    const newCategory = event.target.value;

    setCategory(newCategory);

    /*
      We intentionally do NOT erase series data when
      switching away from Story.

      This means if you accidentally select Poetry and
      switch back to Story, your chapter information is
      still there.

      When saving a non-story post, those fields are
      stored as null.
    */
  }

  // ==================================================
  // COVER IMAGE
  // ==================================================

  function handleCoverChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setCoverFile(file);

    const preview = URL.createObjectURL(file);

    setCoverPreview(preview);
  }

  async function uploadCoverImage() {
    if (!coverFile) {
      return post?.cover_image ?? null;
    }

    const extension = coverFile.name.split(".").pop() || "jpg";

    const fileName = `${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("blog-images")
      .upload(fileName, coverFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Image upload failed: ${uploadError.message}`);
    }

    const { data } = supabase.storage
      .from("blog-images")
      .getPublicUrl(fileName);

    if (!data.publicUrl) {
      throw new Error(
        "Image uploaded, but its public URL could not be created.",
      );
    }

    return data.publicUrl;
  }

  // ==================================================
  // VALIDATION
  // ==================================================

  function validatePost() {
    if (!title.trim()) {
      return "Give this piece a title first.";
    }

    if (!slug.trim()) {
      return "The post needs a slug.";
    }

    if (!content.trim() || content === "<p></p>") {
      return "Write something before saving.";
    }

    /*
      Story rules:

      A story CAN be standalone.

      But once any series/chapter information is entered,
      we require all three values.
    */

    if (category === "story") {
      const hasAnySeriesInformation =
        seriesTitle.trim() || seriesSlug.trim() || chapterNumber.trim();

      if (hasAnySeriesInformation) {
        if (!seriesTitle.trim()) {
          return "Give this story series a title.";
        }

        if (!seriesSlug.trim()) {
          return "The story series needs a slug.";
        }

        if (!chapterNumber.trim()) {
          return "Enter the chapter number.";
        }

        const chapter = Number(chapterNumber);

        if (!Number.isInteger(chapter) || chapter < 1) {
          return "Chapter number must be 1 or greater.";
        }
      }
    }

    return null;
  }

  // ==================================================
  // SAVE / UPDATE
  // ==================================================

  async function savePost(publish: boolean) {
    setError("");

    const validationError = validatePost();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

    try {
      const coverImage = await uploadCoverImage();

      const isStory = category === "story";

      const hasSeries =
        isStory &&
        Boolean(
          seriesTitle.trim() && seriesSlug.trim() && chapterNumber.trim(),
        );

      const postData = {
        title: title.trim(),

        slug: slug.trim(),

        excerpt: excerpt.trim() || null,

        content_html: content,

        category,

        cover_image: coverImage,

        featured,

        published: publish,

        // ------------------------------------------
        // STORY / CHAPTER INFORMATION
        // ------------------------------------------

        series_title: hasSeries ? seriesTitle.trim() : null,

        series_slug: hasSeries ? seriesSlug.trim() : null,

        chapter_number: hasSeries ? Number(chapterNumber) : null,

        // ------------------------------------------
        // PUBLISHING
        // ------------------------------------------

        published_at: publish
          ? (post?.published_at ?? new Date().toISOString())
          : null,
      };

      // =================================================
      // UPDATE
      // =================================================

      if (post) {
        const { error: updateError } = await supabase
          .from("posts")
          .update(postData)
          .eq("id", post.id);

        if (updateError) {
          throw new Error(updateError.message);
        }
      }

      // =================================================
      // CREATE
      // =================================================
      else {
        const { error: insertError } = await supabase
          .from("posts")
          .insert(postData);

        if (insertError) {
          throw new Error(insertError.message);
        }
      }

      router.push("/admin");

      router.refresh();
    } catch (err) {
      console.error(err);

      setError(err instanceof Error ? err.message : "Something went wrong.");

      setSaving(false);
    }
  }

  // ==================================================
  // FORM SUBMIT = SAVE DRAFT
  // ==================================================

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    savePost(false);
  }

  // ==================================================
  // UI
  // ==================================================

  return (
    <form className="post-editor" onSubmit={handleSubmit}>
      {/* ============================================
          HEADER
      ============================================ */}

      <header className="post-editor-header">
        <Link href="/admin" className="post-editor-back">
          <ArrowLeft size={14} />
          Writing room
        </Link>

        <div className="post-editor-actions">
          <button type="submit" disabled={saving} className="save-draft-button">
            {saving ? "Saving..." : "Save draft"}
          </button>

          <button
            type="button"
            disabled={saving}
            className="publish-button"
            onClick={() => savePost(true)}
          >
            {saving ? (
              <>
                <Loader2 size={14} className="spin" />
                Saving
              </>
            ) : post?.published ? (
              "Update"
            ) : (
              "Publish"
            )}
          </button>
        </div>
      </header>

      {/* ============================================
          INTRO
      ============================================ */}

      <div className="post-editor-intro">
        <span>{post ? "EDIT ENTRY" : "NEW ENTRY"}</span>

        <h1>
          {post ? (
            <>
              Refine what
              <br />
              you wrote.
            </>
          ) : (
            <>
              Write something
              <br />
              worth keeping.
            </>
          )}
        </h1>
      </div>

      {/* ============================================
          ERROR
      ============================================ */}

      {error && <div className="post-editor-error">{error}</div>}

      {/* ============================================
          TITLE
      ============================================ */}

      <div className="post-editor-field title-field">
        <label htmlFor="title">Title</label>

        <input
          id="title"
          value={title}
          onChange={handleTitleChange}
          placeholder="Untitled"
          autoFocus={!post}
        />
      </div>

      {/* ============================================
          SLUG
      ============================================ */}

      <div className="post-editor-field">
        <label htmlFor="slug">Slug</label>

        <div className="slug-input">
          <span>/blog/</span>

          <input
            id="slug"
            value={slug}
            onChange={handleSlugChange}
            placeholder="your-post"
          />
        </div>
      </div>

      {/* ============================================
          CATEGORY + COVER
      ============================================ */}

      <div className="post-editor-grid">
        <div className="post-editor-field">
          <label htmlFor="category">Category</label>

          <select
            id="category"
            value={category}
            onChange={handleCategoryChange}
          >
            <option value="thoughts">Thoughts</option>

            <option value="poem">Poetry</option>

            <option value="story">Story</option>

            <option value="journal">Journal</option>
          </select>
        </div>

        <div className="post-editor-field">
          <label>Cover image</label>

          <label className="cover-upload">
            <ImagePlus size={17} />

            {coverFile
              ? coverFile.name
              : post?.cover_image
                ? "Replace image"
                : "Choose an image"}

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleCoverChange}
              hidden
            />
          </label>
        </div>
      </div>

      {/* ============================================
          STORY / SERIES
      ============================================ */}

      {category === "story" && (
        <section className="story-series-editor">
          <div className="story-series-heading">
            <div className="story-series-icon">
              <BookOpen size={17} strokeWidth={1.4} />
            </div>

            <div>
              <span>STORY SERIES</span>

              <h2>Is this part of a larger story?</h2>

              <p>
                Leave these fields empty for a standalone story. Fill them in
                when this piece is one chapter of a series.
              </p>
            </div>
          </div>

          <div className="story-series-fields">
            {/* SERIES TITLE */}

            <div className="post-editor-field">
              <label htmlFor="series-title">Series title</label>

              <input
                id="series-title"
                value={seriesTitle}
                onChange={handleSeriesTitleChange}
                placeholder="e.g. The House Beyond the Hill"
              />

              <small className="editor-field-note">
                Use the same title for every chapter in this story.
              </small>
            </div>

            {/* SERIES SLUG */}

            <div className="post-editor-field">
              <label htmlFor="series-slug">Series slug</label>

              <div className="slug-input">
                <span>/stories/</span>

                <input
                  id="series-slug"
                  value={seriesSlug}
                  onChange={handleSeriesSlugChange}
                  placeholder="the-house-beyond-the-hill"
                />
              </div>

              <small className="editor-field-note">
                Chapters with the same series slug will be connected.
              </small>
            </div>

            {/* CHAPTER */}

            <div className="post-editor-field chapter-number-field">
              <label htmlFor="chapter-number">Chapter number</label>

              <input
                id="chapter-number"
                type="number"
                min="1"
                step="1"
                value={chapterNumber}
                onChange={(event) => setChapterNumber(event.target.value)}
                placeholder="1"
              />

              <small className="editor-field-note">
                Determines the reading order.
              </small>
            </div>
          </div>
        </section>
      )}

      {/* ============================================
          IMAGE PREVIEW
      ============================================ */}

      {coverPreview && (
        <div className="cover-preview">
          <img
            src={coverPreview}
            alt={title ? `${title} cover preview` : "Cover preview"}
          />
        </div>
      )}

      {/* ============================================
          EXCERPT
      ============================================ */}

      <div className="post-editor-field">
        <label htmlFor="excerpt">Excerpt</label>

        <textarea
          id="excerpt"
          value={excerpt}
          onChange={(event) => setExcerpt(event.target.value)}
          placeholder="A quiet introduction to this piece..."
          rows={3}
        />
      </div>

      {/* ============================================
          WRITING
      ============================================ */}

      <div className="post-editor-field">
        <label>Writing</label>

        <RichTextEditor value={content} onChange={setContent} />
      </div>

      {/* ============================================
          FEATURED
      ============================================ */}

      <label className="featured-checkbox">
        <input
          type="checkbox"
          checked={featured}
          onChange={(event) => setFeatured(event.target.checked)}
        />

        <span>
          <strong>Feature this piece</strong>

          <small>Show this writing prominently on the homepage.</small>
        </span>
      </label>
    </form>
  );
}
