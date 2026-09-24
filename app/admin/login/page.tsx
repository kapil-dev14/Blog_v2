import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import LoginForm from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  return (
    <section className="admin-login-page">
      <div className="admin-login-panel">
        <Link href="/" className="admin-login-back">
          <ArrowLeft size={14} />
          Back to journal
        </Link>

        <div className="admin-login-heading">
          <span>PRIVATE SPACE</span>

          <h1>
            Welcome
            <br />
            back.
          </h1>

          <p>A quiet place to write, edit and publish.</p>
        </div>

        <LoginForm />
      </div>

      <div className="admin-login-art">
        <div>
          <span>✦</span>

          <blockquote>“Write what should not be forgotten.”</blockquote>

          <p>— Isabel Allende</p>
        </div>
      </div>
    </section>
  );
}
