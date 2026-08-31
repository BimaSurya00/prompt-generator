import { Router } from 'express'
import { generateIdeasHandler } from '../controllers/ideas.controller.js'
import { validate } from '../middlewares/validate.js'
import { createLlmRateLimit } from '../middlewares/rateLimit.js'
import { asyncHandler } from '../middlewares/asyncHandler.js'
import { generateIdeasSchema } from '../schemas/ideas.schema.js'

const router = Router()

router.post('/generate-ideas', createLlmRateLimit(), validate(generateIdeasSchema), asyncHandler(generateIdeasHandler))

export default router