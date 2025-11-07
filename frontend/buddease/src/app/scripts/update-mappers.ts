import fs from 'fs';
import path from 'path';
import { ProjectTreeAnalyzer } from '@/app/scripts/generateTree'; // adjust path if needed

const mappersFile = path.resolve(__dirname, '../src/app/server/repository/mappers.ts');

interface RelevantFile {
  file: string;
  name: string;
}

async function updateMappersFromTree() {
  const analyzer = new ProjectTreeAnalyzer(path.resolve(__dirname, '../src'));
  await analyzer.analyzeProjectTree();

  // Collect only interfaces and key classes for mappers
  const relevantFiles: RelevantFile[] = Array.from(analyzer.interfaceRegistry.values())
    .filter(item => ['CacheData', 'Attachment', 'DefaultExcludedFields'].includes(item.name))
    .map(item => ({ file: item.file, name: item.name })); // cast to RelevantFile

  // Build import statements
  const importStatements = relevantFiles
    .map(item => {
      const relativePath = path.relative(path.dirname(mappersFile), item.file)
        .replace(/\\/g, '/')
        .replace(/\.ts$/, '');
      return `import { ${item.name} } from '${relativePath.startsWith('.') ? relativePath : './' + relativePath}';`;
    })
    .join('\n');

  // Read existing mappers.ts
  let existingContent = '';
  if (fs.existsSync(mappersFile)) {
    existingContent = fs.readFileSync(mappersFile, 'utf-8');
  } else {
    existingContent = '// AUTO-IMPORTS START\n// AUTO-IMPORTS END\n\n';
  }

  // Replace auto-import block
  const updatedContent = existingContent.replace(
    /\/\/ AUTO-IMPORTS START[\s\S]*?\/\/ AUTO-IMPORTS END/,
    `// AUTO-IMPORTS START\n${importStatements}\n// AUTO-IMPORTS END`
  );

  fs.writeFileSync(mappersFile, updatedContent, 'utf-8');
  console.log('✅ mappers.ts imports updated from project tree!');
}

updateMappersFromTree().catch(console.error);
