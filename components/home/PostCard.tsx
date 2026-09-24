import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type PostCardProps = {
  number: string;
  category: string;
  date: string;
  title: string;
  excerpt: string;
  image?: string | null;
  href: string;
};

function formatCategory(category: string) {
  if (category === "poem") {
    return "Poetry";
  }

  if (category === "story") {
    return "Story";
  }

  if (category === "journal") {
    return "Journal";
  }

  return "Thoughts";
}

export default function PostCard({
  number,
  category,
  date,
  title,
  excerpt,
  image,
  href,
}: PostCardProps) {
  return (
    <article
      className={`post-card ${
        image ? "post-card-with-image" : "post-card-without-image"
      }`}
    >
      {image && (
        <Link
          href={href}
          className="post-card-image"
          aria-label={`Read ${title}`}
        >
          <img src={image} alt={title} loading="lazy" />

          <span>{number}</span>
        </Link>
      )}

      <div className="post-card-top">
        {!image && <span>{number}</span>}

        <span>{formatCategory(category)}</span>
      </div>

      <div className="post-card-content">
        {date && <span className="post-card-date">{date}</span>}

        <Link href={href}>
          <h3>{title}</h3>
        </Link>

        {excerpt && <p className="post-excerpt">{excerpt}</p>}
      </div>

      <Link
        href={href}
        className="post-card-arrow"
        aria-label={`Read ${title}`}
      >
        Read
        <ArrowUpRight size={14} strokeWidth={1.2} />
      </Link>
    </article>
  );
}
