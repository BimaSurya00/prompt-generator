import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import request from 'supertest'
import { createApp } from '../server/app.js'
import db from '../server/db/index.js'
import { runMigrations } from '../server/db/migrate.js'

// Mock LLM fetch sebelum import app (llm.service membaca fetch saat runtime)
const mockLlmResponse = (content) => ({
  ok: true,
  json: async () => ({
    choices: [{ message: { content } }],
    usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
    model: 'mock-model',
  }),
})

describe('API integration (LLM mocked)', () => {
  beforeEach(() => {
    runMigrations()
    db.prepare('DELETE FROM usage_logs').run()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('GET /api/health returns ok', async () => {
    const res = await request(createApp()).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })

  it('GET /api/topics returns empty array on fresh db', async () => {
    const res = await request(createApp()).get('/api/topics')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('POST /api/generate-ideas validates topic required', async () => {
    const res = await request(createApp())
      .post('/api/generate-ideas')
      .send({})
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Topic is required')
  })

  it('POST /api/generate-ideas returns error when LLM returns invalid', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockLlmResponse('no json here')))
    const res = await request(createApp())
      .post('/api/generate-ideas')
      .send({ topic: 'kopi' })
    expect(res.status).toBe(500)
    expect(res.body.error).toBe('AI returned no valid ideas. Try again.')
  })

  it('POST /api/generate-ideas persists ideas with normalized angle', async () => {
    const ideasJson = JSON.stringify([
      {
        id: 1,
        angle_category: 'pov roleplay',
        hook_line: 'Hook test',
        one_line_concept: 'Konsep test',
        target_emotion: 'curiosity',
        self_score: { hook_strength: 8, novelty: 7, relevance: 8, feasibility: 9 },
        total_score: 8,
      },
    ])
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockLlmResponse(ideasJson)))

    const res = await request(createApp())
      .post('/api/generate-ideas')
      .send({ topic: 'kopi' })

    expect(res.status).toBe(200)
    expect(res.body.topic).toBe('kopi')
    expect(res.body.ideas.length).toBe(1)
    expect(res.body.ideas[0].angle_category).toBe('POV Roleplay')
    expect(res.body.ideas[0].total_score).toBe(8)

    const topics = await request(createApp()).get('/api/topics')
    expect(topics.body[0].idea_count).toBe(1)
  })

  it('GET /api/topics/:id returns 404 for missing topic', async () => {
    const res = await request(createApp()).get('/api/topics/nonexistent')
    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Topic not found')
  })

  it('unknown API route returns 404 JSON', async () => {
    const res = await request(createApp()).get('/api/nope')
    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Not found')
  })
})