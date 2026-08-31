import db from '../db/index.js'
import { v4 as uuid } from 'uuid'

export const topicRepo = {
  create(name) {
    const id = uuid()
    db.prepare('INSERT INTO topics (id, name) VALUES (?, ?)').run(id, name)
    return id
  },
  findAll() {
    return db.prepare(`
      SELECT t.*,
        COUNT(i.id) as idea_count,
        SUM(i.selected) as selected_count
      FROM topics t
      LEFT JOIN ideas i ON i.topic_id = t.id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `).all()
  },
  findById(id) {
    return db.prepare('SELECT * FROM topics WHERE id = ?').get(id)
  },
  delete(id) {
    db.prepare('DELETE FROM topics WHERE id = ?').run(id)
  },
}