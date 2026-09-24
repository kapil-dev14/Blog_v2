"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

import { Loader2, MessageCircle } from "lucide-react";

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
    <section className="comments-section" id="comments">
      <div className="comments-heading">
        <div>
          <span className="eyebrow">CONVERSATION</span>

          <h2>Comments.</h2>
        </div>

        <span className="comments-count">
          {String(comments.length).padStart(2, "0")}
        </span>
      </div>

      {/* FORM */}

      <form className="comment-form" onSubmit={handleSubmit}>
        <div className="comment-form-intro">
          <MessageCircle size={18} strokeWidth={1.2} />

          <div>
            <h3>Leave a thought.</h3>

            <p>A few words are enough.</p>
          </div>
        </div>

        <div className="comment-field">
          <label htmlFor="comment-name">Name</label>

          <input
            id="comment-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            maxLength={50}
            autoComplete="name"
          />
        </div>

        <div className="comment-field">
          <label htmlFor="comment-body">Comment</label>

          <textarea
            id="comment-body"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Write something..."
            maxLength={1000}
            rows={5}
          />

          <span className="comment-limit">{comment.length}/1000</span>
        </div>

        {error && (
          <p className="comment-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="comment-submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 size={14} className="spin" />
              Posting...
            </>
          ) : (
            "Post comment"
          )}
        </button>
      </form>

      {/* COMMENTS */}

      <div className="comments-list">
        {loading ? (
          <div className="comments-loading">
            <Loader2 size={17} className="spin" />

            <span>Loading comments...</span>
          </div>
        ) : comments.length === 0 ? (
          <div className="comments-empty">
            <span>✦</span>

            <p>No comments yet. Perhaps yours will be the first.</p>
          </div>
        ) : (
          comments.map((item, index) => (
            <article key={item.id} className="comment-item">
              <div className="comment-number">
                {String(index + 1).padStart(2, "0")}
              </div>

              <div className="comment-body">
                <div className="comment-meta">
                  <strong>{item.name}</strong>

                  <span>{formatCommentDate(item.created_at)}</span>
                </div>

                <p>{item.comment}</p>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
