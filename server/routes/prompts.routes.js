import { Router } from 'express'
import { generatePromptsHandler } from '../controllers/prompts.controller.js'
import { validate } from '../middlewares/validate.js'
import { createLlmRateLimit } from '../middlewares/rateLimit.js'
import { asyncHandler } from '../middlewares/asyncHandler.js'
import { generatePromptsSchema } from '../schemas/prompts.schema.js'

const router = Router()

router.post('/generate-prompts', createLlmRateLimit(), validate(generatePromptsSchema), asyncHandler(generatePromptsHandler))

export default router