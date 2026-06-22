import { z } from "zod";

// Lead capture schema - shared by the client form and the /api/lead handler.
// Five fields or fewer (the research doc's CRO floor: pages with <=5 fields
// convert ~120% better). Only name + email + intent are required; company and
// message are progressive-profiling extras.

export const intentValues = ["project", "partnership", "careers", "other"] as const;
export type LeadIntent = (typeof intentValues)[number];

export const leadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "required")
    .max(120),
  email: z
    .string()
    .trim()
    .email("invalid_email")
    .max(200),
  company: z
    .string()
    .trim()
    .max(160)
    .optional()
    .or(z.literal("")),
  intent: z.enum(intentValues),
  message: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .or(z.literal("")),
  // Consent is required per PDPL/GDPR. The checkbox must be ticked.
  // Modelled as boolean + refine (not literal true) so the checkbox register
  // and a `false` default type cleanly through react-hook-form.
  consent: z.boolean().refine((v) => v === true, { message: "consent_required" }),
  // Honeypot: bots fill hidden fields. Must stay empty.
  website: z.string().max(0).optional().or(z.literal("")),
  // Locale the lead came from (for follow-up language). Always supplied by the
  // form, so required (keeping zod input and output types identical).
  locale: z.enum(["en", "vi"]),
  // Optional source tag (e.g. "hero", "footer", "genie").
  source: z.string().max(40).optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;
