"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Star, StarOff, Trash2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type PostActionsProps = {
  id: string;
  title: string;
  published: boolean;
  featured: boolean;
  slug: string;
};

export default function PostActions({
  id,
  title,
  published,
  featured,
  slug,
}: PostActionsProps) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function togglePublished() {
    setLoading("published");
    setError("");

    const newPublishedState = !published;

    const { error } = await supabase
      .from("posts")
      .update({
        published: newPublishedState,

        // Give a draft its publication date when publishing.
        // Remove it again when moved back to draft.
        published_at: newPublishedState ? new Date().toISOString() : null,

        // A draft should not remain featured.
        featured: newPublishedState ? featured : false,
      })
      .eq("id", id);

    if (error) {
      setError(error.message);
      setLoading(null);
      return;
    }

    router.refresh();
    setLoading(null);
  }

  async function toggleFeatured() {
    setLoading("featured");
    setError("");

    // Don't feature drafts.
    if (!published) {
      setError("Publish this piece before featuring it.");
      setLoading(null);
      return;
    }

    // Turning featured OFF is simple.
    if (featured) {
      const { error } = await supabase
        .from("posts")
        .update({
          featured: false,
        })
        .eq("id", id);

      if (error) {
        setError(error.message);
        setLoading(null);
        return;
      }

      router.refresh();
      setLoading(null);
      return;
    }

    // Only ONE post should be featured.
    // First remove featured status from other posts.
    const { error: clearError } = await supabase
      .from("posts")
      .update({
        featured: false,
      })
      .neq("id", id);

    if (clearError) {
      setError(clearError.message);
      setLoading(null);
      return;
    }

    // Now feature this one.
    const { error: featureError } = await supabase
      .from("posts")
      .update({
        featured: true,
      })
      .eq("id", id);

    if (featureError) {
      setError(featureError.message);
      setLoading(null);
      return;
    }

    router.refresh();
    setLoading(null);
  }

  async function deletePost() {
    const confirmed = window.confirm(
      `Delete "${title}"?\n\nThis cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setLoading("delete");
    setError("");

    const { error } = await supabase.from("posts").delete().eq("id", id);

    if (error) {
      setError(error.message);
      setLoading(null);
      return;
    }

    router.refresh();
    setLoading(null);
  }

  return (
    <div className="admin-post-actions">
      {published && (
        <a
          href={`/blog/${slug}`}
          target="_blank"
          rel="noreferrer"
          className="admin-action-button"
          title="View post"
        >
          <Eye size={14} />
          <span>View</span>
        </a>
      )}

      <button
        type="button"
        className="admin-action-button"
        onClick={togglePublished}
        disabled={loading !== null}
        title={published ? "Move to draft" : "Publish"}
      >
        {loading === "published" ? (
          <Loader2 size={14} className="spin" />
        ) : published ? (
          <EyeOff size={14} />
        ) : (
          <Eye size={14} />
        )}

        <span>{published ? "Unpublish" : "Publish"}</span>
      </button>

      <button
        type="button"
        className={`admin-action-button ${featured ? "is-featured" : ""}`}
        onClick={toggleFeatured}
        disabled={loading !== null}
        title={featured ? "Remove from featured" : "Make featured"}
      >
        {loading === "featured" ? (
          <Loader2 size={14} className="spin" />
        ) : featured ? (
          <StarOff size={14} />
        ) : (
          <Star size={14} />
        )}

        <span>{featured ? "Unfeature" : "Feature"}</span>
      </button>

      <button
        type="button"
        className="admin-action-button delete"
        onClick={deletePost}
        disabled={loading !== null}
        title="Delete post"
      >
        {loading === "delete" ? (
          <Loader2 size={14} className="spin" />
        ) : (
          <Trash2 size={14} />
        )}

        <span>Delete</span>
      </button>

      {error && <p className="admin-action-error">{error}</p>}
    </div>
  );
}
