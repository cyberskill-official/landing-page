import { z } from 'zod';

export const buyHelpTypes = ['net-new', 'existing', 'ai-rag', 'other'] as const;

export const buyFormSchema = z.object({
  company: z.string().trim().min(2, 'Company must be at least 2 characters.').max(120, 'Company is too long.'),
  description: z.string().trim().max(280, 'Brief project description must be 280 characters or fewer.').optional(),
  email: z.string().trim().email('Enter a valid work email.'),
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters.').max(80, 'Full name is too long.'),
  helpType: z.enum(buyHelpTypes, {
    errorMap: () => ({ message: 'Choose the kind of help you need.' }),
  }),
  role: z.string().trim().min(2, 'Role must be at least 2 characters.').max(80, 'Role is too long.'),
  timezone: z.string().trim().min(2, 'Enter a time zone.').max(80, 'Time zone is too long.'),
});

export type BuyFormValues = z.infer<typeof buyFormSchema>;
export type BuyHelpType = BuyFormValues['helpType'];

export const buyHelpTypeLabels: Record<BuyHelpType, string> = {
  'ai-rag': 'AI / RAG integration',
  existing: 'Existing product / scaling team',
  'net-new': 'Net-new product / MVP',
  other: 'Other / not sure yet',
};

export function defaultBuyFormValues(timeZone = 'UTC'): Partial<BuyFormValues> {
  return {
    company: '',
    description: '',
    email: '',
    fullName: '',
    role: '',
    timezone: timeZone,
  };
}

export function buyLeadUseCase(values: BuyFormValues, scheduledSlot: string) {
  const description = values.description?.trim() || 'No extra project description provided yet.';
  return [
    `Help type: ${buyHelpTypeLabels[values.helpType]}.`,
    `Company: ${values.company}.`,
    `Role: ${values.role}.`,
    `Timezone: ${values.timezone}.`,
    `Calendly slot: ${scheduledSlot}.`,
    `Brief: ${description}`,
  ].join(' ');
}
