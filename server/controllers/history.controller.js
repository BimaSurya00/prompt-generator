import { activityRepo } from '../repositories/activityRepo.js'
import { topicRepo } from '../repositories/topicRepo.js'
import { ideaRepo } from '../repositories/ideaRepo.js'
import { promptRepo } from '../repositories/promptRepo.js'
import { usageRepo } from '../repositories/usageRepo.js'

export function getActivityHistoryHandler(req, res) {
  res.json(activityRepo.findAll())
}

export function deleteActivityHistoryHandler(req, res) {
  activityRepo.delete(req.params.id)
  res.json({ success: true })
}

export function getUsageHandler(req, res) {
  res.json(usageRepo.getToday())
}

export function getTopicsHandler(req, res) {
  res.json(topicRepo.findAll())
}

export function getTopicHandler(req, res) {
  const topic = topicRepo.findById(req.params.id)
  if (!topic) return res.status(404).json({ error: 'Topic not found' })

  const ideas = ideaRepo.findByTopic(req.params.id)
  for (const idea of ideas) {
    idea.prompts = promptRepo.findByIdea(idea.id)
  }

  res.json({ ...topic, ideas })
}

export function deleteTopicHandler(req, res) {
  topicRepo.delete(req.params.id)
  res.json({ success: true })
}