"use client";

import { useEffect, useState } from "react";

import { Heart } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type LikeButtonProps = {
  postId: string;
};

const VISITOR_KEY = "her-journal-visitor-id";

function getVisitorId() {
  let visitorId = localStorage.getItem(VISITOR_KEY);

  if (!visitorId) {
    visitorId = crypto.randomUUID();

    localStorage.setItem(VISITOR_KEY, visitorId);
  }

  return visitorId;
}

export default function LikeButton({ postId }: LikeButtonProps) {
  const [likes, setLikes] = useState(0);

  const [liked, setLiked] = useState(false);

  const [loading, setLoading] = useState(true);

  const [changing, setChanging] = useState(false);

  useEffect(() => {
    async function loadLikes() {
      const supabase = createClient();

      const visitorId = getVisitorId();

      const [countResult, visitorResult] = await Promise.all([
        supabase
          .from("post_likes")
          .select("*", {
            count: "exact",
            head: true,
          })
          .eq("post_id", postId),

        supabase
          .from("post_likes")
          .select("id")
          .eq("post_id", postId)
          .eq("visitor_id", visitorId)
          .maybeSingle(),
      ]);

      if (countResult.error) {
        console.error("Could not load likes:", countResult.error);
      }

      if (visitorResult.error) {
        console.error("Could not check visitor like:", visitorResult.error);
      }

      setLikes(countResult.count ?? 0);

      setLiked(Boolean(visitorResult.data));

      setLoading(false);
    }

    loadLikes();
  }, [postId]);

  async function toggleLike() {
    if (changing) return;

    setChanging(true);

    const supabase = createClient();

    const visitorId = getVisitorId();

    try {
      if (liked) {
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("visitor_id", visitorId);

        if (error) {
          throw error;
        }

        setLiked(false);

        setLikes((current) => Math.max(0, current - 1));
      } else {
        const { error } = await supabase.from("post_likes").insert({
          post_id: postId,
          visitor_id: visitorId,
        });

        if (error) {
          throw error;
        }

        setLiked(true);

        setLikes((current) => current + 1);
      }
    } catch (error) {
      console.error("Could not update like:", error);
    } finally {
      setChanging(false);
    }
  }

  return (
    <div className="article-like">
      <button
        type="button"
        onClick={toggleLike}
        disabled={loading || changing}
        className={liked ? "liked" : ""}
        aria-pressed={liked}
        aria-label={liked ? "Unlike this piece" : "Like this piece"}
      >
        <Heart
          size={19}
          strokeWidth={1.3}
          fill={liked ? "currentColor" : "none"}
        />

        <span>{loading ? "..." : likes}</span>
      </button>

      <p>{liked ? "You liked this piece." : "Leave a little love."}</p>
    </div>
  );
}
