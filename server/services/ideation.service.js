import { generateIdeas as llmGenerateIdeas } from './llm.service.js'
import { topicRepo } from '../repositories/topicRepo.js'
import { ideaRepo } from '../repositories/ideaRepo.js'
import { usageRepo } from '../repositories/usageRepo.js'

export const CANONICAL_ANGLES = [
  'Pattern Interrupt',
  'Problem-Agitate-Solve',
  'Myth-Busting',
  'Day-in-the-Life',
  'Before-After',
  'Social Proof',
  'Controversial Opinion',
  'POV Roleplay',
]

export const normalizeAngle = (raw) => {
  if (!raw) return null
  const r = String(raw).toLowerCase().replace(/-/g, ' ')
  const match = CANONICAL_ANGLES.find(a => r.includes(a.toLowerCase().replace(/-/g, ' ')))
  return match || null
}

function parseIdeasJson(text) {
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) return []
  try {
    const arr = JSON.parse(match[0])
    if (!Array.isArray(arr)) return []
    return arr.filter(i => i && typeof i === 'object' && (i.one_line_concept || i.hook_line))
  } catch {
    return []
  }
}

export async function generateIdeasForTopic(topic) {
  const { content: raw, usage, model } = await llmGenerateIdeas(topic)
  usageRepo.log('generate-ideas', model, usage)

  const ideasData = parseIdeasJson(raw)
  if (ideasData.length === 0) {
    throw Object.assign(new Error('AI returned no valid ideas. Try again.'), { expose: true, status: 500 })
  }

  ideasData.forEach(idea => { idea.angle_category = normalizeAngle(idea.angle_category) })

  const topicId = topicRepo.create(topic)
  ideaRepo.insertMany(topicId, ideasData)

  const ideas = ideaRepo.findSummariesByTopic(topicId)
  return { topicId, topic, ideas }
}