import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description: "A little about the person and thoughts behind Her Journal.",
};

export default function AboutPage() {
  return (
    <section className="about-page">
      <div className="about-page-inner">
        {/* HERO */}

        <header className="about-hero">
          <span className="eyebrow">A LITTLE ABOUT ME</span>

          <h1>
            Behind
            <br />
            the words<span>.</span>
          </h1>

          <p>
            A quiet corner of the internet where I keep the thoughts, stories
            and little things I don&apos;t want to lose.
          </p>
        </header>

        {/* ABOUT */}

        <div className="about-content">
          <div className="about-number">01</div>

          <div className="about-copy">
            <span className="about-label">THE PERSON</span>

            <h2>I write because some things deserve somewhere to stay.</h2>

            <div className="about-text">
              <p>Hi, I&apos;m the person behind Her Journal.</p>

              <p>
                This space began simply as somewhere to collect the things that
                pass through my mind — thoughts I want to remember, feelings
                that are easier to write than explain, stories, poems and
                ordinary moments that somehow mean a little more.
              </p>

              <p>
                There isn&apos;t always a reason behind what I write. Sometimes
                it&apos;s a memory. Sometimes it&apos;s a person. Sometimes
                it&apos;s only a sentence that stayed in my head long enough to
                become something else.
              </p>

              <p>
                So this journal is less about having everything figured out and
                more about leaving a small record of the things that mattered
                while they were here.
              </p>
            </div>
          </div>
        </div>

        {/* PHILOSOPHY */}

        <div className="about-philosophy">
          <span>✦</span>

          <blockquote>
            “Not everything needs to become something important.
            <br />
            Some things are worth keeping simply because they were felt.”
          </blockquote>
        </div>

        {/* JOURNAL */}

        <div className="about-journal">
          <div>
            <span className="about-label">THIS JOURNAL</span>

            <h2>
              Stories.
              <br />
              Poems.
              <br />
              Passing thoughts.
            </h2>
          </div>

          <div className="about-journal-copy">
            <p>
              There is no single theme here. The writing changes because life
              does too.
            </p>

            <p>
              Some pages may be personal, some imagined, some unfinished and
              some written simply because the words wanted somewhere to go.
            </p>

            <Link href="/writing">
              Explore the writing
              <ArrowUpRight size={14} strokeWidth={1.3} />
            </Link>
          </div>
        </div>

        {/* END */}

        <footer className="about-ending">
          <span className="eyebrow">THANKS FOR BEING HERE</span>

          <h2>
            Stay for a
            <br />
            few words.
          </h2>

          <span className="about-ending-mark">✦</span>
        </footer>
      </div>
    </section>
  );
}
