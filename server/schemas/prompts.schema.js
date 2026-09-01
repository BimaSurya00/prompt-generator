import { z } from 'zod'

export const generatePromptsSchema = z.object({
  body: z.object({
    ideas: z.array(z.string().uuid(), { error: 'At least one idea is required' }).min(1, 'At least one idea is required'),
    language: z.enum(['id', 'en']).optional(),
    maxClipDuration: z.coerce.number().int().positive().max(120).optional(),
    model: z.string().optional(),
  }),
})

export const translateStoryboardsSchema = z.object({
  body: z.object({
    results: z.array(z.object({
      ideaId: z.string().min(1),
      idea: z.string().min(1),
      prompts: z.array(z.object({
        variant: z.enum(['A', 'B']),
        content: z.string().min(1),
        template_used: z.string().nullable().optional(),
      })).min(1),
    }), { error: 'At least one storyboard result is required' }).min(1, 'At least one storyboard result is required'),
    targetLang: z.enum(['id', 'en']),
  }),
})