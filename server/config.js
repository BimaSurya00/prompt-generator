import 'dotenv/config'

const required = {
  LLM_API_KEY: process.env.LLM_API_KEY,
}

const missing = Object.entries(required).filter(([, v]) => !v).map(([k]) => k)
if (missing.length) {
  console.error(`[config] Missing required env vars: ${missing.join(', ')}`)
  process.exit(1)
}

export const config = {
  port: Number(process.env.PORT) || 3001,
  llm: {
    apiKey: process.env.LLM_API_KEY,
    baseUrl: process.env.LLM_BASE_URL || 'https://api.deepseek.com/v1/chat/completions',
    model: process.env.LLM_MODEL || 'deepseek-chat',
  },
  corsOrigin: (process.env.CORS_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean),
  dbPath: process.env.DB_PATH || 'server/data.db',
}