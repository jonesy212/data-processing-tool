// CommonJS wrapper for CorrectionGenerator
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'CommonJS',
    target: 'ES2020',
    esModuleInterop: true,
    skipLibCheck: true,
    allowSyntheticDefaultImports: true
  }
});

// Import the module
const module = require('./src/app/generators/corrections/CorrectionGenerator.ts');

// Check what's exported
console.log('Exports:', Object.keys(module));

// Try to create generator - handle both default and named exports
let GeneratorClass;
if (module.default) {
  GeneratorClass = module.default;
} else if (module.CorrectionGenerator) {
  GeneratorClass = module.CorrectionGenerator;
} else {
  // Last resort: assume it's the default export
  GeneratorClass = module;
}

const generator = new GeneratorClass();

async function run() {
  const args = process.argv.slice(2);
  console.log('Running with args:', args);
  await generator.runFromCLI(args);
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
