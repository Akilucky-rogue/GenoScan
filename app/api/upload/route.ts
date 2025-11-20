import { NextResponse } from 'next/server'
import { parseVcfStream, parseFastaStream } from '@/lib/server-file-parsers'
import { Readable as NodeReadable } from 'stream'

export const runtime = 'nodejs'

// POST supports two modes:
// - raw body + x-filename header (legacy)
// - multipart/form-data with a `file` field (modern browsers)
export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const filename = file.name
    const maxBytes = 10 * 1024 * 1024 // 10 MB limit

    if (file.size > maxBytes) {
      return NextResponse.json({ error: 'File exceeds max size' }, { status: 413 })
    }

    if (filename.toLowerCase().endsWith('.vcf')) {
      // For VCF, we need to parse it. 
      // Since we have a File object, we can get the text directly.
      const text = await file.text()
      const variants: any[] = []
      const lines = text.split(/\r?\n/)
      for (const line of lines) {
        if (!line || line.startsWith('#')) continue
        const cols = line.split(/\t|\s+/)
        if (cols.length < 5) continue

        const chrom = cols[0]
        const pos = parseInt(cols[1]) || null
        const id = cols[2]
        const ref = cols[3]
        const alt = cols[4]
        const info = cols[7] || ''
        const geneMatch = /GENE=([^;\s]+)/i.exec(info) || /ANN=[^|]*\|([^|]+)/i.exec(info)
        const gene = geneMatch ? geneMatch[1] : undefined
        variants.push({ chrom, position: pos, id, ref, alt, info, gene })
      }
      return NextResponse.json({ variants })
    }

    if (filename.toLowerCase().endsWith('.fasta') || filename.toLowerCase().endsWith('.fa')) {
      const text = await file.text()
      const seq = text.split(/\r?\n/).filter((l) => !l.startsWith('>')).join('')
      return NextResponse.json({ sequence: seq })
    }

    return NextResponse.json({ error: 'Unsupported file extension' }, { status: 415 })
  } catch (err: any) {
    console.error("Upload error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
