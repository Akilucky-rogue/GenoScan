import { z } from "zod"

// Minimal schema for incoming variant objects used by the PoC endpoints
const VariantSchema = z.object({
  gene: z.string().optional(),
  impact: z.string().optional(),
  af: z.number().min(0).max(1).optional(),
  clinicalSignificance: z.string().optional(),
  conservation: z.number().min(0).max(1).optional(),
})

export const VariantsArraySchema = z.array(VariantSchema)

export function validateVariants(input: unknown) {
  try {
    const parsed = VariantsArraySchema.parse(input)
    return { ok: true, variants: parsed }
  } catch (err: any) {
    return { ok: false, error: err?.errors ?? String(err) }
  }
}

export type Variant = z.infer<typeof VariantSchema>
