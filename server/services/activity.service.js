import { generateActivityPrompt } from './llm.service.js'
import { activityRepo } from '../repositories/activityRepo.js'
import { usageRepo } from '../repositories/usageRepo.js'

export function normalizeSceneTimes(content, targetTotal = 30) {
  const ranges = [...content.matchAll(/\((\d+)s?[-–](\d+)s?\)/g)]
  if (ranges.length < 2) return content
  const durations = ranges.map(m => Number(m[2]) - Number(m[1]))
  const sum = durations.reduce((a, b) => a + b, 0)
  if (sum === 0 || Math.abs(sum - targetTotal) < 0.5) return content
  const scaled = durations.map(d => Math.round(d * targetTotal / sum))
  let drift = targetTotal - scaled.reduce((a, b) => a + b, 0)
  scaled[scaled.length - 1] += drift
  let cursor = 0
  let i = 0
  return content.replace(/\((\d+)s?[-–](\d+)s?\)/g, () => {
    const start = cursor
    cursor += scaled[i]
    const end = cursor
    i++
    return `(${start}–${end}s)`
  })
}

const FALLBACK_CONTINUITY = '\n\nCONTINUITY:\nOne continuous session in the same setting. Do not change identity, face, hair, outfit, props, or lighting direction.'
const FALLBACK_NEGATIVE = '\n\nNEGATIVE:\nNo distorted hands, extra fingers, duplicated limbs, broken reflections, floating objects, incorrect physics, exaggerated muscles, excessive sweat, sudden lighting changes, extreme camera shake, unrealistic movement, text, logos, subtitles, or watermarks.'

export async function generateActivity({ character, activities, instructions, model }) {
  const list = activities.map(a => a.trim()).filter(Boolean)

  let { content: raw, usage, model: usedModel } = await generateActivityPrompt({
    character,
    activities: list,
    instructions,
    model,
  })
  usageRepo.log('generate-activity', usedModel, usage)

  let content = raw.trim().replace(/^OPENING PARAGRAPH:\s*/i, '')

  if (content.length < 500) {
    const retry = await generateActivityPrompt({
      character,
      activities: list,
      instructions,
      model,
    })
    usageRepo.log('generate-activity', retry.model, retry.usage)
    content = retry.content.trim().replace(/^OPENING PARAGRAPH:\s*/i, '')
    usage = retry.usage
    usedModel = retry.model
  }

  content = normalizeSceneTimes(content)

  if (!/CONTINUITY:/i.test(content)) {
    content += FALLBACK_CONTINUITY + FALLBACK_NEGATIVE
  } else if (!/NEGATIVE:/i.test(content)) {
    content += FALLBACK_NEGATIVE
  }

  const id = activityRepo.create({
    character,
    activities: list.join('\n'),
    model: model || 'generic',
    content,
  })

  return { id, content, usage, model: usedModel }
}