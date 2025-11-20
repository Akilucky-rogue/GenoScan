import { describe, it, expect } from 'vitest'

import { POST as inferPOST } from '../app/api/infer/route'
import { POST as suggestionsPOST } from '../app/api/suggestions/route'

describe('HTTP route handlers', () => {
  it('/api/infer returns predictions for variants', async () => {
    const req = new Request('http://localhost/api/infer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variants: [{ gene: 'BRCA1', impact: 'HIGH', af: 0.01 }] }),
    })
    const res = await inferPOST(req as any)
    const json = await res.json()
    expect(json).toHaveProperty('ok', true)
    expect(Array.isArray(json.results)).toBe(true)
    expect(json.results[0]).toHaveProperty('pathogenicityScore')
  })

  it('/api/suggestions validates input and returns suggestions', async () => {
    const req = new Request('http://localhost/api/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variants: [{ gene: 'BRCA1', impact: 'HIGH', af: 0.01 }] }),
    })
    const res = await suggestionsPOST(req as any)
    const json = await res.json()
    expect(json).toHaveProperty('ok', true)
    expect(json.suggestions).toHaveProperty('enrichedVariants')
  })

  it('/api/infer rejects oversized payload', async () => {
    const big = new Array(600).fill({ gene: 'GENE', impact: 'LOW' })
    const req = new Request('http://localhost/api/infer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variants: big }),
    })
    const res = await inferPOST(req as any)
    expect(res.status).toBe(413)
  })

  it('/api/suggestions times out on slow service', async () => {
    // Mock therapeuticService.getSuggestions to hang
    const mod = await import('../lib/api-services')
    const orig = mod.therapeuticService.getSuggestions
    // replace with a promise that never resolves
    mod.therapeuticService.getSuggestions = () => new Promise(() => {})

    const req = new Request('http://localhost/api/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variants: [{ gene: 'BRCA1', impact: 'HIGH' }] }),
    })

    const res = await suggestionsPOST(req as any)
    expect(res.status).toBe(504)

    // restore
    mod.therapeuticService.getSuggestions = orig
  })
})
