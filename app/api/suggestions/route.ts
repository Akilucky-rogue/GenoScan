import { validateVariants } from "../../../lib/data"
import { therapeuticService } from "../../../lib/api-services"
import { enforceSizeLimit, withTimeout } from "../../../lib/api-guards"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const payload = body?.variants ?? []

    const validation = validateVariants(payload)
    if (!validation.ok) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid variants", details: validation.error }), { status: 400, headers: { "Content-Type": "application/json" } })
    }

    const variantsArray = validation.variants ?? []
    const size = enforceSizeLimit(variantsArray, 500)
    if (!size.ok) {
      return new Response(JSON.stringify({ ok: false, error: size.error }), { status: 413, headers: { "Content-Type": "application/json" } })
    }

    // Run service with timeout to prevent long-running requests
    try {
      const suggestions = await withTimeout(therapeuticService.getSuggestions(variantsArray), 3000)
      return new Response(JSON.stringify({ ok: true, suggestions }), { headers: { "Content-Type": "application/json" } })
    } catch (err: any) {
      if (String(err).toLowerCase().includes('timeout')) {
        return new Response(JSON.stringify({ ok: false, error: 'Service timeout' }), { status: 504, headers: { "Content-Type": "application/json" } })
      }
      throw err
    }
  } catch (err: any) {
    console.error("/api/suggestions error", err)
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } })
  }
}
