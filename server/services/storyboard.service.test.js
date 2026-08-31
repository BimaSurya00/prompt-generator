import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('./llm.service.js', () => ({
  generatePrompts: vi.fn(),
  splitScene: vi.fn(),
}))

import { splitScene } from './llm.service.js'
import { parseVariant, enforceSceneDuration } from './storyboard.service.js'

describe('parseVariant', () => {
  it('extracts a TEMPLATE_USED prefix and returns the remaining content', () => {
    const { content, templateUsed } = parseVariant('TEMPLATE_USED: A\nScene content here')
    expect(templateUsed).toBe('A')
    expect(content).toBe('Scene content here')
  })

  it('returns null templateUsed when no prefix is present', () => {
    const { content, templateUsed } = parseVariant('Plain scene content')
    expect(templateUsed).toBeNull()
    expect(content).toBe('Plain scene content')
  })

  it('trims surrounding whitespace', () => {
    const { content } = parseVariant('   \n  Scene content  \n  ')
    expect(content).toBe('Scene content')
  })
})

describe('enforceSceneDuration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renumbers scenes, leaves durations within the limit untouched, and reports no usage', async () => {
    const input = [
      '=== ADEGAN 1\nDURASI: 10 detik\nsome text\n',
      '=== ADEGAN 2\nDURASI: 8 detik\nmore text\n',
    ].join('\n')

    const { content, usage } = await enforceSceneDuration(input, 15, 'id')

    expect(splitScene).not.toHaveBeenCalled()
    expect(usage).toBeNull()
    expect(content).toContain('=== ADEGAN 1')
    expect(content).toContain('=== ADEGAN 2')
    expect(content).not.toContain('=== ADEGAN 3')
  })

  it('splits an over-duration scene via splitScene, renumbers sequentially, and sums usage', async () => {
    const input = '=== ADEGAN 1\nDURASI: 20 detik\nlong content here\n\n=== ADEGAN 2\nDURASI: 5 detik\nshort content\n'

    splitScene.mockResolvedValue({
      content: '=== ADEGAN 1a\nDURASI: 10 detik\npart one\n\n=== ADEGAN 1b\nDURASI: 10 detik\npart two\n',
      usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
    })

    const { content, usage } = await enforceSceneDuration(input, 15, 'id')

    expect(splitScene).toHaveBeenCalledWith(expect.stringContaining('DURASI: 20 detik'), 15, 'id')
    expect(usage).toEqual({ prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 })
    expect(content).toContain('=== ADEGAN 3')

    const adegan1 = content.indexOf('=== ADEGAN 1')
    const adegan2 = content.indexOf('=== ADEGAN 2')
    const adegan3 = content.indexOf('=== ADEGAN 3')
    const partOne = content.indexOf('part one')
    const partTwo = content.indexOf('part two')
    const shortContent = content.indexOf('short content')

    expect(adegan1).toBeLessThan(adegan2)
    expect(adegan2).toBeLessThan(adegan3)
    expect(adegan1).toBeLessThan(partOne)
    expect(partOne).toBeLessThan(adegan2)
    expect(adegan2).toBeLessThan(partTwo)
    expect(partTwo).toBeLessThan(adegan3)
    expect(adegan3).toBeLessThan(shortContent)
  })

  it('falls back to the original scene text and no usage when splitScene throws', async () => {
    const input = '=== ADEGAN 1\nDURASI: 25 detik\noriginal content\n'
    splitScene.mockRejectedValue(new Error('LLM failed'))

    const { content, usage } = await enforceSceneDuration(input, 15, 'id')

    expect(usage).toBeNull()
    expect(content).toContain('=== ADEGAN 1')
    expect(content).toContain('original content')
  })
})
