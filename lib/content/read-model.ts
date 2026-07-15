/**
 * TASK-OPS-019 (scaffold): publishable content read model.
 *
 * Today: pure git SSOT from lib/content/* (no CyberOS network).
 * Tomorrow: when CYBEROS_CONTENT_URL (+ token) are set, a future adapter can
 * load published entities from CyberOS and fall back here on failure.
 *
 * Consumers should prefer this module over ad-hoc imports so a single swap
 * point exists when the CyberOS content API lands (TASK-BIZ-016 / TASK-OPS-019).
 */

import { notes, type NotePost } from "@/lib/content/notes";
import {
  work,
  caseStudyDetails,
  testimonials,
  clientLogos,
  team,
  aboutStory,
  aboutCulture,
  services,
  company,
  type WorkItem,
  type CaseStudyDetail,
  type Testimonial,
  type ClientLogo,
  type TeamMember,
} from "@/lib/content/site";
import { commercialPolicy, type CommercialPolicy } from "@/lib/content/policy";
import { changelog } from "@/lib/content/changelog";

export type ContentSource = "git" | "cyberos";

export type PublishableContent = {
  source: ContentSource;
  notes: NotePost[];
  work: WorkItem[];
  caseStudyDetails: CaseStudyDetail[];
  testimonials: Testimonial[];
  clientLogos: ClientLogo[];
  team: TeamMember[];
  aboutStory: typeof aboutStory;
  aboutCulture: typeof aboutCulture;
  services: typeof services;
  company: typeof company;
  commercialPolicy: CommercialPolicy;
  changelog: typeof changelog;
};

/**
 * Resolve publishable content. CyberOS path is reserved: when not configured,
 * always returns the git modules (never invents empty content).
 */
export function getPublishableContent(): PublishableContent {
  // Future: if process.env.CYBEROS_CONTENT_URL is set, fetch + validate, then
  // return { source: "cyberos", ... }. On failure, fall through to git.
  return {
    source: "git",
    notes,
    work,
    caseStudyDetails,
    testimonials,
    clientLogos,
    team,
    aboutStory,
    aboutCulture,
    services,
    company,
    commercialPolicy,
    changelog,
  };
}

/** True when a CyberOS content endpoint is configured (not yet implemented). */
export function isCyberOsContentConfigured(
  env: { CYBEROS_CONTENT_URL?: string | undefined } | NodeJS.ProcessEnv = process.env,
): boolean {
  return Boolean(env.CYBEROS_CONTENT_URL?.trim());
}
