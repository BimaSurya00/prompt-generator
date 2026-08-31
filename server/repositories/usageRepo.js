import db from '../db/index.js'

export const usageRepo = {
  log(endpoint, model, usage) {
    if (!usage?.total_tokens) return
    db.prepare(
      'INSERT INTO usage_logs (endpoint, model, prompt_tokens, completion_tokens, total_tokens) VALUES (?, ?, ?, ?, ?)'
    ).run(endpoint, model, usage.prompt_tokens, usage.completion_tokens, usage.total_tokens)
  },
  getToday() {
    return db.prepare(`
      SELECT
        COUNT(*) as requests,
        COALESCE(SUM(prompt_tokens), 0) as prompt_tokens,
        COALESCE(SUM(completion_tokens), 0) as completion_tokens,
        COALESCE(SUM(total_tokens), 0) as total_tokens
      FROM usage_logs
      WHERE date(created_at) = date('now', 'localtime')
    `).get()
  },
}