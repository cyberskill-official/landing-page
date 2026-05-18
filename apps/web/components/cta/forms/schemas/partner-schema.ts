import { z } from 'zod';

export const partnerCountries = [
  { code: 'VN', label: 'Vietnam (VN)' },
  { code: 'US', label: 'United States (US)' },
  { code: 'GB', label: 'United Kingdom (GB)' },
  { code: 'AU', label: 'Australia (AU)' },
  { code: 'CA', label: 'Canada (CA)' },
  { code: 'SG', label: 'Singapore (SG)' },
  { code: 'JP', label: 'Japan (JP)' },
  { code: 'DE', label: 'Germany (DE)' },
  { code: 'FR', label: 'France (FR)' },
  { code: 'NL', label: 'Netherlands (NL)' },
] as const;

export const partnerSchema = z.object({
  agency_name: z.string().trim().min(2, 'Agency name must be at least 2 characters.').max(120, 'Agency name is too long.'),
  attribution_source: z.string().trim().max(120, 'Attribution source is too long.').optional(),
  brief: z.string().trim().min(50, 'Brief must be at least 50 characters.').max(2000, 'Brief is too long.'),
  contact_email: z.string().trim().email('Enter a valid contact email.'),
  contact_name: z.string().trim().min(2, 'Contact name must be at least 2 characters.').max(80, 'Contact name is too long.'),
  country: z.string().trim().regex(/^[A-Z]{2}$/, 'Choose a country.'),
  monthly_capacity: z.coerce.number().int('Use whole developer-hours.').min(10, 'Capacity must be at least 10 hours.').max(2000, 'Capacity is too high.'),
});

export const partnerStep1Schema = partnerSchema.pick({
  agency_name: true,
  attribution_source: true,
  country: true,
});

export const partnerStep2Schema = partnerSchema.pick({
  brief: true,
  monthly_capacity: true,
});

export const partnerStep3Schema = partnerSchema.pick({
  contact_email: true,
  contact_name: true,
});

export type PartnerFormData = z.infer<typeof partnerSchema>;
export type PartnerFormField = keyof PartnerFormData;
export type PartnerStep = 1 | 2 | 3 | 4;

export const partnerDefaultValues: PartnerFormData = {
  agency_name: '',
  attribution_source: '',
  brief: '',
  contact_email: '',
  contact_name: '',
  country: '',
  monthly_capacity: 80,
};

export function partnerStepSchema(step: PartnerStep) {
  if (step === 1) return partnerStep1Schema;
  if (step === 2) return partnerStep2Schema;
  return partnerStep3Schema;
}

export function partnerStepFields(step: PartnerStep): PartnerFormField[] {
  if (step === 1) return ['agency_name', 'country', 'attribution_source'];
  if (step === 2) return ['monthly_capacity', 'brief'];
  return ['contact_email', 'contact_name'];
}
