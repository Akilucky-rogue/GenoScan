import fs from "fs"
import path from "path"

// Very small logistic regression implemented in TypeScript with SGD.
// Purpose: lightweight, dependency-free PoC model for variant pathogenicity scoring.

export type FeatureVector = number[]

export interface ModelParams {
  weights: number[]
  bias: number
}

const MODELS_DIR = path.join(process.cwd(), "models")
const MODEL_PATH = path.join(MODELS_DIR, "simple-model.json")

function sigmoid(x: number) {
  return 1 / (1 + Math.exp(-x))
}

export function predict(params: ModelParams, x: FeatureVector) {
  // dot(w, x) + b
  let z = params.bias
  for (let i = 0; i < params.weights.length; i++) {
    z += (params.weights[i] || 0) * (x[i] || 0)
  }
  const p = sigmoid(z)
  return p
}

export async function saveModel(params: ModelParams) {
  try {
    if (!fs.existsSync(MODELS_DIR)) fs.mkdirSync(MODELS_DIR)
    fs.writeFileSync(MODEL_PATH, JSON.stringify(params, null, 2), "utf8")
    return true
  } catch (err) {
    console.error("Failed to save model", err)
    return false
  }
}

export async function loadModel(): Promise<ModelParams | null> {
  try {
    if (!fs.existsSync(MODEL_PATH)) return null
    const raw = fs.readFileSync(MODEL_PATH, "utf8")
    const parsed = JSON.parse(raw) as ModelParams
    return parsed
  } catch (err) {
    console.error("Failed to load model", err)
    return null
  }
}

// Train using simple SGD on synthetic or provided dataset
export async function train(
  X: FeatureVector[],
  y: number[],
  opts?: { epochs?: number; lr?: number }
): Promise<ModelParams> {
  const epochs = opts?.epochs ?? 2000
  const lr = opts?.lr ?? 0.1

  const dim = X[0]?.length ?? 0
  let weights = new Array(dim).fill(0).map(() => Math.random() * 0.01)
  let bias = 0

  for (let e = 0; e < epochs; e++) {
    let loss = 0
    for (let i = 0; i < X.length; i++) {
      const xi = X[i]
      const target = y[i]
      let z = bias
      for (let j = 0; j < dim; j++) z += weights[j] * (xi[j] ?? 0)
      const p = sigmoid(z)
      const err = p - target
      loss += - (target * Math.log(p + 1e-9) + (1 - target) * Math.log(1 - p + 1e-9))
      // gradient step
      for (let j = 0; j < dim; j++) {
        weights[j] -= lr * err * (xi[j] ?? 0)
      }
      bias -= lr * err
    }
    if (e % 500 === 0) {
      // console.log(`Epoch ${e} loss=${(loss / X.length).toFixed(4)}`)
    }
  }

  const params: ModelParams = { weights, bias }
  await saveModel(params)
  return params
}
