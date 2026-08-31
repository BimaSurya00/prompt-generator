import { Router } from 'express'
import {
  getActivityHistoryHandler,
  deleteActivityHistoryHandler,
  getUsageHandler,
  getTopicsHandler,
  getTopicHandler,
  deleteTopicHandler,
} from '../controllers/history.controller.js'

const router = Router()

router.get('/activity-history', getActivityHistoryHandler)
router.delete('/activity-history/:id', deleteActivityHistoryHandler)
router.get('/usage', getUsageHandler)
router.get('/topics', getTopicsHandler)
router.get('/topics/:id', getTopicHandler)
router.delete('/topics/:id', deleteTopicHandler)

export default router