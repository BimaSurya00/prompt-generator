import { generateActivity } from '../services/activity.service.js'

export const generateActivityHandler = async (req, res) => {
  const { character, activities, instructions, model } = req.body
  const data = await generateActivity({ character, activities, instructions, model })
  res.json(data)
}