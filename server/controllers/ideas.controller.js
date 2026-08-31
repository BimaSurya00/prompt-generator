import { generateIdeasForTopic } from '../services/ideation.service.js'

export const generateIdeasHandler = async (req, res) => {
  const { topic } = req.body
  const data = await generateIdeasForTopic(topic)
  res.json(data)
}