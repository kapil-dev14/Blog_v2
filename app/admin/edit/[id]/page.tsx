import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getPostById } from "@/lib/posts";
import PostEditor from "@/components/admin/PostEditor";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  return (
    <main className="post-editor-page">
      <PostEditor post={post} />
    </main>
  );
}
