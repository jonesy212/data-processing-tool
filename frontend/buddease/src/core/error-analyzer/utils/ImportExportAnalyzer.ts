// src/app/error-analyzer/utils/ImportExportAnalyzer.ts

import * as ts from 'typescript';
import fs from 'fs';
import path from 'path';

export interface ImportExportIssue {
    filePath: string;
    line: number;
    column: number;
    type: 'type-only-import' | 'missing-export' | 'default-export' | 'named-export';
    message: string;
    fix: string;
    severity: 'error' | 'warning';
}

export interface ExportInfo {
    name: string;
    isTypeOnly: boolean;
    isDefault: boolean;
    position: { line: number; column: number };
}

export interface ImportInfo {
    name: string;
    isTypeOnly: boolean;
    isDefault: boolean;
    modulePath: string;
    position: { line: number; column: number };
}

export class ImportExportAnalyzer {
    private program?: ts.Program;
    private typeChecker?: ts.TypeChecker;

    async analyzeFile(filePath: string): Promise<ImportExportIssue[]> {
        if (!fs.existsSync(filePath)) {
            return [];
        }

        const sourceCode = fs.readFileSync(filePath, 'utf8');
        const sourceFile = ts.createSourceFile(
            filePath,
            sourceCode,
            ts.ScriptTarget.Latest,
            true
        );

        const issues: ImportExportIssue[] = [];
        const imports: ImportInfo[] = [];
        const exports: ExportInfo[] = [];

        // First pass: collect all imports and exports
        this.collectImportsExports(sourceFile, imports, exports);

        // Second pass: analyze for issues
        for (const imp of imports) {
            const issue = await this.analyzeImport(imp, filePath);
            if (issue) {
                issues.push(issue);
            }
        }

        // Check for export issues
        issues.push(...this.analyzeExports(sourceFile, exports));

        return issues;
    }

    private collectImportsExports(
        sourceFile: ts.SourceFile,
        imports: ImportInfo[],
        exports: ExportInfo[]
    ): void {
        const visit = (node: ts.Node): void => {
            // Collect imports
            if (ts.isImportDeclaration(node)) {
                const importInfo = this.parseImport(node, sourceFile);
                imports.push(...importInfo);
            }

            // Collect exports
            if (this.isExportNode(node)) {
                const exportInfo = this.parseExport(node, sourceFile);
                exports.push(...exportInfo);
            }

            ts.forEachChild(node, visit);
        };

        visit(sourceFile);
    }

    private parseImport(node: ts.ImportDeclaration, sourceFile: ts.SourceFile): ImportInfo[] {
        const imports: ImportInfo[] = [];
        const moduleSpecifier = (node.moduleSpecifier as ts.StringLiteral)?.text;
        if (!moduleSpecifier) return imports;

        const isTypeOnly = node.importClause?.isTypeOnly || false;

        if (node.importClause) {
            // Default import
            if (node.importClause.name) {
                const position = this.getNodePosition(node.importClause.name, sourceFile);
                imports.push({
                    name: node.importClause.name.text,
                    isTypeOnly,
                    isDefault: true,
                    modulePath: moduleSpecifier,
                    position
                });
            }

            // Named imports
            if (node.importClause.namedBindings) {
                if (ts.isNamedImports(node.importClause.namedBindings)) {
                    node.importClause.namedBindings.elements.forEach(element => {
                        const position = this.getNodePosition(element, sourceFile);
                        imports.push({
                            name: element.name.text,
                            isTypeOnly: element.isTypeOnly || isTypeOnly,
                            isDefault: false,
                            modulePath: moduleSpecifier,
                            position
                        });
                    });
                } else if (ts.isNamespaceImport(node.importClause.namedBindings)) {
                    const position = this.getNodePosition(node.importClause.namedBindings.name, sourceFile);
                    imports.push({
                        name: node.importClause.namedBindings.name.text,
                        isTypeOnly,
                        isDefault: false,
                        modulePath: moduleSpecifier,
                        position
                    });
                }
            }
        }

        return imports;
    }

    private parseExport(node: ts.Node, sourceFile: ts.SourceFile): ExportInfo[] {
        const exports: ExportInfo[] = [];

        if (ts.isExportDeclaration(node)) {
            // export { name } or export type { name }
            const isTypeOnly = node.isTypeOnly || false;
            
            if (node.exportClause && ts.isNamedExports(node.exportClause)) {
                node.exportClause.elements.forEach(element => {
                    const position = this.getNodePosition(element, sourceFile);
                    exports.push({
                        name: element.name.text,
                        isTypeOnly,
                        isDefault: false,
                        position
                    });
                });
            }
        } else if (this.hasExportModifier(node)) {
            // export class, interface, function, etc.
            const isTypeOnly = this.isTypeOnlyNode(node);
            const name = this.getNodeName(node);
            
            if (name) {
                const position = this.getNodePosition(node, sourceFile);
                exports.push({
                    name,
                    isTypeOnly,
                    isDefault: false,
                    position
                });
            }
        } else if (ts.isExportAssignment(node)) {
            // export default ...
            const name = 'default';
            const position = this.getNodePosition(node, sourceFile);
            exports.push({
                name,
                isTypeOnly: false,
                isDefault: true,
                position
            });
        }

        return exports;
    }

    private async analyzeImport(imp: ImportInfo, currentFile: string): Promise<ImportExportIssue | null> {
        // Resolve the module path
        const modulePath = this.resolveModulePath(imp.modulePath, currentFile);
        if (!modulePath || !fs.existsSync(modulePath)) {
            return null;
        }

        // Read the imported file to check its exports
        const importedExports = await this.getExportsFromFile(modulePath);

        // Find if the imported name exists in the exports
        const matchingExport = importedExports.find(
            exp => exp.name === imp.name || (imp.isDefault && exp.isDefault)
        );

        if (!matchingExport) {
            // Import doesn't exist in exports
            return {
                filePath: currentFile,
                line: imp.position.line,
                column: imp.position.column,
                type: 'missing-export',
                message: `'${imp.name}' is not exported from '${imp.modulePath}'`,
                fix: this.suggestImportFix(imp, importedExports),
                severity: 'error'
            };
        }

        // Check if we need type-only import
        if (matchingExport.isTypeOnly && !imp.isTypeOnly) {
            return {
                filePath: currentFile,
                line: imp.position.line,
                column: imp.position.column,
                type: 'type-only-import',
                message: `'${imp.name}' is exported as a type from '${imp.modulePath}' and should be imported with 'import type'`,
                fix: `import type { ${imp.name} } from '${imp.modulePath}'`,
                severity: 'error'
            };
        }

        // Check if we're importing a value as type-only unnecessarily
        if (!matchingExport.isTypeOnly && imp.isTypeOnly) {
            // This is usually fine, but we can warn about it
            return {
                filePath: currentFile,
                line: imp.position.line,
                column: imp.position.column,
                type: 'type-only-import',
                message: `'${imp.name}' is exported as a runtime value but imported as type-only`,
                fix: `import { ${imp.name} } from '${imp.modulePath}'`,
                severity: 'warning'
            };
        }

        return null;
    }

    private analyzeExports(sourceFile: ts.SourceFile, exports: ExportInfo[]): ImportExportIssue[] {
        const issues: ImportExportIssue[] = [];
        
        // Check for interfaces/type aliases that should be exported as types
        const visitor = (node: ts.Node): void => {
            if ((ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) && 
                this.hasExportModifier(node)) {
                const name = this.getNodeName(node);
                const exportInfo = exports.find(exp => exp.name === name);
                
                if (exportInfo && !exportInfo.isTypeOnly) {
                    const position = this.getNodePosition(node, sourceFile);
                    issues.push({
                        filePath: sourceFile.fileName,
                        line: position.line,
                        column: position.column,
                        type: 'type-only-import',
                        message: `Interface/Type '${name}' should be exported with 'export type'`,
                        fix: `export type { ${name} };`,
                        severity: 'warning'
                    });
                }
            }
            ts.forEachChild(node, visitor);
        };
        
        visitor(sourceFile);
        return issues;
    }

    private suggestImportFix(imp: ImportInfo, exportedNames: ExportInfo[]): string {
        // Find similar names (typo detection)
        const similarNames = exportedNames
            .filter(exp => this.isSimilarName(exp.name, imp.name))
            .map(exp => exp.name);

        if (similarNames.length > 0) {
            return `Did you mean: ${similarNames.join(', ')}? Available exports: ${exportedNames.map(e => e.name).join(', ')}`;
        }

        // Check if it's a default export
        const hasDefault = exportedNames.some(exp => exp.isDefault);
        if (hasDefault) {
            return `Try: import ${imp.name} from '${imp.modulePath}' (default import)`;
        }

        return `Available exports from '${imp.modulePath}': ${exportedNames.map(e => e.name).join(', ')}`;
    }

    private async getExportsFromFile(filePath: string): Promise<ExportInfo[]> {
        if (!fs.existsSync(filePath)) {
            return [];
        }

        const sourceCode = fs.readFileSync(filePath, 'utf8');
        const sourceFile = ts.createSourceFile(
            filePath,
            sourceCode,
            ts.ScriptTarget.Latest,
            true
        );

        const exports: ExportInfo[] = [];
        const visit = (node: ts.Node): void => {
            if (this.isExportNode(node)) {
                const exportInfo = this.parseExport(node, sourceFile);
                exports.push(...exportInfo);
            }
            ts.forEachChild(node, visit);
        };

        visit(sourceFile);
        return exports;
    }

    private resolveModulePath(moduleSpecifier: string, currentFile: string): string | null {
        // Simple resolution - in a real app, you'd use TypeScript's module resolution
        if (moduleSpecifier.startsWith('@/')) {
            const projectRoot = path.join(process.cwd(), 'src');
            return path.join(projectRoot, moduleSpecifier.replace('@/', '')) + '.ts';
        } else if (moduleSpecifier.startsWith('.')) {
            const dir = path.dirname(currentFile);
            const resolved = path.resolve(dir, moduleSpecifier);
            
            // Try with .ts extension first
            if (fs.existsSync(resolved + '.ts')) return resolved + '.ts';
            if (fs.existsSync(resolved + '.tsx')) return resolved + '.tsx';
            if (fs.existsSync(resolved)) return resolved;
            
            // Try index file
            const indexPath = path.join(resolved, 'index.ts');
            if (fs.existsSync(indexPath)) return indexPath;
        }
        
        return null;
    }

    // Helper methods
    private isSimilarName(name1: string, name2: string): boolean {
        // Simple similarity check
        const distance = this.levenshteinDistance(name1.toLowerCase(), name2.toLowerCase());
        return distance <= 2 && distance < Math.max(name1.length, name2.length) / 2;
    }

    private levenshteinDistance(a: string, b: string): number {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                matrix[i][j] = b.charAt(i - 1) === a.charAt(j - 1)
                    ? matrix[i - 1][j - 1]
                    : Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
            }
        }

        return matrix[b.length][a.length];
    }

    private getNodePosition(node: ts.Node, sourceFile: ts.SourceFile): { line: number; column: number } {
        const start = node.getStart();
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(start);
        return { line: line + 1, column: character + 1 };
    }

    private getNodeName(node: ts.Node): string | null {
        if (ts.isInterfaceDeclaration(node) || 
            ts.isClassDeclaration(node) || 
            ts.isTypeAliasDeclaration(node) ||
            ts.isFunctionDeclaration(node) ||
            ts.isEnumDeclaration(node)) {
            return node.name?.text || null;
        }
        return null;
    }

    private isTypeOnlyNode(node: ts.Node): boolean {
        // Interfaces and type aliases are type-only
        return ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node);
    }

    private isExportNode(node: ts.Node): boolean {
        return ts.isExportDeclaration(node) || 
               ts.isExportAssignment(node) || 
               this.hasExportModifier(node);
    }

    private hasExportModifier(node: ts.Node): boolean {
        const hasModifiers = (n: ts.Node): n is ts.Node & { modifiers?: ts.Modifier[] } => {
            return ts.isClassDeclaration(n) || 
                   ts.isFunctionDeclaration(n) || 
                   ts.isInterfaceDeclaration(n) || 
                   ts.isTypeAliasDeclaration(n) ||
                   ts.isVariableStatement(n) ||
                   ts.isEnumDeclaration(n);
        };

        if (hasModifiers(node)) {
            return !!node.modifiers?.some(modifier => 
                modifier.kind === ts.SyntaxKind.ExportKeyword
            );
        }
        return false;
    }
}