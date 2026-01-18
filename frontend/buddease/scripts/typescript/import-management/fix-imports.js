// fix-imports.js
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/generators/corrections/CircularDependencyDetector.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Comment out the problematic imports
content = content.replace(
  'import ApiMethod, { InterfaceInfo } from \'@/core/generators/ApiCodeGenerator\'',
  '// import ApiMethod, { InterfaceInfo } from \'@/core/generators/ApiCodeGenerator\' // TEMP: Commented out to fix CSS import issue'
);

content = content.replace(
  'import UniqueIDGenerator from "@/core/generators/GenerateUniqueIds";',
  '// import UniqueIDGenerator from "@/core/generators/GenerateUniqueIds"; // TEMP: Commented out to fix CSS import issue'
);

fs.writeFileSync(filePath, content);
console.log('✅ Commented out problematic imports in CircularDependencyDetector.ts');
console.log('Now test with: node --import=./css-loader.mjs --import=tsx -e "import(\'./src/app/generators/corrections/CircularDependencyDetector\').then(() => console.log(\'✅ OK\'))"');
