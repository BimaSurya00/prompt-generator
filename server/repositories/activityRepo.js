import db from '../db/index.js'
import { v4 as uuid } from 'uuid'

export const activityRepo = {
  create({ character, activities, model, content }) {
    const id = uuid()
    db.prepare('INSERT INTO activity_prompts (id, character, activities, model, content) VALUES (?, ?, ?, ?, ?)')
      .run(id, character, activities, model, content)
    return id
  },
  findAll() {
    return db.prepare(`
      SELECT id, character, activities, model, content, created_at
      FROM activity_prompts ORDER BY created_at DESC
    `).all()
  },
  delete(id) {
    db.prepare('DELETE FROM activity_prompts WHERE id = ?').run(id)
  },
}