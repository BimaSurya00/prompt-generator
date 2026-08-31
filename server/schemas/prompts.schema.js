import { z } from 'zod'

export const generatePromptsSchema = z.object({
  body: z.object({
    ideas: z.array(z.string().uuid(), { error: 'At least one idea is required' }).min(1, 'At least one idea is required'),
    language: z.enum(['id', 'en']).optional(),
    maxClipDuration: z.coerce.number().int().positive().max(120).optional(),
    model: z.string().optional(),
  }),
})