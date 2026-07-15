/**
 * Customer psychology grounding for SCRIPTED Lumi (pre-LLM).
 *
 * Not a marketing essay dump — compact principles that drive stage templates
 * and chip progression. Ethical use only; no dark patterns, no fake scarcity
 * beyond published capacity SSOT, no invented client metrics.
 *
 * Research synthesis (consult → hype → lead):
 * - Reciprocity (Cialdini): give consult value first (teardown offer, quiz, process
 *   clarity) before asking for contact infos.
 * - Commitment & consistency: small chip commitments (quiz answers, “I need MVP”)
 *   raise willingness to complete a short lead form later.
 * - Liking / unity: Lumi as warm supporter, Saigon craft identity, browse-safe open.
 * - Authority: seniors own slices, honest trade-offs, published engagement models.
 * - Social proof: Work shelf chapters only (SSOT) — no invented metrics.
 * - Scarcity (ethical): real capacity limits from commercialPolicy, not fake timers.
 * - Jobs-to-be-done: map visitor situation × product intent before pitch.
 *
 * Funnel experience design:
 * 1) Rapport — safety + play (fortune, who is Lumi) without hard sell.
 * 2) Consult — answer “what / how / for whom” with concrete nouns.
 * 3) Proof — stories + anti-black-box myth.
 * 4) Interest — vivid but honest outcomes + capacity / 7-day promise.
 * 5) Soft CTA — chip invite, still skippable.
 * 6) Lead (COLLECT) — name/email only after value; free-text unlocks here.
 */

export const PSYCHOLOGY_PRINCIPLES = [
  "reciprocity",
  "commitment_consistency",
  "liking_unity",
  "authority",
  "social_proof",
  "ethical_scarcity",
  "jobs_to_be_done",
] as const;

export type PsychologyPrinciple = (typeof PSYCHOLOGY_PRINCIPLES)[number];

/** Which principle dominates each funnel stage (for tagging bubbles). */
export const STAGE_PRIMARY_PRINCIPLE: Record<
  import("@/lib/genie/funnelStages").FunnelStage,
  PsychologyPrinciple
> = {
  rapport: "liking_unity",
  consult: "reciprocity",
  proof: "social_proof",
  interest: "ethical_scarcity",
  soft_cta: "commitment_consistency",
  lead: "commitment_consistency",
};
