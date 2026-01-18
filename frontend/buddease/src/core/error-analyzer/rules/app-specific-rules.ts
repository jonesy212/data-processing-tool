// app-specific-rules.ts
src/app/error-analyzer/rules/app-specific-rules.ts

export const APP_SPECIFIC_RULES = {
    // Rule 1: All interfaces should be exported as types
    interfaceExports: {
        pattern: /export\s+(?!type)(?!default\s+type)(?!default\s+interface)interface\s+(\w+)/,
        fix: 'export type { $1 };\nexport interface $1',
        message: 'Interfaces should be exported with "export type"'
    },
    
    // Rule 2: Service classes should be default exports
    serviceExports: {
        pattern: /export\s+class\s+(\w+ApiService|Repository|Store)/,
        fix: 'export default class $1',
        message: 'Service classes should be default exports'
    },
    
    // Rule 3: Import interfaces as type-only
    interfaceImports: {
        pattern: /import\s*{\s*(Snapshot|PhaseContext|MilestoneDefinition|EntityAnalysis)\s*}\s*from/,
        fix: 'import type { $1 } from',
        message: 'Import interfaces/types with "import type"'
    },
    
    // Rule 4: Import services as default imports
    serviceImports: {
        pattern: /import\s*{\s*(\w+ApiService)\s*}\s*from/,
        fix: 'import $1 from',
        message: 'Import service classes as default imports'
    }
};

export function applyAppSpecificRules(content: string): string {
    let fixed = content;
    
    // Apply all rules
    Object.values(APP_SPECIFIC_RULES).forEach(rule => {
        fixed = fixed.replace(rule.pattern, rule.fix);
    });
    
    return fixed;
}