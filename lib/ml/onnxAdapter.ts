// Optional ONNX adapter. Dynamically imports onnxruntime-node if available.
// Falls back silently if not installed.

export type ONNXModelHandle = {
  session: any
}

export async function tryLoadOnnxModel(modelPath: string): Promise<ONNXModelHandle | null> {
  try {
    // dynamic require to avoid hard dependency at runtime if package not installed
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ort = require('onnxruntime-node')
    const session = await ort.InferenceSession.create(modelPath)
    return { session }
  } catch (err) {
    // not available
    return null
  }
}

export function predictWithOnnx(handle: ONNXModelHandle, inputs: number[][]): number[] {
  // Very small wrapper; convert inputs to appropriate tensor and run session.run
  // Keep this minimal — users should replace with their own model's input/output names.
  const ort = require('onnxruntime-node')
  const results: number[] = []
  for (const row of inputs) {
    const tensor = new ort.Tensor('float32', Float32Array.from(row), [1, row.length])
    // Default input name assumptions — model authors should change as needed.
    const inputName = Object.keys(handle.session.inputNames || {})[0] || 'input'
    // synchronous run is not available; use run
    // Note: this is a simplified example and may need adapting for real models.
    // eslint-disable-next-line no-await-in-loop
    // @ts-ignore
    const out = handle.session.run({ [inputName]: tensor })
    // naive extraction of first numeric output value
    const outName = Object.keys(out)[0]
    const data = out[outName].data
    results.push(Array.isArray(data) ? data[0] : data)
  }
  return results
}
