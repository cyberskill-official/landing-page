import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { scenes } from "@/lib/content/site";
import { localize } from "@/lib/i18n/types";
import { Reveal } from "@/components/motion/Reveal";
import { KineticText } from "@/components/motion/KineticText";

// Home-page narrative band. The scroll canvas tells the wish-to-software story
// visually; this surfaces the same beats as readable text on the page itself,
// so the home route reads like a story and not only a stack of feature
// sections. It pulls the beats from the shared `scenes` (the /lite storyboard
// and the canvas read the same source), so the three stay in sync.
const BEAT_IDS = ["origin", "craft", "proof", "team"] as const;

const TeamAvatars = () => (
  <div className="cs-team-avatars" aria-hidden="true" style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
    {[1, 2, 3].map(i => (
      <svg key={i} width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ borderRadius: "50%", background: "rgba(255,255,255,0.05)" }}>
        <circle cx="24" cy="18" r="8" fill="rgba(244,186,23,0.2)" />
        <path d="M12 40c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="rgba(244,186,23,0.2)" strokeWidth="4" />
      </svg>
    ))}
  </div>
);

export function StoryArc({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const beats = BEAT_IDS.map((id) => scenes.find((s) => s.id === id)).filter(
    (s): s is NonNullable<typeof s> => Boolean(s),
  );

  return (
    // suppressHydrationWarning: components/scroll/SceneFocus.tsx writes a
    // scroll-driven `--scene` custom property directly onto every
    // `.cs-section` node (imperative DOM, outside React's control) as soon as
    // it can measure layout. On this route that write can land before/while
    // this section is still hydrating, so React's hydration diff sees a
    // `style` attribute the server never rendered - a benign, expected
    // mismatch (the server intentionally omits `--scene`; app/globals.css
    // falls back to `var(--scene, 1)`, i.e. fully visible, until the client
    // value lands), not a real markup bug. Same fix as the nonce script in
    // app/layout.tsx.
    <section
      id="story"
      className="cs-section cs-story"
      aria-labelledby="story-title"
      suppressHydrationWarning
    >
      <div className="cs-container">
        <h2 id="story-title" className="cs-kt-h" data-mask-reveal="" aria-label={dict.sections.storyTitle}>
          <KineticText text={dict.sections.storyTitle} />
        </h2>
        <p className="cs-section-lead" data-mask-reveal="">{dict.sections.storyLead}</p>
        <ol className="cs-story-arc" role="list" data-line-reveal="">
          {beats.map((beat, i) => (
            <Reveal
              as="li"
              id={beat.id === "team" ? "team" : undefined}
              key={beat.id}
              className="cs-story-beat"
              delayMs={i * 90}
            >
              <p className="cs-eyebrow">{localize(beat.kicker, locale)}</p>
              <h3 className="cs-story-beat-title">{localize(beat.heading, locale)}</h3>
              <p className="cs-story-beat-body">{localize(beat.body, locale)}</p>
              {beat.id === "team" && <TeamAvatars />}
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
