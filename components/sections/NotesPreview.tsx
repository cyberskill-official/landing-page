import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { notes } from "@/lib/content/notes";
import { localize } from "@/lib/i18n/types";

/** Home teaser for engineering notes — supports “attract with useful articles”. */
export function NotesPreview({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const latest = notes.filter((n) => !n.draft).slice(0, 2);
  if (latest.length === 0) return null;

  return (
    <section id="notes" className="cs-section cs-section-alt" aria-labelledby="notes-preview-title">
      <div className="cs-container">
        <h2 id="notes-preview-title" className="cs-kt-h">
          {locale === "vi" ? "Ghi chép kỹ thuật" : "Engineering notes"}
        </h2>
        <p className="cs-section-lead">
          {locale === "vi"
            ? "Bài viết thực dụng về CI, hiệu năng và tiếp cận — cách chúng tôi giữ chất lượng khi ship."
            : "Practical writing on CI, performance, and accessibility — how we protect quality while shipping."}
        </p>
        <ul className="cs-notes-list" role="list">
          {latest.map((post) => (
            <li key={post.slug}>
              <article className="cs-note-card">
                <time className="cs-note-card-date" dateTime={post.publishedAt}>
                  {post.publishedAt}
                </time>
                <h3 className="cs-note-card-title">
                  <Link href={`/${locale}/notes/${post.slug}`}>{localize(post.title, locale)}</Link>
                </h3>
                <p className="cs-note-card-summary">{localize(post.summary, locale)}</p>
                <Link className="cs-note-card-more" href={`/${locale}/notes/${post.slug}`}>
                  {locale === "vi" ? "Đọc bài →" : "Read note →"}
                </Link>
              </article>
            </li>
          ))}
        </ul>
        <p className="cs-section-more">
          <Link className="cs-btn cs-btn-secondary" href={`/${locale}/notes`}>
            {dict.nav.notes}
          </Link>
        </p>
      </div>
    </section>
  );
}
