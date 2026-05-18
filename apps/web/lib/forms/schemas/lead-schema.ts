import { z } from 'zod';

const countryCode = z
  .string()
  .trim()
  .regex(/^[A-Za-z]{2}$/, 'Use a two-letter country code')
  .transform((value) => value.toUpperCase());

const consent = z.literal(true, {
  errorMap: () => ({ message: 'Required to process your data' }),
});

const commonFields = {
  contact_email: z.string().trim().email('Enter a valid email address'),
  contact_name: z.string().trim().min(2, 'Enter your name').max(80, 'Name is too long'),
  consent,
  hp_email: z.string().trim().max(160).optional(),
  idempotency_key: z.string().trim().min(8).max(120).optional(),
  locale: z.enum(['en', 'vi']).optional(),
  scene_id: z.string().trim().min(1).max(80).optional(),
};

const buyFields = {
  ...commonFields,
  budget_range: z.enum(['under-10k', '10k-50k', '50k-200k', 'over-200k', 'tbd']),
  country: countryCode.optional(),
  use_case: z.string().trim().min(20, 'Share at least 20 characters').max(2000, 'Use case is too long'),
};

const partnerFields = {
  ...commonFields,
  agency_name: z.string().trim().min(2, 'Enter the agency name').max(120, 'Agency name is too long'),
  brief: z.string().trim().min(50, 'Share at least 50 characters').max(2000, 'Brief is too long'),
  country: countryCode,
  monthly_capacity: z.coerce.number().int('Use a whole number').min(1, 'Capacity must be at least 1').max(2000, 'Capacity is too high'),
};

const joinFields = {
  ...commonFields,
  cover_note: z.string().trim().max(2000, 'Cover note is too long').optional(),
  portfolio_url: z.string().trim().url('Enter a valid URL').max(240, 'URL is too long').optional().or(z.literal('')),
  role_id: z.string().trim().min(1, 'Select a role').max(80, 'Role id is too long'),
};

export const leadSchema = z.discriminatedUnion('track', [
  z.object({ track: z.literal('buy'), ...buyFields }),
  z.object({ track: z.literal('partner'), ...partnerFields }),
  z.object({ track: z.literal('join'), ...joinFields }),
]);

export type LeadPayload = z.infer<typeof leadSchema>;
export type LeadTrack = LeadPayload['track'];

export function flattenLeadErrors(error: z.ZodError<LeadPayload>) {
  const errors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'body';
    errors[key] ??= [];
    errors[key].push(issue.message);
  }

  return errors;
}
