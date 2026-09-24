"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Loader2 } from "lucide-react";
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

  // --------------------------------------------------
  // FORM STATE
  // If editing, use existing post values.
  // If creating, start with empty values.
  // --------------------------------------------------

  const [title, setTitle] = useState(post?.title ?? "");

  const [slug, setSlug] = useState(post?.slug ?? "");

  const [slugEdited, setSlugEdited] = useState(Boolean(post));

  const [category, setCategory] = useState(post?.category ?? "thoughts");

  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");

  const [content, setContent] = useState(post?.content_html ?? "");

  const [featured, setFeatured] = useState(post?.featured ?? false);

  const [coverFile, setCoverFile] = useState<File | null>(null);

  // Existing image will appear while editing.
  const [coverPreview, setCoverPreview] = useState(post?.cover_image ?? "");

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  // --------------------------------------------------
  // TITLE
  // --------------------------------------------------

  function handleTitleChange(event: ChangeEvent<HTMLInputElement>) {
    const newTitle = event.target.value;

    setTitle(newTitle);

    // Automatically generate slug for new posts.
    // Once user manually edits slug, stop overwriting it.
    if (!slugEdited) {
      setSlug(createSlug(newTitle));
    }
  }

  // --------------------------------------------------
  // SLUG
  // --------------------------------------------------

  function handleSlugChange(event: ChangeEvent<HTMLInputElement>) {
    setSlugEdited(true);

    setSlug(createSlug(event.target.value));
  }

  // --------------------------------------------------
  // COVER IMAGE
  // --------------------------------------------------

  function handleCoverChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setCoverFile(file);

    const preview = URL.createObjectURL(file);

    setCoverPreview(preview);
  }

  async function uploadCoverImage() {
    // Editing a post without selecting another image:
    // keep the old image.
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

  // --------------------------------------------------
  // SAVE / UPDATE POST
  // --------------------------------------------------

  async function savePost(publish: boolean) {
    setError("");

    if (!title.trim()) {
      setError("Give this piece a title first.");
      return;
    }

    if (!slug.trim()) {
      setError("The post needs a slug.");
      return;
    }

    if (!content.trim() || content === "<p></p>") {
      setError("Write something before saving.");
      return;
    }

    setSaving(true);

    try {
      const coverImage = await uploadCoverImage();

      const postData = {
        title: title.trim(),
        slug: slug.trim(),

        excerpt: excerpt.trim() || null,

        content_html: content,

        category,

        cover_image: coverImage,

        featured,

        published: publish,

        // If already published, preserve the original
        // published date when updating it.
        published_at: publish
          ? (post?.published_at ?? new Date().toISOString())
          : null,
      };

      // ------------------------------------------------
      // EDIT EXISTING POST
      // ------------------------------------------------

      if (post) {
        const { error: updateError } = await supabase
          .from("posts")
          .update(postData)
          .eq("id", post.id);

        if (updateError) {
          throw new Error(updateError.message);
        }
      }

      // ------------------------------------------------
      // CREATE NEW POST
      // ------------------------------------------------
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

  // Save Draft button submits the form.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    savePost(false);
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <form className="post-editor" onSubmit={handleSubmit}>
      {/* HEADER */}

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

      {/* INTRO */}

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

      {/* ERROR */}

      {error && <div className="post-editor-error">{error}</div>}

      {/* TITLE */}

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

      {/* SLUG */}

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

      {/* CATEGORY + COVER IMAGE */}

      <div className="post-editor-grid">
        <div className="post-editor-field">
          <label htmlFor="category">Category</label>

          <select
            id="category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
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

      {/* IMAGE PREVIEW */}

      {coverPreview && (
        <div className="cover-preview">
          <img
            src={coverPreview}
            alt={title ? `${title} cover preview` : "Cover preview"}
          />
        </div>
      )}

      {/* EXCERPT */}

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

      {/* WRITING */}

      <div className="post-editor-field">
        <label>Writing</label>

        <RichTextEditor value={content} onChange={setContent} />
      </div>

      {/* FEATURED */}

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
