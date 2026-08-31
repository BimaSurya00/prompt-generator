import { Router } from 'express'
import { generateActivityHandler } from '../controllers/activity.controller.js'
import { validate } from '../middlewares/validate.js'
import { createLlmRateLimit } from '../middlewares/rateLimit.js'
import { asyncHandler } from '../middlewares/asyncHandler.js'
import { generateActivitySchema } from '../schemas/activity.schema.js'

const router = Router()

router.post('/generate-activity', createLlmRateLimit(), validate(generateActivitySchema), asyncHandler(generateActivityHandler))

export default router