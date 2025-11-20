import { describe, it, expect } from 'vitest'
import { variantToFeatures, predictVariants, trainOnSynthetic } from '../lib/ml'

describe('ML wrapper', () => {
  it('maps variant to features correctly', () => {
    const v = { impact: 'HIGH', af: 0.02, clinicalSignificance: 'Pathogenic', conservation: 0.8 }
    const f = variantToFeatures(v)
    expect(f.length).toBe(4)
    expect(f[0]).toBeGreaterThan(0)
    expect(f[1]).toBeCloseTo(0.02)
  })

  it('predictVariants returns pathogenicityScore in [0,1]', async () => {
    const variants = [{ gene: 'BRCA1', impact: 'HIGH', af: 0.01 }]
    const res = await predictVariants(variants)
    expect(Array.isArray(res)).toBe(true)
    expect(res[0]).toHaveProperty('pathogenicityScore')
    expect(res[0].pathogenicityScore).toBeGreaterThanOrEqual(0)
    expect(res[0].pathogenicityScore).toBeLessThanOrEqual(1)
  })

  it('can train synthetic model (fast smoke)', async () => {
    const model = await trainOnSynthetic()
    expect(model).toHaveProperty('weights')
    expect(model).toHaveProperty('bias')
    expect(Array.isArray(model.weights)).toBe(true)
  })
})
