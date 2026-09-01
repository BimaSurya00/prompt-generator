const BASE = '/api'

async function request(path, body, signal) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: signal,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

export function generateIdeas(topic, signal) {
  return request('/generate-ideas', { topic }, signal)
}

export function generatePrompts(ideas, signal, language = 'id', maxClipDuration = 15, model = 'generic') {
  return request('/generate-prompts', { ideas, language, maxClipDuration, model }, signal)
}

export function translateStoryboards(results, targetLang, signal) {
  return request('/translate-storyboards', { results, targetLang }, signal)
}

export function generateActivity(data, signal) {
  return request('/generate-activity', data, signal)
}

export function getActivityHistory() {
  return fetch(`${BASE}/activity-history`).then(r => r.json())
}

export function deleteActivityHistory(id) {
  return fetch(`${BASE}/activity-history/${id}`, { method: 'DELETE' }).then(r => r.json())
}

export function getUsage() {
  return fetch(`${BASE}/usage`).then(r => r.json())
}

export function getTopics() {
  return fetch(`${BASE}/topics`).then(r => r.json())
}

export function getTopicHistory(topicId) {
  return fetch(`${BASE}/topics/${topicId}`).then(r => r.json())
}

export function deleteTopic(topicId) {
  return fetch(`${BASE}/topics/${topicId}`, { method: 'DELETE' }).then(r => r.json())
}
