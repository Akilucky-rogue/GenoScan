const fs = require('fs')
const path = require('path')

function sigmoid(x){return 1/(1+Math.exp(-x))}

function variantToFeatures(v){
  const impactMap = {HIGH:1.0, MODERATE:0.7, LOW:0.3, MODIFIER:0.1}
  const impactRaw = String(v.impact||"").toUpperCase()
  const impact = impactMap[impactRaw] ?? 0.5
  const af = typeof v.af === 'number' ? Math.max(0, Math.min(1, v.af)) : 0
  const csRaw = String(v.clinicalSignificance || "").toLowerCase()
  const cs = csRaw.includes('path') ? 1 : csRaw.includes('benign') ? 0 : 0.5
  const cons = typeof v.conservation === 'number' ? Math.max(0, Math.min(1, v.conservation)) : 0.5
  return [impact, af, cs, cons]
}

function predictFromModel(model, x){
  let z = model.bias || 0
  for(let i=0;i<(model.weights||[]).length;i++){ z += (model.weights[i]||0) * (x[i]||0) }
  return sigmoid(z)
}

function loadModel(){
  const p = path.join(process.cwd(),'models','simple-model.json')
  if(!fs.existsSync(p)) return null
  return JSON.parse(fs.readFileSync(p,'utf8'))
}

async function main(){
  const model = loadModel()
  console.log('Loaded model?', !!model)
  const variants = [{gene:'BRCA1', impact:'HIGH', af:0.01}]
  const enriched = variants.map(v=>{
    const f = variantToFeatures(v)
    const score = model ? predictFromModel(model,f) : Math.min(0.999, Math.max(0.001, 0.2*f[0]+0.3*f[1]+0.4*f[2]+0.1*f[3]))
    return {...v, pathogenicityScore: score}
  })
  console.log('Enriched variants:', enriched)

  // Mock base suggestions
  const base = {
    smallMolecules:[{id:'SM001',name:'Olaparib',targetGenes:['BRCA1','BRCA2'],confidenceScore:0.6}],
    biologics:[{id:'BIO001',name:'Trastuzumab',targetGenes:['ERBB2'],confidenceScore:0.35}],
    geneTherapies:[{id:'GT001',name:'CRISPR',targetGenes:['BRCA1'],confidenceScore:0.25}],
    clinicalTrials:[]
  }

  function adjust(list){
    return list.map(item=>{
      const genes = item.targetGenes||[]
      const matched = enriched.filter(v=> v.gene && genes.map(g=>g.toUpperCase()).includes(String(v.gene).toUpperCase()))
      const avg = matched.length ? matched.reduce((s,v)=>s+(v.pathogenicityScore||0),0)/matched.length : 0
      const newScore = Math.min(0.99, (item.confidenceScore||0.4) + avg*0.5)
      const confidence = newScore>0.7? 'High' : newScore>0.45? 'Medium' : 'Low'
      return {...item, confidenceScore:newScore, confidence}
    })
  }

  const result = { smallMolecules: adjust(base.smallMolecules), biologics: adjust(base.biologics), geneTherapies: adjust(base.geneTherapies), clinicalTrials: base.clinicalTrials, enrichedVariants: enriched }
  console.log('Adjusted suggestions:', JSON.stringify(result,null,2))
}

main()
