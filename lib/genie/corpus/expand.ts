/**
 * Systematic SCRIPTED bubble expansion + official enumerator.
 *
 * Counting rule (single source for tests + SCRATCH reports):
 * - One bubble = one inventory unit with non-empty text, a FunnelStage, and a locale.
 * - EN and VI are counted separately (same logical path → two bubbles).
 * - Kinds: `assistant` (message body), `chip` (chip label), `fortune` (fortune line).
 * - Combinatorial cells: every valid (stage × intent × situation × tone × locale)
 *   yields 1 assistant bubble + chip-label bubbles for that stage.
 * - Hero topics (hand-crafted resolvers) yield 1 assistant + each chip label per locale.
 * - Count is produced by real expansion of the inventory — never a hardcoded literal.
 */

import type { Locale } from "@/lib/i18n/config";
import {
  FUNNEL_STAGE_ORDER,
  type FunnelStage,
  stageForHeroTopic,
} from "@/lib/genie/funnelStages";
import { STAGE_PRIMARY_PRINCIPLE } from "@/lib/genie/corpus/psychology";
import {
  INTENT_IDS,
  INTENT_TO_HERO,
  INTENT_TO_LEAD,
  SITUATION_IDS,
  TONE_IDS,
  type IntentId,
  type SituationId,
  type ToneId,
} from "@/lib/genie/corpus/dimensions";
import {
  corpusNextChipLabels,
  renderCorpusMessage,
} from "@/lib/genie/corpus/templates";
import { fortunePoolSize, pickFortune } from "@/lib/genie/scriptedChatHero";

export type BubbleKind = "assistant" | "chip" | "fortune";

export type ScriptedBubble = {
  id: string;
  stage: FunnelStage;
  locale: Locale;
  kind: BubbleKind;
  text: string;
  pathId: string;
  tags: string[];
};

export type BubbleCountReport = {
  total: number;
  byStage: Record<FunnelStage, number>;
  byKind: Record<BubbleKind, number>;
  byLocale: Record<Locale, number>;
  combinatorialCells: number;
  heroTopicCount: number;
  countingRule: string;
};

const LOCALES: readonly Locale[] = ["en", "vi"];

const COUNTING_RULE =
  "One bubble = non-empty text unit tagged with FunnelStage + locale. " +
  "EN and VI counted separately. Kinds: assistant | chip | fortune. " +
  "Includes combinatorial (stage×intent×situation×tone) cells and hero topics. " +
  "Produced by enumerateScriptedBubbles() expansion — not a hardcoded total.";

/** Encode a combinatorial path id (resolvable). */
export function encodeCorpusPath(
  stage: FunnelStage,
  intent: IntentId,
  situation: SituationId,
  tone: ToneId,
): string {
  return `cx:${stage}:${intent}:${situation}:${tone}`;
}

export function parseCorpusPath(
  id: string,
):
  | { stage: FunnelStage; intent: IntentId; situation: SituationId; tone: ToneId }
  | null {
  if (!id.startsWith("cx:")) return null;
  const parts = id.split(":");
  if (parts.length !== 5) return null;
  const [, stage, intent, situation, tone] = parts;
  if (!FUNNEL_STAGE_ORDER.includes(stage as FunnelStage)) return null;
  if (!INTENT_IDS.includes(intent as IntentId)) return null;
  if (!SITUATION_IDS.includes(situation as SituationId)) return null;
  if (!TONE_IDS.includes(tone as ToneId)) return null;
  return {
    stage: stage as FunnelStage,
    intent: intent as IntentId,
    situation: situation as SituationId,
    tone: tone as ToneId,
  };
}

/** All combinatorial path ids (one per cell; locale-independent). */
export function listCorpusPathIds(): string[] {
  const ids: string[] = [];
  for (const stage of FUNNEL_STAGE_ORDER) {
    for (const intent of INTENT_IDS) {
      for (const situation of SITUATION_IDS) {
        for (const tone of TONE_IDS) {
          ids.push(encodeCorpusPath(stage, intent, situation, tone));
        }
      }
    }
  }
  return ids;
}

export function combinatorialCellCount(): number {
  return (
    FUNNEL_STAGE_ORDER.length *
    INTENT_IDS.length *
    SITUATION_IDS.length *
    TONE_IDS.length
  );
}

type HeroSnapshot = {
  id: string;
  messageEn: string;
  messageVi: string;
  chips: Array<{ id: string; labelEn: string; labelVi: string }>;
};

/**
 * Build combinatorial + fortune bubbles. Hero bubbles injected by
 * enumerateScriptedBubbles via heroSnapshots from scriptedChat.
 */
export function expandCombinatorialBubbles(): ScriptedBubble[] {
  const out: ScriptedBubble[] = [];
  for (const stage of FUNNEL_STAGE_ORDER) {
    for (const intent of INTENT_IDS) {
      for (const situation of SITUATION_IDS) {
        for (const tone of TONE_IDS) {
          const pathId = encodeCorpusPath(stage, intent, situation, tone);
          const principle = STAGE_PRIMARY_PRINCIPLE[stage];
          const tags = [
            "combinatorial",
            `intent:${intent}`,
            `situation:${situation}`,
            `tone:${tone}`,
            `principle:${principle}`,
          ];
          for (const locale of LOCALES) {
            const text = renderCorpusMessage(locale, stage, {
              intent,
              situation,
              tone,
            });
            if (!text.trim()) continue;
            out.push({
              id: `${pathId}:assistant:${locale}`,
              stage,
              locale,
              kind: "assistant",
              text,
              pathId,
              tags,
            });
            const chips = corpusNextChipLabels(locale, stage);
            for (let i = 0; i < chips.length; i++) {
              const c = chips[i]!;
              const label = locale === "vi" ? c.vi : c.en;
              if (!label.trim()) continue;
              out.push({
                id: `${pathId}:chip:${c.idSuffix}:${locale}`,
                stage,
                locale,
                kind: "chip",
                text: label,
                pathId,
                tags: [...tags, `chip:${c.idSuffix}`],
              });
            }
          }
        }
      }
    }
  }
  return out;
}

export function expandFortuneBubbles(): ScriptedBubble[] {
  const out: ScriptedBubble[] = [];
  for (const locale of LOCALES) {
    const n = fortunePoolSize(locale);
    for (let i = 0; i < n; i++) {
      const text = pickFortune(locale, i);
      if (!text.trim()) continue;
      out.push({
        id: `fortune:${i}:${locale}`,
        stage: "rapport",
        locale,
        kind: "fortune",
        text,
        pathId: "fortune",
        tags: ["fortune", "principle:liking_unity"],
      });
    }
  }
  return out;
}

export function expandHeroBubbles(heroes: HeroSnapshot[]): ScriptedBubble[] {
  const out: ScriptedBubble[] = [];
  for (const h of heroes) {
    const stage = stageForHeroTopic(h.id);
    const tags = ["hero", `topic:${h.id}`, `principle:${STAGE_PRIMARY_PRINCIPLE[stage]}`];
    for (const locale of LOCALES) {
      const message = locale === "vi" ? h.messageVi : h.messageEn;
      if (message.trim()) {
        out.push({
          id: `hero:${h.id}:assistant:${locale}`,
          stage,
          locale,
          kind: "assistant",
          text: message,
          pathId: h.id,
          tags,
        });
      }
      for (const chip of h.chips) {
        const label = locale === "vi" ? chip.labelVi : chip.labelEn;
        if (!label.trim()) continue;
        out.push({
          id: `hero:${h.id}:chip:${chip.id}:${locale}`,
          stage,
          locale,
          kind: "chip",
          text: label,
          pathId: h.id,
          tags: [...tags, `chip:${chip.id}`],
        });
      }
    }
  }
  return out;
}

/** Resolve a combinatorial path into message + next chips (for runtime). */
export function resolveCorpusPath(
  locale: Locale,
  id: string,
): {
  message: string;
  chips: Array<{ id: string; label: string }>;
  startWish?: boolean;
  startTeardown?: boolean;
  startPartnership?: boolean;
  startCareers?: boolean;
  startContact?: boolean;
  seedMessage?: string;
  stage: FunnelStage;
} | null {
  const parsed = parseCorpusPath(id);
  if (!parsed) return null;
  const { stage, intent, situation, tone } = parsed;
  const message = renderCorpusMessage(locale, stage, { intent, situation, tone });
  const labels = corpusNextChipLabels(locale, stage);
  const chips: Array<{ id: string; label: string }> = [];

  for (const c of labels) {
    const label = locale === "vi" ? c.vi : c.en;
    if (c.idSuffix === "to_consult") {
      chips.push({
        id: encodeCorpusPath("consult", intent, situation, tone),
        label,
      });
    } else if (c.idSuffix === "to_proof") {
      chips.push({
        id: encodeCorpusPath("proof", intent, situation, tone),
        label,
      });
    } else if (c.idSuffix === "to_interest") {
      chips.push({
        id: encodeCorpusPath("interest", intent, situation, tone),
        label,
      });
    } else if (c.idSuffix === "to_soft") {
      chips.push({
        id: encodeCorpusPath("soft_cta", intent, situation, tone),
        label,
      });
    } else if (c.idSuffix === "to_lead" || c.idSuffix === "collect") {
      chips.push({
        id: encodeCorpusPath("lead", intent, situation, tone),
        label,
      });
    } else if (c.idSuffix === "hero") {
      chips.push({ id: INTENT_TO_HERO[intent], label });
    } else if (c.idSuffix === "stories") {
      chips.push({ id: "story_hub", label });
    } else if (c.idSuffix === "quiz") {
      chips.push({ id: "quiz_start", label });
    } else if (c.idSuffix === "menu") {
      chips.push({ id: "more", label });
    }
  }

  // Lead stage: fire COLLECT flags via lead hero id semantics
  if (stage === "lead") {
    const leadId = INTENT_TO_LEAD[intent];
    return {
      message,
      chips: [],
      stage,
      ...leadFlagsFor(leadId, locale, intent),
    };
  }

  return { message, chips, stage };
}

function leadFlagsFor(
  leadId: string,
  locale: Locale,
  intent: IntentId,
): {
  startWish?: boolean;
  startTeardown?: boolean;
  startPartnership?: boolean;
  startCareers?: boolean;
  startContact?: boolean;
  seedMessage?: string;
} {
  const seed =
    locale === "vi"
      ? `Quan tâm: ${intent} (từ lộ trình tư vấn Lumi).`
      : `Interested in: ${intent} (from Lumi consult path).`;
  switch (leadId) {
    case "teardown_flow":
      return { startTeardown: true, seedMessage: seed };
    case "partnership_flow":
      return { startPartnership: true, seedMessage: seed };
    case "careers_flow":
      return { startCareers: true, seedMessage: seed };
    case "book_call_flow":
    case "contact_flow":
      return { startContact: true, seedMessage: seed };
    default:
      return { startWish: true, seedMessage: seed };
  }
}

export function summarizeBubbles(bubbles: ScriptedBubble[]): BubbleCountReport {
  const byStage = Object.fromEntries(
    FUNNEL_STAGE_ORDER.map((s) => [s, 0]),
  ) as Record<FunnelStage, number>;
  const byKind: Record<BubbleKind, number> = {
    assistant: 0,
    chip: 0,
    fortune: 0,
  };
  const byLocale: Record<Locale, number> = { en: 0, vi: 0 };
  for (const b of bubbles) {
    byStage[b.stage] = (byStage[b.stage] ?? 0) + 1;
    byKind[b.kind] += 1;
    byLocale[b.locale] += 1;
  }
  return {
    total: bubbles.length,
    byStage,
    byKind,
    byLocale,
    combinatorialCells: combinatorialCellCount(),
    heroTopicCount: 0,
    countingRule: COUNTING_RULE,
  };
}

export { COUNTING_RULE };
