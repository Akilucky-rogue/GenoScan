import { describe, it, expect } from 'vitest'
import { therapeuticService } from '../lib/api-services'

describe('therapeuticService', () => {
  it('returns suggestions structure and enrichedVariants', async () => {
    const variants = [{ gene: 'BRCA1', impact: 'HIGH', af: 0.01 }]
    const res = await therapeuticService.getSuggestions(variants)
    expect(res).toHaveProperty('smallMolecules')
    expect(res).toHaveProperty('biologics')
    expect(res).toHaveProperty('geneTherapies')
    expect(res).toHaveProperty('enrichedVariants')
    expect(Array.isArray(res.enrichedVariants)).toBe(true)
  })
})
