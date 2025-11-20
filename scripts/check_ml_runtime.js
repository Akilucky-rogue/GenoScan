// Simple runtime check for optional ML runtimes (onnxruntime-node and tfjs-node)
// Exits 0 if at least one runtime is loadable and trivial ops succeed, otherwise exits 1.
;(async () => {
  let ok = false
  try {
    const tf = require('@tensorflow/tfjs-node')
    console.log('tfjs-node loaded, version:', tf.version_core)
    const sum = tf.tidy(() => tf.tensor([1, 2, 3]).sum().arraySync())
    console.log('tfjs sample op result:', sum)
    ok = true
  } catch (e) {
    console.log('tfjs-node not available or failed:', e?.message || e)
  }

  try {
    const ort = require('onnxruntime-node')
    console.log('onnxruntime-node loaded, version:', ort.version)
    ok = true
  } catch (e) {
    console.log('onnxruntime-node not available or failed:', e?.message || e)
  }

  if (!ok) {
    console.error('No ML runtime available')
    process.exit(1)
  }
  process.exit(0)
})()
