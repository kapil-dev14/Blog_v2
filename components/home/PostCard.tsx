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
    <article className={`post-card ${image ? "post-card-with-image" : ""}`}>
      {/* IMAGE */}

      {image && (
        <Link
          href={href}
          className="post-card-image"
          aria-label={`Read ${title}`}
        >
          <img src={image} alt={title} loading="lazy" />
        </Link>
      )}

      {/* TOP */}

      <div className="post-card-top">
        <span>{number}</span>

        <span>{category}</span>
      </div>

      {/* CONTENT */}

      <div className="post-card-content">
        {date && <span className="post-card-date">{date}</span>}

        <Link href={href}>
          <h3>{title}</h3>
        </Link>

        {excerpt && <p>{excerpt}</p>}
      </div>

      {/* ARROW */}

      <Link
        href={href}
        className="post-card-arrow"
        aria-label={`Read ${title}`}
      >
        <ArrowUpRight size={16} strokeWidth={1.2} />
      </Link>
    </article>
  );
}
