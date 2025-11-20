// Optional TFJS adapter. Dynamically loads @tensorflow/tfjs-node if available
// and a saved LayersModel located at models/tfjs_model/model.json

export type TFJSModelHandle = {
  tf: any
  model: any
}

export async function tryLoadTfjsModel(modelDir: string): Promise<TFJSModelHandle | null> {
  try {
    // dynamic require to avoid hard dependency
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const tf = require('@tensorflow/tfjs-node')
    const fs = require('fs')
    const path = require('path')
    const modelJson = path.join(modelDir, 'model.json')
    if (!fs.existsSync(modelJson)) return null
    const model = await tf.loadLayersModel('file://' + modelJson)
    return { tf, model }
  } catch (err) {
    return null
  }
}

export async function predictWithTfjs(handle: TFJSModelHandle, inputs: number[][]): Promise<number[]> {
  const { tf, model } = handle
  const x = tf.tensor2d(inputs)
  const preds = model.predict(x)
  const arr = await (Array.isArray(preds) ? preds[0].array() : preds.array())
  // cleanup tensors
  try { tf.dispose([x, preds]) } catch (e) {}
  // Ensure scalar extraction
  return arr.map((v: any) => (Array.isArray(v) ? v[0] : v))
}
