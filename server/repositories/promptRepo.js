import db from '../db/index.js'
import { v4 as uuid } from 'uuid'

export const promptRepo = {
  insertMany(results) {
    const stmt = db.prepare('INSERT INTO prompts (id, idea_id, variant, content, template_used) VALUES (?, ?, ?, ?, ?)')
    const tx = db.transaction(() => {
      for (const r of results) {
        for (const p of r.prompts) {
          stmt.run(uuid(), r.ideaId, p.variant, p.content, p.template_used)
        }
      }
    })
    tx()
  },
  findByIdea(ideaId) {
    return db.prepare('SELECT * FROM prompts WHERE idea_id = ?').all(ideaId)
  },
}