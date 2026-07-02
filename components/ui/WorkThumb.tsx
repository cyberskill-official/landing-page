import type { ReactNode } from "react";

// Abstract product mockups for Selected Work (FR-WEB-ART). No real screenshots
// yet, so each case study gets a stylised UI that reads as the kind of product
// it is - a dashboard, a mobile app, a storefront - in the gold-on-dark house
// style. Purely decorative -> aria-hidden. Swap for real screenshots when the
// cleared case studies land (docs/content/case-study-testimonial-intake.md).

const G = "#f4ba17";
const panel = "rgba(255,255,255,0.045)";
const panelSoft = "rgba(255,255,255,0.025)";
const line = "rgba(255,255,255,0.16)";
const lineSoft = "rgba(255,255,255,0.10)";

const mockups: Record<string, ReactNode> = {
  // Operations platform -> analytics dashboard
  "operations-platform": (
    <>
      <rect x="0.5" y="0.5" width="319" height="189" rx="12" fill={panelSoft} stroke="rgba(244,186,23,0.22)" />
      <path d="M0 12a12 12 0 0 1 12-12h296a12 12 0 0 1 12 12v14H0z" fill="rgba(255,255,255,0.05)" />
      <circle cx="17" cy="13" r="3" fill={G} opacity="0.75" />
      <circle cx="29" cy="13" r="3" fill={line} />
      <circle cx="41" cy="13" r="3" fill={line} />
      <rect x="12" y="38" width="62" height="140" rx="9" fill={panel} />
      <rect x="22" y="52" width="42" height="8" rx="4" fill={G} opacity="0.85" />
      <rect x="22" y="70" width="34" height="6" rx="3" fill={line} />
      <rect x="22" y="84" width="38" height="6" rx="3" fill={lineSoft} />
      <rect x="22" y="98" width="28" height="6" rx="3" fill={lineSoft} />
      <rect x="86" y="38" width="66" height="42" rx="9" fill="rgba(244,186,23,0.09)" stroke="rgba(244,186,23,0.28)" />
      <rect x="96" y="50" width="30" height="7" rx="3.5" fill={G} opacity="0.9" />
      <rect x="96" y="63" width="44" height="6" rx="3" fill={lineSoft} />
      <rect x="158" y="38" width="66" height="42" rx="9" fill={panel} />
      <rect x="230" y="38" width="78" height="42" rx="9" fill={panel} />
      <rect x="230" y="92" width="78" height="8" rx="4" fill={line} />
      <rect x="230" y="108" width="78" height="8" rx="4" fill={lineSoft} />
      <rect x="230" y="124" width="58" height="8" rx="4" fill={lineSoft} />
      <g className="cs-thumb-bars">
        <rect x="96" y="150" width="15" height="20" rx="3" fill="rgba(244,186,23,0.35)" />
        <rect x="119" y="132" width="15" height="38" rx="3" fill="rgba(244,186,23,0.5)" />
        <rect x="142" y="118" width="15" height="52" rx="3" fill="rgba(244,186,23,0.72)" />
        <rect x="165" y="102" width="15" height="68" rx="3" fill={G} />
        <rect x="188" y="140" width="15" height="30" rx="3" fill="rgba(244,186,23,0.4)" />
      </g>
    </>
  ),
  // Member mobile app -> phone with lesson list
  "member-mobile-app": (
    <>
      <rect x="0.5" y="0.5" width="319" height="189" rx="12" fill={panelSoft} stroke="rgba(244,186,23,0.16)" />
      <circle cx="64" cy="150" r="20" fill="rgba(244,186,23,0.06)" />
      <circle cx="258" cy="52" r="14" fill="rgba(244,186,23,0.06)" />
      <rect x="118" y="12" width="84" height="166" rx="16" fill={panel} stroke="rgba(244,186,23,0.28)" />
      <rect x="150" y="19" width="20" height="4" rx="2" fill={line} />
      <rect x="128" y="32" width="40" height="8" rx="4" fill={G} opacity="0.9" />
      <path d="M182 34.5a5.5 5.5 0 1 1 0 0.01" fill="none" stroke={G} strokeWidth="1.3" opacity="0.8" />
      <g>
        <rect x="128" y="48" width="64" height="28" rx="7" fill="rgba(255,255,255,0.05)" />
        <rect x="133" y="53" width="18" height="18" rx="5" fill="rgba(244,186,23,0.45)" />
        <rect x="156" y="56" width="30" height="5" rx="2.5" fill={line} />
        <rect x="156" y="65" width="20" height="4" rx="2" fill={lineSoft} />
      </g>
      <g>
        <rect x="128" y="80" width="64" height="28" rx="7" fill="rgba(255,255,255,0.05)" />
        <rect x="133" y="85" width="18" height="18" rx="5" fill="rgba(244,186,23,0.3)" />
        <rect x="156" y="88" width="30" height="5" rx="2.5" fill={line} />
        <rect x="156" y="97" width="24" height="4" rx="2" fill={lineSoft} />
      </g>
      <g>
        <rect x="128" y="112" width="64" height="28" rx="7" fill="rgba(255,255,255,0.05)" />
        <rect x="133" y="117" width="18" height="18" rx="5" fill="rgba(244,186,23,0.3)" />
        <rect x="156" y="120" width="26" height="5" rx="2.5" fill={line} />
        <rect x="156" y="129" width="20" height="4" rx="2" fill={lineSoft} />
      </g>
      <rect x="118" y="158" width="84" height="20" rx="0" fill="rgba(255,255,255,0.05)" />
      <circle cx="140" cy="168" r="3.4" fill={G} />
      <circle cx="160" cy="168" r="3.4" fill={line} />
      <circle cx="180" cy="168" r="3.4" fill={line} />
    </>
  ),
  // Commerce portal -> storefront + fast checkout
  "commerce-portal": (
    <>
      <rect x="0.5" y="0.5" width="319" height="189" rx="12" fill={panelSoft} stroke="rgba(244,186,23,0.22)" />
      <path d="M0 12a12 12 0 0 1 12-12h296a12 12 0 0 1 12 12v14H0z" fill="rgba(255,255,255,0.05)" />
      <circle cx="17" cy="13" r="3" fill={G} opacity="0.75" />
      <circle cx="29" cy="13" r="3" fill={line} />
      <rect x="220" y="8" width="88" height="10" rx="5" fill="rgba(255,255,255,0.06)" />
      <g>
        <rect x="16" y="40" width="88" height="60" rx="9" fill={panel} />
        <rect x="24" y="48" width="72" height="30" rx="6" fill="rgba(244,186,23,0.16)" />
        <rect x="24" y="84" width="36" height="7" rx="3.5" fill={line} />
        <rect x="80" y="84" width="16" height="7" rx="3.5" fill={G} opacity="0.85" />
      </g>
      <g>
        <rect x="116" y="40" width="88" height="60" rx="9" fill={panel} />
        <rect x="124" y="48" width="72" height="30" rx="6" fill="rgba(244,186,23,0.1)" />
        <rect x="124" y="84" width="36" height="7" rx="3.5" fill={line} />
        <rect x="180" y="84" width="16" height="7" rx="3.5" fill={G} opacity="0.85" />
      </g>
      <g>
        <rect x="216" y="40" width="88" height="60" rx="9" fill={panel} />
        <rect x="224" y="48" width="72" height="30" rx="6" fill="rgba(244,186,23,0.1)" />
        <rect x="224" y="84" width="36" height="7" rx="3.5" fill={line} />
        <rect x="280" y="84" width="16" height="7" rx="3.5" fill={G} opacity="0.85" />
      </g>
      <rect x="16" y="120" width="180" height="10" rx="5" fill={lineSoft} />
      <rect x="16" y="140" width="120" height="10" rx="5" fill={lineSoft} />
      <g className="cs-thumb-cta">
        <rect x="212" y="120" width="92" height="34" rx="17" fill={G} />
        <path d="M232 137l5 5 9-10" fill="none" stroke="#3a2a05" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="252" y="133" width="40" height="8" rx="4" fill="rgba(58,42,5,0.65)" />
      </g>
    </>
  ),
};

export function WorkThumb({ slug, className }: { slug: string; className?: string }) {
  const art = mockups[slug];
  if (!art) return null;
  return (
    <span className={`cs-work-thumb${className ? ` ${className}` : ""}`} aria-hidden="true">
      <svg viewBox="0 0 320 190" preserveAspectRatio="xMidYMid meet" role="presentation" focusable="false">
        {art}
      </svg>
    </span>
  );
}
