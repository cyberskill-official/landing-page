import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { processSteps } from "@/lib/content/site";
import { localize } from "@/lib/i18n/types";
import { Reveal } from "@/components/motion/Reveal";
import { KineticText } from "@/components/motion/KineticText";
import { BrandIcon, type BrandIconName } from "@/components/ui/BrandIcon";
import { ProcessCircuit } from "@/components/motion/ProcessCircuit";

const stepIcons: BrandIconName[] = ["discover", "shape", "build", "support"];

export function Process({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section id="process" className="cs-section" aria-labelledby="process-title">
      <div className="cs-container">
        <h2 id="process-title" className="cs-kt-h" data-mask-reveal="" aria-label={dict.sections.processTitle}>
          <KineticText text={dict.sections.processTitle} />
        </h2>
        <p className="cs-section-lead" data-mask-reveal="">{dict.sections.processLead}</p>
        <div className="cs-services-grid" style={{ position: "relative" }}>
          <ProcessCircuit />
          {processSteps.map((step, i) => (
            <Reveal as="article" key={step.n} className="cs-service-card cs-surface-standard" delayMs={i * 80}>
              <span className="cs-card-icon" aria-hidden="true"><BrandIcon name={stepIcons[i]} /></span>
              <p className="cs-eyebrow">{step.n}</p>
              <h3>{localize(step.title, locale)}</h3>
              <p>{localize(step.body, locale)}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
