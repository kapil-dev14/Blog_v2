"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

import { Loader2, Send } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type CommentsProps = {
  postId: string;
};

type Comment = {
  id: string;
  post_id: string;
  name: string;
  comment: string;
  created_at: string;
};

function formatCommentDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default function Comments({ postId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);

  const [name, setName] = useState("");

  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const loadComments = useCallback(async () => {
    const supabase = createClient();

    const { data, error: loadError } = await supabase
      .from("post_comments")
      .select("id, post_id, name, comment, created_at")
      .eq("post_id", postId)
      .order("created_at", {
        ascending: true,
      });

    if (loadError) {
      console.error("Could not load comments:", loadError);

      setError("Comments could not be loaded.");
    } else {
      setComments(data ?? []);
    }

    setLoading(false);
  }, [postId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    const cleanName = name.trim();

    const cleanComment = comment.trim();

    if (!cleanName) {
      setError("Please leave your name.");

      return;
    }

    if (!cleanComment) {
      setError("Write something before posting.");

      return;
    }

    if (cleanName.length > 50) {
      setError("Name must be 50 characters or less.");

      return;
    }

    if (cleanComment.length > 1000) {
      setError("Comment must be 1000 characters or less.");

      return;
    }

    setSubmitting(true);

    const supabase = createClient();

    const { data, error: insertError } = await supabase
      .from("post_comments")
      .insert({
        post_id: postId,
        name: cleanName,
        comment: cleanComment,
      })
      .select("id, post_id, name, comment, created_at")
      .single();

    if (insertError) {
      console.error("Could not post comment:", insertError);

      setError("Your comment could not be posted. Please try again.");

      setSubmitting(false);

      return;
    }

    setComments((current) => [...current, data]);

    setComment("");

    setSubmitting(false);
  }

  return (
    <section className="comments-section comments-compact" id="comments">
      {/* HEADER */}

      <div className="comments-compact-heading">
        <div>
          <span>CONVERSATION</span>

          <h2>
            Comments
            <em>{String(comments.length).padStart(2, "0")}</em>
          </h2>
        </div>

        <p>Leave something behind.</p>
      </div>

      {/* EXISTING COMMENTS */}

      <div className="comments-compact-list">
        {loading ? (
          <div className="comments-compact-status">
            <Loader2 size={14} className="spin" />
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="comments-compact-empty">
            <span>✦</span>

            <p>No comments yet. Perhaps yours will be the first.</p>
          </div>
        ) : (
          comments.map((item, index) => (
            <article key={item.id} className="comment-compact-item">
              <span className="comment-compact-number">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className="comment-compact-content">
                <header>
                  <strong>{item.name}</strong>

                  <time>{formatCommentDate(item.created_at)}</time>
                </header>

                <p>{item.comment}</p>
              </div>
            </article>
          ))
        )}
      </div>

      {/* FORM */}

      <form className="comment-compact-form" onSubmit={handleSubmit}>
        <div className="comment-compact-name">
          <label htmlFor="comment-name">Your name</label>

          <input
            id="comment-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Name"
            maxLength={50}
            autoComplete="name"
          />
        </div>

        <div className="comment-compact-message">
          <label htmlFor="comment-body">Leave a thought</label>

          <textarea
            id="comment-body"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="A few words are enough..."
            maxLength={1000}
            rows={3}
          />

          <span>
            {comment.length}
            /1000
          </span>
        </div>

        {error && (
          <p className="comment-compact-error" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="comment-compact-submit"
        >
          {submitting ? (
            <>
              <Loader2 size={13} className="spin" />
              Posting
            </>
          ) : (
            <>
              Post comment
              <Send size={12} />
            </>
          )}
        </button>
      </form>
    </section>
  );
}
