
import { trainOnSynthetic } from '../lib/ml';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('Starting model training...');
  try {
    const model = await trainOnSynthetic();
    console.log('Model trained successfully.');
    
    const modelPath = path.join(process.cwd(), 'models');
    if (!fs.existsSync(modelPath)) {
      fs.mkdirSync(modelPath, { recursive: true });
    }
    
    const modelFile = path.join(modelPath, 'simple-model.json');
    fs.writeFileSync(modelFile, JSON.stringify(model));
    console.log(`Model saved to ${modelFile}`);
  } catch (error) {
    console.error('Error training model:', error);
    process.exit(1);
  }
}

main();
