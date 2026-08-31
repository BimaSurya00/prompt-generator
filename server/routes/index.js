import { Router } from 'express'
import ideasRoutes from './ideas.routes.js'
import promptsRoutes from './prompts.routes.js'
import activityRoutes from './activity.routes.js'
import historyRoutes from './history.routes.js'

const router = Router()

router.use(ideasRoutes)
router.use(promptsRoutes)
router.use(activityRoutes)
router.use(historyRoutes)

export default router