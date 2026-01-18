// autoFixInterfaceImports.ts
import fs from 'fs';
import path from 'path';
import { ASTParserUtils, TypeInfo } from '@/core/error-analyzer/utils/ASTParserUtils';

export async function autoFixInterfaceImports(projectRoot: string, files: string[]) {
    const parser = new ASTParserUtils(projectRoot);

    for (const file of files) {
        const sourceCode = fs.readFileSync(file, 'utf8');
        const { imports, types } = await parser.parseFile(file);

        // Collect existing imports
        const importedNames = new Set(imports.flatMap(i => i.imports));

        // Analyze types used in file
        const typeUsageRegex = /\b[A-Z][a-zA-Z0-9_$]+\b/g;
        const usedTypes = Array.from(new Set(sourceCode.match(typeUsageRegex) || []));

        const missingInterfaces: { name: string; source: string }[] = [];

        for (const typeName of usedTypes) {
            // Skip if already imported or not an interface in project
            if (importedNames.has(typeName)) continue;

            const typeDef: TypeInfo | null = await parser.findTypeDefinition(typeName);
            if (typeDef && typeDef.kind === 'interface') {
                const importPath = parser.getRelativeImportPath(file, typeDef.file);
                missingInterfaces.push({ name: typeName, source: importPath });
            }
        }

        if (missingInterfaces.length > 0) {
            // Prepare import statements
            const importLines = missingInterfaces
                .map(i => `import { ${i.name} } from '${i.source}';`)
                .join('\n');

            // Prepend imports to file
            const updatedCode = importLines + '\n' + sourceCode;
            fs.writeFileSync(file, updatedCode, 'utf8');

            console.log(`✅ Fixed ${missingInterfaces.length} interface imports in ${path.relative(projectRoot, file)}`);
        }
    }
}
