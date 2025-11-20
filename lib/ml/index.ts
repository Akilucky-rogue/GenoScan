import { loadModel, predict, train, ModelParams } from "./simpleModel"
import { tryLoadOnnxModel, predictWithOnnx } from "./onnxAdapter"
import { tryLoadTfjsModel, predictWithTfjs } from "./tfjsAdapter"

// Convert a variant object into a numeric feature vector for the simple model.
// This is a prototype mapping — it's intentionally small and interpretable.
export function variantToFeatures(variant: any): number[] {
  // impact: 'HIGH' | 'MODERATE' | 'LOW' | etc.
  const impactMap: Record<string, number> = {
    HIGH: 1.0,
    MODERATE: 0.7,
    LOW: 0.3,
    MODIFIER: 0.1,
  }

  const impactRaw = String(variant.impact || variant.effect || "").toUpperCase()
  const impact = impactMap[impactRaw] ?? 0.5

  // allele frequency if available (0-1)
  const af = typeof variant.af === "number" ? Math.max(0, Math.min(1, variant.af)) : 0

  // clinical significance encoded if present
  const csRaw = String(variant.clinicalSignificance || "").toLowerCase()
  const cs = csRaw.includes("path") ? 1 : csRaw.includes("benign") ? 0 : 0.5

  // simple conservation proxy (if provided, else 0.5)
  const cons = typeof variant.conservation === "number" ? Math.max(0, Math.min(1, variant.conservation)) : 0.5

  // feature vector: [impact, af, cs, cons]
  return [impact, af, cs, cons]
}

export async function predictVariants(variants: any[]): Promise<any[]> {
  // Try TFJS first (optional dependency)
  try {
    const tfHandle = await tryLoadTfjsModel(require('path').join(process.cwd(), 'models', 'tfjs_model'))
    if (tfHandle) {
      const inputs = variants.map(variantToFeatures)
      const scores = await predictWithTfjs(tfHandle, inputs)
      return variants.map((v, i) => ({ ...v, pathogenicityScore: Math.max(0, Math.min(1, scores[i] || 0)) }))
    }
  } catch (e) {
    // ignore and fall back
  }

  // Try ONNX next (optional dependency)
  try {
    const handle = await tryLoadOnnxModel(require('path').join(process.cwd(), 'models', 'model.onnx'))
    if (handle) {
      const inputs = variants.map(variantToFeatures)
      const scores = await Promise.resolve(predictWithOnnx(handle, inputs))
      return variants.map((v, i) => ({ ...v, pathogenicityScore: Math.max(0, Math.min(1, scores[i] || 0)) }))
    }
  } catch (e) {
    // ignore and fall back
  }

  const model = await loadModel()
  if (!model) {
    // Fallback: heuristics
    return variants.map((v) => {
      const f = variantToFeatures(v)
      const score = Math.min(0.999, Math.max(0.001, 0.2 * f[0] + 0.3 * f[1] + 0.4 * f[2] + 0.1 * f[3]))
      return { ...v, pathogenicityScore: score }
    })
  }

  return variants.map((v) => {
    const f = variantToFeatures(v)
    const score = predict(model as ModelParams, f)
    return { ...v, pathogenicityScore: score }
  })
}

// Small helper to produce a synthetic dataset and train the model (callable from a script)
export async function trainOnSynthetic() {
  // produce synthetic X,y
  const n = 800
  const X: number[][] = []
  const y: number[] = []
  for (let i = 0; i < n; i++) {
    const impact = Math.random() > 0.7 ? 1.0 : Math.random() * 0.8
    const af = Math.random() < 0.6 ? Math.random() * 0.05 : Math.random() * 0.5
    const cs = Math.random() > 0.6 ? 1 : 0
    const cons = Math.random()
    const score = 0.4 * impact + 0.4 * cs + 0.1 * cons + 0.1 * (1 - af)
    const label = score > 0.6 ? 1 : 0
    X.push([impact, af, cs, cons])
    y.push(label)
  }
  const model = await train(X, y, { epochs: 1500, lr: 0.05 })
  return model
}
