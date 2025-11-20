import { predictVariants } from "../../../lib/ml"
import { validateVariants } from "../../../lib/data"
import { enforceSizeLimit, cacheGet, cacheSet, withTimeout } from "../../../lib/api-guards"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const variants = Array.isArray(body?.variants) ? body.variants : []

    // Validate shape and enforce size limit
    const val = validateVariants(variants)
    if (!val.ok) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid variants', details: val.error }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }
    const size = enforceSizeLimit(variants, 500)
    if (!size.ok) {
      return new Response(JSON.stringify({ ok: false, error: size.error }), { status: 413, headers: { 'Content-Type': 'application/json' } })
    }

    // Simple cache to avoid recomputing identical requests
    const key = JSON.stringify(variants)
    const cached = cacheGet(key)
    if (cached) {
      return new Response(JSON.stringify({ ok: true, results: cached, cached: true }), { headers: { 'Content-Type': 'application/json' } })
    }

    // Run prediction with timeout
    const results = await withTimeout(predictVariants(variants), 2000)
    cacheSet(key, results, 1000 * 60)

    return new Response(JSON.stringify({ ok: true, results }), { headers: { "Content-Type": "application/json" } })
  } catch (err: any) {
    console.error("/api/infer error", err)
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } })
  }
}
