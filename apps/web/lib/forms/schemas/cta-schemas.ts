import { z } from 'zod';
import type { TrackId } from '@/components/cta/tracks';

const countryCode = z
  .string()
  .trim()
  .regex(/^[A-Za-z]{2}$/, 'validation:country_code');

const email = z.string().trim().email('validation:email');
const fullName = z.string().trim().min(2, 'validation:name_required').max(80, 'validation:name_too_long');
const brief = z.string().trim().min(10, 'validation:brief_required').max(600, 'validation:brief_too_long');

export const buySchema = z.object({
  fullName,
  email,
  country: countryCode,
  brief,
});

export const partnerSchema = z.object({
  agencyName: z.string().trim().min(2, 'validation:agency_required').max(100, 'validation:agency_too_long'),
  email,
  country: countryCode,
  monthlyCapacity: z.coerce.number().min(1, 'validation:capacity_required').max(50, 'validation:capacity_too_high'),
  brief,
});

export const joinSchema = z.object({
  fullName,
  email,
  role: z.enum(['frontend', 'r3f', 'ai', 'design-system'], {
    errorMap: () => ({ message: 'validation:role_required' }),
  }),
  portfolioUrl: z.string().trim().url('validation:url').max(160, 'validation:url_too_long'),
  brief,
});

export const ctaSchemas = {
  buy: buySchema,
  partner: partnerSchema,
  join: joinSchema,
};

export type BuyFormValues = z.infer<typeof buySchema>;
export type PartnerFormValues = z.infer<typeof partnerSchema>;
export type JoinFormValues = z.infer<typeof joinSchema>;
export type CtaFormValues = BuyFormValues | PartnerFormValues | JoinFormValues;

export type CtaField = {
  name: string;
  label: string;
  type: 'text' | 'email' | 'url' | 'number' | 'textarea' | 'select';
  autocomplete: string;
  tip: string;
  options?: Array<{ value: string; label: string }>;
};

export const ctaFormFields: Record<TrackId, readonly CtaField[]> = {
  buy: [
    { name: 'fullName', label: 'Full name', type: 'text', autocomplete: 'name', tip: 'We use this to address the reply.' },
    { name: 'email', label: 'Work email', type: 'email', autocomplete: 'email', tip: 'We send scheduling details here.' },
    { name: 'country', label: 'Country code', type: 'text', autocomplete: 'country', tip: 'Two letters, used for timezone routing.' },
    { name: 'brief', label: 'What do you want to build?', type: 'textarea', autocomplete: 'off', tip: 'A short outcome, timeline, and context is enough.' },
  ],
  partner: [
    { name: 'agencyName', label: 'Agency name', type: 'text', autocomplete: 'organization', tip: 'We use this to route partner inquiries.' },
    { name: 'email', label: 'Work email', type: 'email', autocomplete: 'email', tip: 'Use the address you want the partner reply sent to.' },
    { name: 'country', label: 'Country code', type: 'text', autocomplete: 'country', tip: 'Two letters, used for timezone routing.' },
    { name: 'monthlyCapacity', label: 'Monthly capacity needed', type: 'number', autocomplete: 'off', tip: 'Number of senior engineers or designers you expect to need.' },
    { name: 'brief', label: 'First collaboration brief', type: 'textarea', autocomplete: 'off', tip: 'Share the service, client shape, and urgency.' },
  ],
  join: [
    { name: 'fullName', label: 'Full name', type: 'text', autocomplete: 'name', tip: 'We use this to address the reply.' },
    { name: 'email', label: 'Email', type: 'email', autocomplete: 'email', tip: 'We send interview follow-up here.' },
    {
      name: 'role',
      label: 'Role focus',
      type: 'select',
      autocomplete: 'off',
      tip: 'Choose the senior craft lane closest to your work.',
      options: [
        { value: '', label: 'Select a role' },
        { value: 'frontend', label: 'Frontend engineering' },
        { value: 'r3f', label: 'R3F / Three.js' },
        { value: 'ai', label: 'AI engineering' },
        { value: 'design-system', label: 'Design systems' },
      ],
    },
    { name: 'portfolioUrl', label: 'Portfolio URL', type: 'url', autocomplete: 'url', tip: 'LinkedIn, GitHub, website, or portfolio.' },
    { name: 'brief', label: 'What senior work do you want to own?', type: 'textarea', autocomplete: 'off', tip: 'A short note is enough.' },
  ],
};

export const defaultCtaValues: Record<TrackId, Record<string, string | number>> = {
  buy: { fullName: '', email: '', country: '', brief: '' },
  partner: { agencyName: '', email: '', country: '', monthlyCapacity: '', brief: '' },
  join: { fullName: '', email: '', role: '', portfolioUrl: '', brief: '' },
};
