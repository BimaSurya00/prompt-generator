import { z } from 'zod'

export const generateIdeasSchema = z.object({
  body: z.object({
    topic: z.string({ error: 'Topic is required' }).trim().min(1, 'Topic is required'),
  }),
})