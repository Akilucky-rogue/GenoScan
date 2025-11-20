// Minimal parsers for small VCF/FASTA files for client-side parsing

export function parseVcf(text: string) {
  const lines = text.split(/\r?\n/)
  const variants: any[] = []
  for (const line of lines) {
    if (!line || line.startsWith('#')) continue
    const cols = line.split(/\t|\s+/)
    // VCF standard: CHROM POS ID REF ALT QUAL FILTER INFO
    const chrom = cols[0]
    const pos = parseInt(cols[1]) || null
    const id = cols[2]
    const ref = cols[3]
    const alt = cols[4]
    const info = cols[7] || ''
    // Try to extract gene from INFO if present (simple lookups)
    const geneMatch = /GENE=([^;\s]+)/i.exec(info) || /ANN=[^|]*\|([^|]+)/i.exec(info)
    const gene = geneMatch ? geneMatch[1] : undefined

    variants.push({ chrom, position: pos, id, ref, alt, info, gene })
  }
  return variants
}

export function parseFasta(text: string) {
  const lines = text.split(/\r?\n/)
  let header = ''
  const seqParts: string[] = []
  for (const line of lines) {
    if (!line) continue
    if (line.startsWith('>')) {
      header = line.substring(1).trim()
      continue
    }
    seqParts.push(line.trim())
  }
  const sequence = seqParts.join('')
  return { header, sequence }
}
