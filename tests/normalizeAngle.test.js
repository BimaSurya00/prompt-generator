import { describe, it, expect } from 'vitest'
import { normalizeAngle } from '../server/services/ideation.service.js'

describe('normalizeAngle', () => {
  it('maps exact canonical names', () => {
    expect(normalizeAngle('POV Roleplay')).toBe('POV Roleplay')
    expect(normalizeAngle('Before-After')).toBe('Before-After')
    expect(normalizeAngle('Social Proof')).toBe('Social Proof')
  })

  it('is case-insensitive', () => {
    expect(normalizeAngle('pov roleplay')).toBe('POV Roleplay')
    expect(normalizeAngle('pattern interrupt')).toBe('Pattern Interrupt')
  })

  it('is dash-insensitive', () => {
    expect(normalizeAngle('day in the life')).toBe('Day-in-the-Life')
    expect(normalizeAngle('day-in-the-life')).toBe('Day-in-the-Life')
    expect(normalizeAngle('problem agitate solve')).toBe('Problem-Agitate-Solve')
  })

  it('strips extra suffix text', () => {
    expect(normalizeAngle('POV Roleplay (user jadi bos)')).toBe('POV Roleplay')
    expect(normalizeAngle('Social Proof / Testimoni pihak ketiga')).toBe('Social Proof')
    expect(normalizeAngle('Myth-Busting / Counter-belief')).toBe('Myth-Busting')
  })

  it('returns null for unknown or empty', () => {
    expect(normalizeAngle('Gaya Bebas')).toBeNull()
    expect(normalizeAngle('')).toBeNull()
    expect(normalizeAngle(null)).toBeNull()
    expect(normalizeAngle(undefined)).toBeNull()
  })
})