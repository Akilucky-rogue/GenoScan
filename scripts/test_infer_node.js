const path = require('path')
const ml = require(path.join('..', 'lib', 'ml'))
const api = require(path.join('..', 'lib', 'api-services'))

async function main() {
  console.log('Testing ML predictVariants...')
  const sample = [{ gene: 'BRCA1', impact: 'HIGH', af: 0.01 }]
  const preds = await ml.predictVariants(sample)
  console.log('Predictions:', preds)

  console.log('\nTesting therapeuticService.getSuggestions...')
  const suggestions = await api.therapeuticService.getSuggestions(preds)
  console.log('Suggestions summary:')
  console.log(Object.keys(suggestions).filter(k=>k!=='enrichedVariants'))
  console.log('Enriched variants:', suggestions.enrichedVariants)
}

main().catch((err)=>{ console.error(err); process.exit(1) })
