import type { Locale } from "@/lib/i18n/config";
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

export function StoryArc({ locale }: { locale: Locale }) {
  const beats = BEAT_IDS.map((id) => scenes.find((s) => s.id === id)).filter(
    (s): s is NonNullable<typeof s> => Boolean(s),
  );
  const intro =
    locale === "vi"
      ? "Mỗi dự án đều đi qua một hành trình: từ một điều ước rõ ràng đến phần mềm chạy thật giữa đời thực."
      : "Every project follows one arc: from a clear wish to software running in the real world.";
  const title = locale === "vi" ? "Hành trình của một điều ước" : "The arc of a wish";

  return (
    <section id="story" className="cs-section cs-story" aria-labelledby="story-title">
      <div className="cs-container">
        <h2 id="story-title" className="cs-kt-h" data-mask-reveal="" aria-label={title}>
          <KineticText text={title} />
        </h2>
        <p className="cs-section-lead" data-mask-reveal="">{intro}</p>
        <ol className="cs-story-arc" role="list" data-line-reveal="">
          {beats.map((beat, i) => (
            <Reveal
              as="li"
              key={beat.id}
              className="cs-story-beat"
              delayMs={i * 90}
              // Only the team beat gets a DOM id: it is the honest destination
              // for the "Team" nav link. ("proof" would collide with the
              // SocialProof section that already owns id="proof".)
              id={beat.id === "team" ? "team" : undefined}
            >
              <p className="cs-eyebrow">{localize(beat.kicker, locale)}</p>
              <h3 className="cs-story-beat-title">{localize(beat.heading, locale)}</h3>
              <p className="cs-story-beat-body">{localize(beat.body, locale)}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
