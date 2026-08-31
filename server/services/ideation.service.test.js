import { describe, it, expect } from 'vitest'
import { normalizeAngle, CANONICAL_ANGLES } from './ideation.service.js'

describe('normalizeAngle', () => {
  it('returns null for empty/falsy input', () => {
    expect(normalizeAngle(null)).toBeNull()
    expect(normalizeAngle(undefined)).toBeNull()
    expect(normalizeAngle('')).toBeNull()
  })

  it('matches a canonical angle case-insensitively', () => {
    expect(normalizeAngle('pattern interrupt')).toBe('Pattern Interrupt')
    expect(normalizeAngle('PROBLEM-AGITATE-SOLVE')).toBe('Problem-Agitate-Solve')
  })

  it('matches when hyphens in the raw value are spaces instead', () => {
    expect(normalizeAngle('before after comparison')).toBe('Before-After')
  })

  it('matches a canonical angle embedded in a longer phrase', () => {
    expect(normalizeAngle('this is a myth busting video')).toBe('Myth-Busting')
  })

  it('returns null when no canonical angle matches', () => {
    expect(normalizeAngle('totally unrelated angle')).toBeNull()
  })

  it('CANONICAL_ANGLES is a non-empty list', () => {
    expect(CANONICAL_ANGLES.length).toBeGreaterThan(0)
  })
})
