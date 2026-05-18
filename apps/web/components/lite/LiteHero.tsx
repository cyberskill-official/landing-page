import { BackToCinematicLink } from './BackToCinematicLink';

type LiteHeroProps = {
  deck?: string;
  h1?: boolean;
  title?: string;
};

export function LiteHero({
  h1 = true,
  title = 'CyberSkill - Senior Software from Vietnam (read-only mode)',
  deck = 'A static, motion-free overview. Same content, streamlined delivery.',
}: LiteHeroProps) {
  return (
    <header className="lite-hero">
      <p className="lite-hero__eyebrow">Motion-free storyboard</p>
      {h1 ? <h1 className="lite-hero__title">{title}</h1> : <p className="lite-hero__title">{title}</p>}
      <p className="lite-hero__deck">{deck}</p>
      <div className="lite-hero__links" aria-label="Presentation choices">
        <BackToCinematicLink className="lite-secondary-link" />
        <a className="lite-secondary-link" href="/" rel="alternate" hrefLang="x-default">
          Canonical version
        </a>
      </div>
    </header>
  );
}
