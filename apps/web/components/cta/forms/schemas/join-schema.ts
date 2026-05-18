import { z } from 'zod';

export type AtsRole = {
  id: string;
  location: string;
  title: string;
};

export const fallbackJoinRoles: AtsRole[] = [
  { id: 'frontend', title: 'Senior Frontend Engineer', location: 'Remote / Ho Chi Minh City' },
  { id: 'r3f', title: 'Senior R3F / Three.js Engineer', location: 'Remote / Ho Chi Minh City' },
  { id: 'design-system', title: 'Design Systems Engineer', location: 'Remote / Ho Chi Minh City' },
];

export const joinSchema = z.object({
  attribution_source: z.string().trim().max(120, 'Attribution source is too long.').optional(),
  cover_note: z.string().trim().max(2000, 'Cover note must be 2000 characters or fewer.').optional(),
  email: z.string().trim().email('Enter a valid email.'),
  full_name: z.string().trim().min(2, 'Full name must be at least 2 characters.').max(80, 'Full name is too long.'),
  portfolio_url: z.string().trim().url('Enter a valid portfolio URL.').max(240, 'Portfolio URL is too long.').optional().or(z.literal('')),
  role_id: z.string().trim().min(1, 'Choose a role of interest.'),
});

export type JoinFormData = z.infer<typeof joinSchema>;

export const joinDefaultValues: JoinFormData = {
  attribution_source: '',
  cover_note: '',
  email: '',
  full_name: '',
  portfolio_url: '',
  role_id: '',
};
