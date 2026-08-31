import { describe, it, expect } from 'vitest'
import { normalizeSceneTimes } from '../server/services/activity.service.js'

describe('normalizeSceneTimes', () => {
  it('returns content unchanged when total already 30s', () => {
    const content = 'SCENE 1 — A (0–10s)\nSCENE 2 — B (10–20s)\nSCENE 3 — C (20–30s)'
    expect(normalizeSceneTimes(content)).toBe(content)
  })

  it('scales down when total exceeds 30s', () => {
    const content = 'SCENE 1 — A (0–13s)\nSCENE 2 — B (13–30s)'
    const result = normalizeSceneTimes(content)
    const ranges = [...result.matchAll(/\((\d+)[–-](\d+)s\)/g)]
    expect(Number(ranges[ranges.length - 1][2])).toBe(30)
  })

  it('scales up when total is under 30s', () => {
    const content = 'SCENE 1 — A (0–10s)\nSCENE 2 — B (10–20s)\nSCENE 3 — C (20–32s)'
    const result = normalizeSceneTimes(content)
    const ranges = [...result.matchAll(/\((\d+)[–-](\d+)s\)/g)]
    expect(Number(ranges[ranges.length - 1][2])).toBe(30)
  })

  it('produces contiguous ranges after scaling', () => {
    const content = 'SCENE 1 — A (0–8s)\nSCENE 2 — B (8–15s)\nSCENE 3 — C (15–30s)'
    const result = normalizeSceneTimes(content)
    const ranges = [...result.matchAll(/\((\d+)[–-](\d+)s\)/g)]
    for (let i = 1; i < ranges.length; i++) {
      expect(Number(ranges[i][1])).toBe(Number(ranges[i - 1][2]))
    }
    expect(Number(ranges[ranges.length - 1][2])).toBe(30)
  })

  it('handles both dash and en-dash separators', () => {
    const content = 'SCENE 1 — A (0-10s)\nSCENE 2 — B (10-22s)\nSCENE 3 — C (22-30s)'
    const result = normalizeSceneTimes(content)
    const ranges = [...result.matchAll(/\((\d+)[–-](\d+)s\)/g)]
    expect(Number(ranges[ranges.length - 1][2])).toBe(30)
  })

  it('returns content unchanged with fewer than 2 ranges', () => {
    const content = 'Just one (0–30s) range'
    expect(normalizeSceneTimes(content)).toBe(content)
  })
})