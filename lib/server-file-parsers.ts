// Streaming parsers for VCF and FASTA that operate on a ReadableStream<Uint8Array>
// Designed for server-side parsing of uploads without loading the whole file into memory.

export async function parseVcfStream(stream: ReadableStream<Uint8Array>, opts?: { maxBytes?: number }) {
  const reader = stream.getReader()
  const decoder = new TextDecoder('utf-8')
  let buf = ''
  const variants: any[] = []
  const maxBytes = opts?.maxBytes ?? 10 * 1024 * 1024
  let total = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    total += value?.byteLength ?? 0
    if (total > maxBytes) throw new Error('File exceeds max size')
    buf += decoder.decode(value, { stream: true })
    let idx
    while ((idx = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, idx).trim()
      buf = buf.slice(idx + 1)
      if (!line || line.startsWith('#')) continue
      const cols = line.split(/\t|\s+/)
      const chrom = cols[0]
      const pos = parseInt(cols[1]) || null
      const id = cols[2]
      const ref = cols[3]
      const alt = cols[4]
      const info = cols[7] || ''
      const geneMatch = /GENE=([^;\s]+)/i.exec(info) || /ANN=[^|]*\|([^|]+)/i.exec(info)
      const gene = geneMatch ? geneMatch[1] : undefined
      variants.push({ chrom, position: pos, id, ref, alt, info, gene })
      // keep memory bounded by limiting number of parsed items returned immediately if desired
    }
  }

  // handle any trailing chunk
  if (buf.trim()) {
    const line = buf.trim()
    if (!line.startsWith('#')) {
      const cols = line.split(/\t|\s+/)
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
  }

  return variants
}

export async function parseFastaStream(stream: ReadableStream<Uint8Array>, opts?: { maxBytes?: number }) {
  const reader = stream.getReader()
  const decoder = new TextDecoder('utf-8')
  let buf = ''
  let header = ''
  const seqParts: string[] = []
  const maxBytes = opts?.maxBytes ?? 10 * 1024 * 1024
  let total = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    total += value?.byteLength ?? 0
    if (total > maxBytes) throw new Error('File exceeds max size')
    buf += decoder.decode(value, { stream: true })
    let idx
    while ((idx = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, idx).trim()
      buf = buf.slice(idx + 1)
      if (!line) continue
      if (line.startsWith('>')) {
        header = line.substring(1).trim()
        continue
      }
      seqParts.push(line)
    }
  }

  if (buf.trim()) {
    const line = buf.trim()
    if (line.startsWith('>')) header = line.substring(1).trim()
    else seqParts.push(line)
  }

  return seqParts.join('')
}
