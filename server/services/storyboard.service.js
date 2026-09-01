import { generatePrompts as llmGeneratePrompts, splitScene, translateContent } from './llm.service.js'
import { ideaRepo } from '../repositories/ideaRepo.js'
import { promptRepo } from '../repositories/promptRepo.js'
import { usageRepo } from '../repositories/usageRepo.js'

export function parseVariant(text) {
  const tpl = text.match(/^TEMPLATE_USED:\s*(\S+)\s*/)
  const content = tpl ? text.slice(tpl[0].length).trim() : text.trim()
  return { content, templateUsed: tpl ? tpl[1] : null }
}

export async function enforceSceneDuration(aContent, maxDur, language) {
  const parts = aContent.split(/^(=== ADEGAN \S+)/gm)
  const meta = parts[0]
  const blocks = []
  for (let i = 1; i < parts.length; i += 2) blocks.push(parts[i] + (parts[i + 1] || ''))
  const out = [meta]
  const usage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
  for (const sc of blocks) {
    const m = sc.match(/DURASI:\s*(\d+)\s*detik/i)
    if (m && Number(m[1]) > maxDur) {
      try {
        const split = await splitScene(sc, maxDur, language)
        if (split.usage) {
          usage.prompt_tokens += split.usage.prompt_tokens || 0
          usage.completion_tokens += split.usage.completion_tokens || 0
          usage.total_tokens += split.usage.total_tokens || 0
        }
        const subParts = split.content.split(/^(=== ADEGAN \S+)/gm)
        for (let i = 1; i < subParts.length; i += 2) out.push(subParts[i] + (subParts[i + 1] || ''))
        continue
      } catch (e) {
        console.error('splitScene failed:', e.message)
      }
    }
    out.push(sc)
  }
  let idx = 0
  const content = out
    .map(p => {
      if (/^=== ADEGAN \S+/.test(p)) {
        idx++
        p = p.replace(/^=== ADEGAN \S+/, `=== ADEGAN ${idx}`)
      }
      const t = p.trimEnd()
      return t ? t + '\n\n' : ''
    })
    .join('')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  return { content, usage: usage.total_tokens ? usage : null }
}

export async function generateStoryboards(ideaIds, { language, maxClipDuration, model }) {
  const maxDur = Number(maxClipDuration) > 0 ? Number(maxClipDuration) : 15

  const rawResults = await Promise.all(ideaIds.map(async (ideaId) => {
    const idea = ideaRepo.findById(ideaId)
    if (!idea) throw new Error(`Idea not found: ${ideaId}`)

    const { content: raw, usage: u, model: m } = await llmGeneratePrompts(idea.content, language, idea.angle_category, maxDur, model)

    const aMatch = raw.match(/===A===\s*([\s\S]*?)(?====B===|$)/)
    const bMatch = raw.match(/===B===\s*([\s\S]*?)$/)

    const a = parseVariant(aMatch ? aMatch[1] : '')
    const b = parseVariant(bMatch ? bMatch[1] : '')

    let usage = u
    if (a.content && !a.content.startsWith('Prompt A generation failed')) {
      const enforced = await enforceSceneDuration(a.content, maxDur, language)
      a.content = enforced.content
      if (enforced.usage) {
        usage = {
          prompt_tokens: (usage?.prompt_tokens || 0) + enforced.usage.prompt_tokens,
          completion_tokens: (usage?.completion_tokens || 0) + enforced.usage.completion_tokens,
          total_tokens: (usage?.total_tokens || 0) + enforced.usage.total_tokens,
        }
      }
    }

    return {
      ideaId,
      idea: idea.content,
      prompts: [
        { variant: 'A', content: a.content || 'Prompt A generation failed', template_used: a.templateUsed },
        { variant: 'B', content: b.content || 'Prompt B generation failed', template_used: b.templateUsed },
      ],
      usage: usage || null,
      model: m || null,
    }
  }))

  const totalUsage = rawResults.reduce((sum, r) => {
    if (!r.usage) return sum
    return {
      prompt_tokens: (sum.prompt_tokens || 0) + r.usage.prompt_tokens,
      completion_tokens: (sum.completion_tokens || 0) + r.usage.completion_tokens,
      total_tokens: (sum.total_tokens || 0) + r.usage.total_tokens,
    }
  }, {})
  usageRepo.log('generate-prompts', rawResults[0]?.model || 'unknown', totalUsage)

  ideaRepo.markSelected(ideaIds)
  promptRepo.insertMany(rawResults)

  return {
    results: rawResults.map(({ usage: _u, model: _m, ...rest }) => rest),
    usage: totalUsage,
  }
}

export async function translateResults(results, targetLang) {
  const usages = []
  let modelUsed = null

  const translated = await Promise.all(results.map(async (r) => {
    const prompts = await Promise.all(r.prompts.map(async (p) => {
      const { content, usage, model } = await translateContent(p.content, targetLang)
      if (usage) usages.push(usage)
      if (!modelUsed && model) modelUsed = model
      return { ...p, content }
    }))
    return { ...r, prompts }
  }))

  const usage = usages.length
    ? usages.reduce((sum, u) => ({
      prompt_tokens: (sum.prompt_tokens || 0) + (u.prompt_tokens || 0),
      completion_tokens: (sum.completion_tokens || 0) + (u.completion_tokens || 0),
      total_tokens: (sum.total_tokens || 0) + (u.total_tokens || 0),
    }), {})
    : null

  if (usage) usageRepo.log('translate-storyboard', modelUsed || 'unknown', usage)

  return { results: translated, usage }
}