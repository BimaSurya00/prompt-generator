import db from '../db/index.js'
import { v4 as uuid } from 'uuid'

function parseSelfScore(row) {
  if (!row.self_score) return row
  try {
    return { ...row, self_score: JSON.parse(row.self_score) }
  } catch {
    return row
  }
}

export const ideaRepo = {
  insertMany(topicId, ideas) {
    const stmt = db.prepare(`
      INSERT INTO ideas (id, topic_id, content, angle_category, hook_line, one_line_concept, target_emotion, self_score, total_score, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    const tx = db.transaction(() => {
      ideas.forEach((idea, i) => {
        const totalScore = Number(idea.total_score)
        stmt.run(
          uuid(), topicId,
          idea.one_line_concept || idea.hook_line || '',
          idea.angle_category || null,
          idea.hook_line || null,
          idea.one_line_concept || null,
          idea.target_emotion || null,
          idea.self_score ? JSON.stringify(idea.self_score) : null,
          Number.isFinite(totalScore) ? totalScore : null,
          i
        )
      })
    })
    tx()
  },
  findSummariesByTopic(topicId) {
    const rows = db.prepare(`
      SELECT id, content, angle_category, hook_line, one_line_concept, target_emotion, self_score, total_score
      FROM ideas WHERE topic_id = ? ORDER BY total_score DESC, sort_order
    `).all(topicId)
    return rows.map(parseSelfScore)
  },
  findById(id) {
    return db.prepare('SELECT id, content, angle_category FROM ideas WHERE id = ?').get(id)
  },
  findByTopic(topicId) {
    const rows = db.prepare('SELECT * FROM ideas WHERE topic_id = ? ORDER BY sort_order').all(topicId)
    return rows.map(parseSelfScore)
  },
  markSelected(ids) {
    const stmt = db.prepare('UPDATE ideas SET selected = 1 WHERE id = ?')
    for (const id of ids) stmt.run(id)
  },
}