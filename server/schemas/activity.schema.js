import { z } from 'zod'

export const generateActivitySchema = z.object({
  body: z.object({
    character: z.string({ error: 'Character description is required' }).trim().min(1, 'Character description is required'),
    activities: z.array(z.string({ error: 'At least one activity is required' }).trim().min(1)).min(1, 'At least one activity is required'),
    instructions: z.string().optional(),
    model: z.string().optional(),
  }),
})