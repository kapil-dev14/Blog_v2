import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import PostEditor from "@/components/admin/PostEditor";

export default async function NewPostPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <main className="post-editor-page">
      <PostEditor />
    </main>
  );
}
