#!/usr/bin/env tsx
// standardize-entry-points.ts

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scriptsDir = path.join(__dirname);

function fixEntryPoint(filePath: string) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace CommonJS pattern with ES module pattern
    if (content.includes('if (require.main === module)')) {
        content = content.replace(
            /if \(require\.main === module\)\s*{[\s\S]*?}\s*catch[\s\S]*?}/,
            `// ES Module entry point\nif (import.meta.url === \`file://\${process.argv[1]}\`) {\n    main().catch(error => {\n        console.error('Fatal error:', getErrorMessage(error));\n        process.exit(1);\n    });\n}`
        );
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed entry point in: ${path.basename(filePath)}`);
    }
}

async function main() {
    const files = fs.readdirSync(scriptsDir)
        .filter(file => file.endsWith('.ts') && !file.endsWith('.d.ts'));
    
    console.log(`🔍 Checking ${files.length} files for entry point issues...`);
    
    files.forEach(file => {
        const filePath = path.join(scriptsDir, file);
        fixEntryPoint(filePath);
    });
    
    console.log('🎉 Entry points standardized!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}