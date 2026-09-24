import Link from "next/link";
import { redirect } from "next/navigation";

import { ArrowUpRight, FileText, Plus, Star } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getAllPosts } from "@/lib/posts";

import LogoutButton from "@/components/admin/LogoutButton";
import PostActions from "@/components/admin/PostActions";

function formatDate(date: string | null) {
  if (!date) return "Not published";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const posts = await getAllPosts();

  const publishedCount = posts.filter((post) => post.published).length;

  const draftCount = posts.filter((post) => !post.published).length;

  return (
    <section className="admin-dashboard">
      <div className="admin-dashboard-inner">
        {/* HEADER */}

        <header className="admin-dashboard-header">
          <div>
            <span className="admin-kicker">THE JOURNAL</span>

            <h1>
              Writing
              <br />
              room.
            </h1>
          </div>

          <div className="admin-header-actions">
            <Link href="/" className="admin-view-site">
              View journal
              <ArrowUpRight size={14} strokeWidth={1.5} />
            </Link>

            <LogoutButton />
          </div>
        </header>

        {/* OVERVIEW */}

        <div className="admin-overview">
          <div className="admin-stat">
            <span>All writing</span>
            <strong>{posts.length}</strong>
          </div>

          <div className="admin-stat">
            <span>Published</span>
            <strong>{publishedCount}</strong>
          </div>

          <div className="admin-stat">
            <span>Drafts</span>
            <strong>{draftCount}</strong>
          </div>
        </div>

        {/* HEADING */}

        <div className="admin-posts-heading">
          <div>
            <span>01</span>
            <h2>Your writing</h2>
          </div>

          <Link href="/admin/new" className="admin-new-post">
            <Plus size={14} />
            New post
          </Link>
        </div>

        {/* POSTS */}

        {posts.length === 0 ? (
          <div className="admin-empty">
            <FileText size={25} strokeWidth={1.2} />

            <h3>Nothing written yet.</h3>

            <p>The first page is waiting.</p>

            <Link href="/admin/new">Begin writing →</Link>
          </div>
        ) : (
          <div className="admin-post-list">
            {posts.map((post, index) => (
              <article key={post.id} className="admin-post-row">
                {/* NUMBER */}

                <span className="admin-post-number">
                  {String(index + 1).padStart(2, "0")}
                </span>

                {/* POST INFO */}

                <div className="admin-post-main">
                  <div className="admin-post-meta">
                    <span>{post.category}</span>

                    <span>•</span>

                    <span>{formatDate(post.published_at)}</span>

                    {post.featured && (
                      <>
                        <span>•</span>

                        <span className="admin-featured-label">
                          <Star size={10} />
                          Featured
                        </span>
                      </>
                    )}
                  </div>

                  <h3>{post.title}</h3>
                </div>

                {/* STATUS */}

                <span
                  className={
                    post.published
                      ? "admin-status published"
                      : "admin-status draft"
                  }
                >
                  {post.published ? "Published" : "Draft"}
                </span>

                {/* EDIT */}

                <Link
                  href={`/admin/edit/${post.id}`}
                  className="admin-edit-link"
                >
                  Edit
                  <ArrowUpRight size={14} strokeWidth={1.5} />
                </Link>

                {/* MANAGEMENT */}

                <PostActions
                  id={post.id}
                  title={post.title}
                  slug={post.slug}
                  published={post.published}
                  featured={post.featured}
                />
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
