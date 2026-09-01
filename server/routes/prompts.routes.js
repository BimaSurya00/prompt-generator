import { Router } from 'express'
import { generatePromptsHandler, translateStoryboardsHandler } from '../controllers/prompts.controller.js'
import { validate } from '../middlewares/validate.js'
import { createLlmRateLimit } from '../middlewares/rateLimit.js'
import { asyncHandler } from '../middlewares/asyncHandler.js'
import { generatePromptsSchema, translateStoryboardsSchema } from '../schemas/prompts.schema.js'

const router = Router()

router.post('/generate-prompts', createLlmRateLimit(), validate(generatePromptsSchema), asyncHandler(generatePromptsHandler))
router.post('/translate-storyboards', createLlmRateLimit(), validate(translateStoryboardsSchema), asyncHandler(translateStoryboardsHandler))

export default router