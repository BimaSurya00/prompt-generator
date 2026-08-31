import { describe, it, expect } from 'vitest'
import { normalizeSceneTimes } from './activity.service.js'

describe('normalizeSceneTimes', () => {
  it('returns content unchanged when there are fewer than 2 time ranges', () => {
    const content = 'Scene (0-10s) only one range'
    expect(normalizeSceneTimes(content)).toBe(content)
  })

  it('returns content unchanged when the total already matches the target', () => {
    const content = 'A (0-15s) then B (15-30s)'
    expect(normalizeSceneTimes(content, 30)).toBe(content)
  })

  it('rescales scene durations to sum exactly to targetTotal', () => {
    const content = 'A (0-10s) then B (10-20s)'
    const result = normalizeSceneTimes(content, 30)
    const ranges = [...result.matchAll(/\((\d+)[–-](\d+)s\)/g)].map(m => [Number(m[1]), Number(m[2])])
    expect(ranges).toHaveLength(2)
    expect(ranges[0][0]).toBe(0)
    expect(ranges[1][1]).toBe(30)
    const total = ranges.reduce((sum, [s, e]) => sum + (e - s), 0)
    expect(total).toBe(30)
  })

  it('applies drift correction to the last scene when scaling does not divide evenly', () => {
    const content = 'A (0-10s) B (10-20s) C (20-30s)'
    const result = normalizeSceneTimes(content, 25)
    const ranges = [...result.matchAll(/\((\d+)[–-](\d+)s\)/g)].map(m => [Number(m[1]), Number(m[2])])
    const total = ranges.reduce((sum, [s, e]) => sum + (e - s), 0)
    expect(total).toBe(25)
    expect(ranges[0][0]).toBe(0)
  })
})
