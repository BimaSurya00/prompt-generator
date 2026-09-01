import { generateStoryboards, translateResults } from '../services/storyboard.service.js'

export const generatePromptsHandler = async (req, res) => {
  const { ideas, language, maxClipDuration, model } = req.body
  const data = await generateStoryboards(ideas, { language, maxClipDuration, model })
  res.json(data)
}

export const translateStoryboardsHandler = async (req, res) => {
  const { results, targetLang } = req.body
  const data = await translateResults(results, targetLang)
  res.json(data)
}