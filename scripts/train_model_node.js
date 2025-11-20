const fs = require('fs')
const path = require('path')

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x))
}

function trainSynthetic({ n = 800, epochs = 1500, lr = 0.05 } = {}) {
  const X = []
  const y = []
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

  const dim = X[0].length
  let weights = new Array(dim).fill(0).map(() => Math.random() * 0.01)
  let bias = 0

  for (let e = 0; e < epochs; e++) {
    for (let i = 0; i < X.length; i++) {
      const xi = X[i]
      const target = y[i]
      let z = bias
      for (let j = 0; j < dim; j++) z += weights[j] * xi[j]
      const p = sigmoid(z)
      const err = p - target
      for (let j = 0; j < dim; j++) {
        weights[j] -= lr * err * xi[j]
      }
      bias -= lr * err
    }
  }

  return { weights, bias }
}

async function main() {
  console.log('Training synthetic model (node) ...')
  const model = trainSynthetic()
  const modelsDir = path.join(process.cwd(), 'models')
  if (!fs.existsSync(modelsDir)) fs.mkdirSync(modelsDir)
  const modelPath = path.join(modelsDir, 'simple-model.json')
  fs.writeFileSync(modelPath, JSON.stringify(model, null, 2), 'utf8')
  console.log('Saved model to', modelPath)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
