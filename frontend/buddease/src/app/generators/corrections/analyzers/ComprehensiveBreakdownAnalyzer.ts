// ComprehensiveBreakdownAnalyzer.ts
import path from 'path'
import { Correction, CorrectionReport } from '@/app/generators/corrections/CorrectionGenerator'
import { ProjectTreeAnalyzer } from '@/app/scripts/generateTree';
import { ProjectFile } from '@/app/scripts/generateTree'

export interface ComponentBreakdown {
    name: string;
    file: string;
    errors: number;
    warnings: number;
    suggestions: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    corrections: Correction[];
}

export interface MethodBreakdown {
    component: string;
    method: string;
    file: string;
    line: number;
    errors: number;
    corrections: Correction[];
}

export interface InterfaceBreakdown {
    name: string;
    file: string;
    implementations: number;
    errors: number;
    corrections: Correction[];
}

export interface ImportBreakdown {
    file: string;
    imports: string[];
    circularDeps: string[];
    unusedImports: string[];
}

export interface ComprehensiveBreakdown {
    components: ComponentBreakdown[];
    methods: MethodBreakdown[];
    interfaces: InterfaceBreakdown[];
    imports: ImportBreakdown[];
    categories: {
        byComponent: Record<string, number>;
        byMethod: Record<string, number>;
        byInterface: Record<string, number>;
        byFileType: Record<string, number>;
        byComplexity: {
            simple: number;
            moderate: number;
            complex: number;
        };
    };
    summary: {
        totalComponents: number;
        totalMethods: number;
        totalInterfaces: number;
        affectedComponents: number;
        affectedMethods: number;
        affectedInterfaces: number;
    };
}

export class ComprehensiveBreakdownAnalyzer {
    private projectAnalyzer: ProjectTreeAnalyzer;

    constructor() {
        this.projectAnalyzer = new ProjectTreeAnalyzer();
    }

    async generateBreakdown(report: CorrectionReport): Promise<ComprehensiveBreakdown> {
        const projectStructure = await this.projectAnalyzer.analyzeProjectTree();
        
        const components = this.analyzeComponents(report, projectStructure);
        const methods = this.analyzeMethods(report, projectStructure);
        const interfaces = this.analyzeInterfaces(report, projectStructure);
        const imports = this.analyzeImports(report, projectStructure);

        return {
            components,
            methods,
            interfaces,
            imports,
            categories: this.categorizeIssues(report, components, methods, interfaces),
            summary: this.generateSummary(components, methods, interfaces)
        };
    }

    private analyzeComponents(report: CorrectionReport, projectStructure: any): ComponentBreakdown[] {
        const components: Map<string, ComponentBreakdown> = new Map();

        report.corrections.forEach(correction => {
            const componentName = this.extractComponentName(correction.file);
            if (!componentName) return;

            if (!components.has(componentName)) {
                components.set(componentName, {
                    name: componentName,
                    file: correction.file,
                    errors: 0,
                    warnings: 0,
                    suggestions: 0,
                    critical: 0,
                    high: 0,
                    medium: 0,
                    low: 0,
                    corrections: []
                });
            }

            const component = components.get(componentName)!;
            component.corrections.push(correction);

            // Count by type
            if (correction.type === 'error') component.errors++;
            if (correction.type === 'warning') component.warnings++;
            if (correction.type === 'suggestion') component.suggestions++;

            // Count by severity
            if (correction.severity === 'critical') component.critical++;
            if (correction.severity === 'high') component.high++;
            if (correction.severity === 'medium') component.medium++;
            if (correction.severity === 'low') component.low++;
        });

        return Array.from(components.values());
    }

    private analyzeMethods(report: CorrectionReport, projectStructure: any): MethodBreakdown[] {
        const methods: Map<string, MethodBreakdown> = new Map();

        report.corrections.forEach(correction => {
            const methodInfo = this.extractMethodInfo(correction);
            if (!methodInfo) return;

            const methodKey = `${methodInfo.component}.${methodInfo.method}`;
            
            if (!methods.has(methodKey)) {
                methods.set(methodKey, {
                    component: methodInfo.component,
                    method: methodInfo.method,
                    file: correction.file,
                    line: correction.line || 0,
                    errors: 0,
                    corrections: []
                });
            }

            const method = methods.get(methodKey)!;
            method.corrections.push(correction);
            method.errors++;
        });

        return Array.from(methods.values());
    }

    private analyzeInterfaces(report: CorrectionReport, projectStructure: any): InterfaceBreakdown[] {
        const interfaces: Map<string, InterfaceBreakdown> = new Map();

        report.corrections.forEach(correction => {
            const interfaceName = this.extractInterfaceName(correction);
            if (!interfaceName) return;

            if (!interfaces.has(interfaceName)) {
                interfaces.set(interfaceName, {
                    name: interfaceName,
                    file: correction.file,
                    implementations: this.countImplementations(interfaceName, projectStructure),
                    errors: 0,
                    corrections: []
                });
            }

            const interfaceData = interfaces.get(interfaceName)!;
            interfaceData.corrections.push(correction);
            interfaceData.errors++;
        });

        return Array.from(interfaces.values());
    }

    private analyzeImports(report: CorrectionReport, projectStructure: any): ImportBreakdown[] {
        const imports: Map<string, ImportBreakdown> = new Map();

        // Analyze import-related issues
        report.corrections
            .filter(c => c.category === 'import' || c.message?.includes('import'))
            .forEach(correction => {
                if (!imports.has(correction.file)) {
                    imports.set(correction.file, {
                        file: correction.file,
                        imports: [],
                        circularDeps: [],
                        unusedImports: []
                    });
                }

                const importData = imports.get(correction.file)!;
                
                if (correction.message?.includes('circular')) {
                    importData.circularDeps.push(correction.message);
                }
                if (correction.message?.includes('unused')) {
                    importData.unusedImports.push(correction.message);
                }
            });

        return Array.from(imports.values());
    }

    private categorizeIssues(
        report: CorrectionReport, 
        components: ComponentBreakdown[], 
        methods: MethodBreakdown[], 
        interfaces: InterfaceBreakdown[]
    ) {
        return {
            byComponent: this.groupByComponent(components),
            byMethod: this.groupByMethod(methods),
            byInterface: this.groupByInterface(interfaces),
            byFileType: this.groupByFileType(report),
            byComplexity: this.analyzeComplexity(report)
        };
    }

    private groupByComponent(components: ComponentBreakdown[]): Record<string, number> {
        const result: Record<string, number> = {};
        components.forEach(comp => {
            result[comp.name] = comp.corrections.length;
        });
        return result;
    }

    private groupByMethod(methods: MethodBreakdown[]): Record<string, number> {
        const result: Record<string, number> = {};
        methods.forEach(method => {
            const key = `${method.component}.${method.method}`;
            result[key] = method.errors;
        });
        return result;
    }

    private groupByInterface(interfaces: InterfaceBreakdown[]): Record<string, number> {
        const result: Record<string, number> = {};
        interfaces.forEach(intf => {
            result[intf.name] = intf.errors;
        });
        return result;
    }

    private groupByFileType(report: CorrectionReport): Record<string, number> {
        const result: Record<string, number> = {};
        report.corrections.forEach(correction => {
            const ext = path.extname(correction.file);
            result[ext] = (result[ext] || 0) + 1;
        });
        return result;
    }

    private analyzeComplexity(report: CorrectionReport) {
        return {
            simple: report.corrections.filter(c => c.severity === 'low').length,
            moderate: report.corrections.filter(c => c.severity === 'medium').length,
            complex: report.corrections.filter(c => c.severity === 'high' || c.severity === 'critical').length
        };
    }

    private generateSummary(
        components: ComponentBreakdown[], 
        methods: MethodBreakdown[], 
        interfaces: InterfaceBreakdown[]
    ) {
        const affectedComponents = components.filter(c => c.corrections.length > 0).length;
        const affectedMethods = methods.filter(m => m.errors > 0).length;
        const affectedInterfaces = interfaces.filter(i => i.errors > 0).length;

        return {
            totalComponents: components.length,
            totalMethods: methods.length,
            totalInterfaces: interfaces.length,
            affectedComponents,
            affectedMethods,
            affectedInterfaces
        };
    }

    // Helper methods
    private extractComponentName(filePath: string): string | null {
        const baseName = path.basename(filePath, path.extname(filePath));
        // Simple heuristic - could be enhanced with AST parsing
        if (filePath.includes('/components/') || baseName.match(/[A-Z][a-zA-Z]*/)) {
            return baseName;
        }
        return null;
    }

    private extractMethodInfo(correction: Correction): { component: string; method: string } | null {
        // This would need AST parsing for accurate method detection
        // For now, using a simple heuristic
        const componentName = this.extractComponentName(correction.file);
        if (!componentName) return null;


        // Look for method patterns in the message or code
        const message = correction.message || '';
        const code = correction.code || '';
        
        // Look for method patterns in the message or code
        const methodMatch = message.match(/(?:method|function)\s+(\w+)/i) 
                         || code.match(/(\w+)\s*\([^)]*\)\s*{/);
        
        if (methodMatch) {
            return {
                component: componentName,
                method: methodMatch[1]
            };
        }

        return null;
    }

    private extractInterfaceName(correction: Correction): string | null {
        if (correction.file.endsWith('.ts') || correction.file.endsWith('.tsx')) {
            const message = correction.message || '';
            const code = correction.code || '';
            
            const interfaceMatch = message.match(/interface\s+(\w+)/i) 
                                || code.match(/interface\s+(\w+)/);
            if (interfaceMatch) return interfaceMatch[1];
        }
        return null;
    }

    private countImplementations(interfaceName: string, projectStructure: any): number {
        if (!projectStructure?.files) return 0;
        
        return (projectStructure.files as ProjectFile[]).filter(file => 
            file.content?.includes(`implements ${interfaceName}`) || 
            file.content?.includes(`extends ${interfaceName}`)
        ).length;
    }
}