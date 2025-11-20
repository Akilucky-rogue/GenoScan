import { describe, it, expect } from 'vitest'

import { POST as uploadPOST } from '../app/api/upload/route'

describe('/api/upload', () => {
  it('parses a small VCF and returns variants', async () => {
    const vcf = '#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\n1\t123\t.\tA\tG\t.\t.\tGENE=BRCA1'
    const req = new Request('http://localhost/api/upload', {
      method: 'POST',
      headers: { 'x-filename': 'test.vcf' },
      body: vcf,
    })
    const res = await uploadPOST(req as any)
    const json = await res.json()
    expect(json).toHaveProperty('variants')
    expect(Array.isArray(json.variants)).toBe(true)
    expect(json.variants[0]).toHaveProperty('chrom', '1')
  })

  it('parses a small FASTA and returns sequence', async () => {
    const fasta = '>seq1\nACTGACTG'
    const req = new Request('http://localhost/api/upload', {
      method: 'POST',
      headers: { 'x-filename': 'test.fasta' },
      body: fasta,
    })
    const res = await uploadPOST(req as any)
    const json = await res.json()
    expect(json).toHaveProperty('sequence')
    expect(json.sequence).toBe('ACTGACTG')
  })

  it('returns error when file exceeds maxBytes', async () => {
    // create ~11MB payload to exceed 10MB limit
    const size = 11 * 1024 * 1024
    const big = 'A'.repeat(size)
    const req = new Request('http://localhost/api/upload', {
      method: 'POST',
      headers: { 'x-filename': 'big.vcf' },
      body: big,
    })
    const res = await uploadPOST(req as any)
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json).toHaveProperty('error')
    expect(String(json.error).toLowerCase()).toContain('exceed')
  })

  it('parses multipart/form-data VCF upload', async () => {
    const vcf = '#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\n1\t123\t.\tA\tG\t.\t.\tGENE=BRCA1'
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
    const payload = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="test.vcf"\r\nContent-Type: text/vcf\r\n\r\n${vcf}\r\n--${boundary}--\r\n`
    const req = new Request('http://localhost/api/upload', {
      method: 'POST',
      headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
      body: payload,
    })
    const res = await uploadPOST(req as any)
    const json = await res.json()
    expect(json).toHaveProperty('variants')
    expect(Array.isArray(json.variants)).toBe(true)
    expect(json.variants[0]).toHaveProperty('chrom', '1')
  })
})
