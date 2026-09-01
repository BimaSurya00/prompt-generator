import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { MODEL_GUIDES } from '../model-guides.js'
import { config } from '../config.js'

const TEMPLATE_DIR = path.dirname(fileURLToPath(import.meta.url))
const STORYBOARD_TEMPLATE_A = readFileSync(path.join(TEMPLATE_DIR, '../../template-storyboard.md'), 'utf-8')
  .replace(/```/g, '')
  .replace(/^#{1,6} .*$/gm, '')
  .replace(/^---+$/gm, '')
  .replace(/\n{3,}/g, '\n\n')
  .trim()
const STORYBOARD_TEMPLATE_B = readFileSync(path.join(TEMPLATE_DIR, '../../template-storyboard-b.md'), 'utf-8')
  .split('<!-- LLM_TEMPLATE_END -->')[0]
  .replace(/```/g, '')
  .replace(/^#{1,6} .*$/gm, '')
  .replace(/^---+$/gm, '')
  .replace(/\n{3,}/g, '\n\n')
  .trim()
const STORYBOARD_TEMPLATES = JSON.parse(
  readFileSync(path.join(TEMPLATE_DIR, '../storyboard-templates.json'), 'utf-8')
)

const PROMPTS_DIR = path.join(TEMPLATE_DIR, '../prompts')
const readPrompt = (file) => readFileSync(path.join(PROMPTS_DIR, file), 'utf-8').trim()
const fill = (template, vars) => Object.entries(vars)
  .reduce((t, [k, v]) => t.replaceAll(`{{${k}}}`, v ?? ''), template)

const PROMPT_ACTIVITY = readPrompt('activity-prompt.md')
const PROMPT_IDEATION_SHARED = readPrompt('ideation-shared.md')
const PROMPT_IDEATION_A = readPrompt('ideation-variant-a.md')
const PROMPT_IDEATION_B = readPrompt('ideation-variant-b.md')
const PROMPT_SPLIT_SCENE = readPrompt('split-scene.md')
const PROMPT_GENERATE_IDEAS = readPrompt('generate-ideas.md')
const PROMPT_TRANSLATE = readPrompt('translate.md')

function mergeUsage(...usages) {
  const valid = usages.filter(Boolean)
  if (!valid.length) return null
  return valid.reduce((sum, u) => ({
    prompt_tokens: (sum.prompt_tokens || 0) + (u.prompt_tokens || 0),
    completion_tokens: (sum.completion_tokens || 0) + (u.completion_tokens || 0),
    total_tokens: (sum.total_tokens || 0) + (u.total_tokens || 0),
  }), {})
}

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${config.llm.apiKey}`,
  'HTTP-Referer': 'http://localhost:5173',
  'X-Title': 'Prompt Generator',
}

async function callDeepSeek(messages, temperature = 0.8, maxTokens = 4096, attempts = 3) {
  let lastError
  let currentMaxTokens = maxTokens
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await fetch(config.llm.baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: config.llm.model,
          messages,
          temperature,
          max_tokens: currentMaxTokens,
          reasoning: { enabled: false },
        }),
        signal: AbortSignal.timeout(300000),
      })
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        const msg = errBody?.[0]?.error?.message || errBody?.error?.message || `LLM API error: ${res.status}`
        if (res.status === 429 || res.status >= 500) {
          lastError = new Error(msg)
          await new Promise(r => setTimeout(r, 1000 * 2 ** (attempt - 1)))
          continue
        }
        throw new Error(msg)
      }
      const data = await res.json()
      // Model hit the output token cap mid-generation — content is incomplete.
      // Retry with a larger budget instead of silently returning a truncated response.
      if (data.choices[0].finish_reason === 'length' && attempt < attempts) {
        currentMaxTokens = Math.min(currentMaxTokens * 2, 16384)
        lastError = new Error('LLM output truncated (finish_reason: length)')
        continue
      }
      return {
        content: data.choices[0].message.content,
        usage: data.usage || null,
        model: data.model || config.llm.model,
      }
    } catch (e) {
      if (e.name === 'TimeoutError' || e.name === 'AbortError') {
        lastError = e
        await new Promise(r => setTimeout(r, 1000 * 2 ** (attempt - 1)))
        continue
      }
      throw e
    }
  }
  throw lastError || new Error('LLM request failed')
}

export async function generateIdeas(topic) {
  return callDeepSeek([
    { role: 'system', content: PROMPT_GENERATE_IDEAS },
    { role: 'user', content: `Brief produk: ${topic}` },
  ], 0.9, 8192)
}

export async function generatePrompts(idea, language = 'id', angleCategory = null, maxClipDuration = 15, model = 'generic') {
  const langName = language === 'en' ? 'English' : 'Indonesian'
  const modelGuide = MODEL_GUIDES[model] || MODEL_GUIDES.generic
  const shared = fill(PROMPT_IDEATION_SHARED, {
    modelGuide: modelGuide ? `TARGET MODEL GUIDE:\n${modelGuide}` : '',
  })

  const systemA = shared + '\n\n' + fill(PROMPT_IDEATION_A, {
    templateA: STORYBOARD_TEMPLATE_A,
    templatesList: JSON.stringify(STORYBOARD_TEMPLATES, null, 2),
    angleCategory: angleCategory || 'unknown (infer from concept)',
    maxClipDuration,
    langName,
  })
  const systemB = shared + '\n\n' + fill(PROMPT_IDEATION_B, {
    templateB: STORYBOARD_TEMPLATE_B,
    maxClipDuration,
    langName,
  })

  const userMessage = { role: 'user', content: `Create a storyboard prompt for this content idea: "${idea}"` }

  // Generate each variant as its own completion (own max_tokens budget) instead
  // of one combined A+B response — a single 8192-token cap for both was getting
  // truncated for ideas that need many short scenes, silently corrupting one variant.
  const [a, b] = await Promise.all([
    callDeepSeek([{ role: 'system', content: systemA }, userMessage], 0.85, 8192),
    callDeepSeek([{ role: 'system', content: systemB }, userMessage], 0.85, 8192),
  ])

  return {
    content: `===A===\n${a.content.trim()}\n\n===B===\n${b.content.trim()}`,
    usage: mergeUsage(a.usage, b.usage),
    model: a.model || b.model || null,
  }
}

export async function splitScene(sceneText, maxDuration, language = 'id') {
  const langName = language === 'en' ? 'English' : 'Indonesian'
  return callDeepSeek([
    {
      role: 'system',
      content: fill(PROMPT_SPLIT_SCENE, { maxDuration, langName }),
    },
    {
      role: 'user',
      content: `SCENE TO SPLIT (max ${maxDuration} detik per sub-scene):\n\n${sceneText}`,
    },
  ], 0.5, 4096)
}

export async function translateContent(content, targetLang = 'id') {
  const targetLangName = targetLang === 'en' ? 'English' : 'Indonesian'
  return callDeepSeek([
    { role: 'system', content: fill(PROMPT_TRANSLATE, { targetLangName }) },
    { role: 'user', content },
  ], 0.3, 8192)
}

export async function generateActivityPrompt({ character, activities, instructions = '', model = 'generic', maxClipDuration = 10 }) {
  const sceneCount = activities.length
  const modelGuide = MODEL_GUIDES[model] || MODEL_GUIDES.generic
  const systemPrompt = fill(PROMPT_ACTIVITY, {
    maxClipDuration,
    modelGuide: modelGuide ? `TARGET MODEL GUIDE:\n${modelGuide}` : '',
  })

  return callDeepSeek([
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: `CHARACTER:\n${character}\n\nACTIVITIES (one per line, order = scene order):\n${activities.join('\n')}${instructions ? `\n\nADDITIONAL INSTRUCTIONS:\n${instructions}` : ''}\n\n(Total activities: ${sceneCount}, total duration must be exactly 30 seconds)`,
    },
  ], 0.85, 8192)
}