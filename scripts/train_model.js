// Lightweight script to train the synthetic logistic regression model.
const path = require('path')
const ml = require(path.join('..', 'lib', 'ml'))

async function main() {
  console.log('Training synthetic model...')
  const m = await ml.trainOnSynthetic()
  console.log('Model trained and saved:', m)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
