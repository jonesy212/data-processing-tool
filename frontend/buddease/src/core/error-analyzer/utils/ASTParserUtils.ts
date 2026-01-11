// src/app/error-analyzer/utils/ASTParserUtils.ts

import * as ts from 'typescript';
import fs from 'fs';
import path from 'path';

export interface ASTNodeInfo {
    type: string;
    name?: string;
    kind: ts.SyntaxKind;
    position: {
        start: number;
        end: number;
        line: number;
        column: number;
    };
    children?: ASTNodeInfo[];
    parent?: ASTNodeInfo;
}

export interface TypeInfo {
    name: string;
    kind: 'interface' | 'type' | 'class' | 'enum' | 'function';
    members: MemberInfo[];
    extends?: string[];
    implements?: string[];
    file: string;
    position: ASTNodeInfo['position'];
}

export interface MemberInfo {
    name: string;
    type: string;
    optional: boolean;
    kind: 'property' | 'method' | 'constructor';
    position: ASTNodeInfo['position'];
}

export interface ImportInfo {
    module: string;
    imports: string[];
    isDefault: boolean;
    isNamespace: boolean;
    position: ASTNodeInfo['position'];
}

export class ASTParserUtils {
    private program?: ts.Program;
    private typeChecker?: ts.TypeChecker;

    constructor(private projectRoot: string = process.cwd()) { }

    
    async parseFile(filePath: string): Promise<{
        imports: ImportInfo[];
        exports: TypeInfo[];
        types: TypeInfo[];
        functions: Array<{ name: string; returnType: string; parameters: Array<{ name: string; type: string }> }>;
    }> {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const sourceCode = fs.readFileSync(filePath, 'utf8');
        const sourceFile = ts.createSourceFile(
            filePath,
            sourceCode,
            ts.ScriptTarget.Latest,
            true
        );

        return this.parseSourceFile(sourceFile, filePath);
    }

        parseSourceFile(sourceFile: ts.SourceFile, filePath: string): {
            imports: ImportInfo[];
            exports: TypeInfo[];
            types: TypeInfo[];
            functions: Array<{ name: string; returnType: string; parameters: Array<{ name: string; type: string }> }>;
        } {

        const imports: ImportInfo[] = [];
        const exports: TypeInfo[] = [];
        const types: TypeInfo[] = [];
        const functions: Array<{ name: string; returnType: string; parameters: Array<{ name: string; type: string }> }> = [];

        const visit = (node: ts.Node): void => {
            // Parse imports
            if (ts.isImportDeclaration(node)) {
                const importInfo = this.parseImportDeclaration(node, sourceFile);
                if (importInfo) {
                    imports.push(importInfo);
                }
            }

            // Parse exports
            if (this.isExportNode(node)) {
                const exportInfo = this.parseExportNode(node, sourceFile);
                if (exportInfo) {
                    exports.push(exportInfo);
                }
            }

            // Parse type declarations
            if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isClassDeclaration(node)) {
                const typeInfo = this.parseTypeDeclaration(node, sourceFile, filePath);
                if (typeInfo) {
                    types.push(typeInfo);

                    // If it's exported, also add to exports
                    if (this.hasExportModifier(node)) {
                        exports.push(typeInfo);
                    }
                }
            }

            // Parse function declarations
            if (ts.isFunctionDeclaration(node) && node.name) {
                const funcInfo = this.parseFunctionDeclaration(node, sourceFile);
                if (funcInfo) {
                    functions.push(funcInfo);
                }
            }

            // Visit child nodes
            ts.forEachChild(node, visit);
        };

        visit(sourceFile);

        return { imports, exports, types, functions };
    }

    async findTypeDefinition(typeName: string, searchPaths: string[] = []): Promise<TypeInfo | null> {
        // Search in provided paths first
        for (const searchPath of searchPaths) {
            if (fs.existsSync(searchPath)) {
                const stats = fs.statSync(searchPath);

                if (stats.isDirectory()) {
                    // Search directory
                    const files = await this.getAllTypeScriptFiles(searchPath);
                    for (const file of files) {
                        try {
                            const { types } = await this.parseFile(file);
                            const foundType = types.find(t => t.name === typeName);
                            if (foundType) {
                                return foundType;
                            }
                        } catch {
                            // Skip files that can't be parsed
                        }
                    }
                } else if (stats.isFile() && searchPath.endsWith('.ts') || searchPath.endsWith('.tsx')) {
                    // Search single file
                    try {
                        const { types } = await this.parseFile(searchPath);
                        const foundType = types.find(t => t.name === typeName);
                        if (foundType) {
                            return foundType;
                        }
                    } catch {
                        // Skip files that can't be parsed
                    }
                }
            }
        }

        // Search in project root if not found
        const srcPath = path.join(this.projectRoot, 'src');
        if (fs.existsSync(srcPath)) {
            const files = await this.getAllTypeScriptFiles(srcPath);
            for (const file of files) {
                try {
                    const { types } = await this.parseFile(file);
                    const foundType = types.find(t => t.name === typeName);
                    if (foundType) {
                        return foundType;
                    }
                } catch {
                    // Skip files that can't be parsed
                }
            }
        }

        return null;
    }

    async findImportSource(identifier: string, currentFile: string): Promise<string | null> {
        const { imports } = await this.parseFile(currentFile);

        // Check if identifier is already imported
        for (const imp of imports) {
            if (imp.imports.includes(identifier)) {
                return imp.module;
            }
        }

        // Search for export in project
        const srcPath = path.join(this.projectRoot, 'src');
        if (fs.existsSync(srcPath)) {
            const files = await this.getAllTypeScriptFiles(srcPath);

            for (const file of files) {
                if (file === currentFile) continue;

                try {
                    const { exports } = await this.parseFile(file);
                    const foundExport = exports.find(e => e.name === identifier);
                    if (foundExport) {
                        return this.getRelativeImportPath(currentFile, file);
                    }
                } catch {
                    // Skip files that can't be parsed
                }
            }
        }

        return null;
    }

    async analyzeTypeRelationships(filePath: string): Promise<Map<string, string[]>> {
        const { types } = await this.parseFile(filePath);
        const relationships = new Map<string, string[]>();

        for (const typeInfo of types) {
            const dependencies: string[] = [];

            // Check for extends/implements
            if (typeInfo.extends) {
                dependencies.push(...typeInfo.extends);
            }
            if (typeInfo.implements) {
                dependencies.push(...typeInfo.implements);
            }

            // Check member types
            for (const member of typeInfo.members) {
                const memberDeps = this.extractTypeReferences(member.type);
                dependencies.push(...memberDeps);
            }

            relationships.set(typeInfo.name, [...new Set(dependencies)]);
        }

        return relationships;
    }

    async detectCircularDependencies(filePath: string): Promise<string[][]> {
        const relationships = await this.analyzeTypeRelationships(filePath);
        const cycles: string[][] = [];
        const visited = new Set<string>();
        const recursionStack = new Set<string>();

        const dfs = (type: string, path: string[]): void => {
            if (recursionStack.has(type)) {
                // Found a cycle
                const startIndex = path.indexOf(type);
                if (startIndex !== -1) {
                    const cycle = path.slice(startIndex);
                    cycles.push([...cycle]);
                }
                return;
            }

            if (visited.has(type)) {
                return;
            }

            visited.add(type);
            recursionStack.add(type);
            path.push(type);

            const dependencies = relationships.get(type) || [];
            for (const dep of dependencies) {
                dfs(dep, path);
            }

            recursionStack.delete(type);
            path.pop();
        };

        for (const type of relationships.keys()) {
            if (!visited.has(type)) {
                dfs(type, []);
            }
        }

        return cycles;
    }

    private parseImportDeclaration(node: ts.ImportDeclaration, sourceFile: ts.SourceFile): ImportInfo | null {
        const moduleSpecifier = node.moduleSpecifier as ts.StringLiteral;
        if (!moduleSpecifier) return null;

        const module = moduleSpecifier.text;
        const imports: string[] = [];
        let isDefault = false;
        let isNamespace = false;

        if (node.importClause) {
            // Default import
            if (node.importClause.name) {
                imports.push(node.importClause.name.text);
                isDefault = true;
            }

            // Named imports
            if (node.importClause.namedBindings) {
                if (ts.isNamedImports(node.importClause.namedBindings)) {
                    node.importClause.namedBindings.elements.forEach(element => {
                        imports.push(element.name.text);
                    });
                } else if (ts.isNamespaceImport(node.importClause.namedBindings)) {
                    imports.push(node.importClause.namedBindings.name.text);
                    isNamespace = true;
                }
            }
        }

        const position = this.getNodePosition(node, sourceFile);

        return {
            module,
            imports,
            isDefault,
            isNamespace,
            position
        };
    }

    private parseExportNode(node: ts.Node, sourceFile: ts.SourceFile): TypeInfo | null {
        if (ts.isInterfaceDeclaration(node)) {
            return this.parseInterfaceDeclaration(node, sourceFile, '');
        } else if (ts.isTypeAliasDeclaration(node)) {
            return this.parseTypeAliasDeclaration(node, sourceFile, '');
        } else if (ts.isClassDeclaration(node) && node.name) {
            return this.parseClassDeclaration(node, sourceFile, '');
        } else if (ts.isVariableStatement(node) && this.hasExportModifier(node)) {
            // Handle exported variables
            return null;
        } else if (ts.isFunctionDeclaration(node) && node.name && this.hasExportModifier(node)) {
            // Handle exported functions
            const funcInfo = this.parseFunctionDeclaration(node, sourceFile);
            if (funcInfo) {
                return {
                    name: funcInfo.name,
                    kind: 'function' as any, // You might want to add 'function' to the kind union type
                    members: [],
                    file: '',
                    position: this.getNodePosition(node, sourceFile)
                };
            }
        }

        return null;
    }

    private createSourceFile(fileName: string, content: string, target: ts.ScriptTarget, setParentNodes: boolean): ts.SourceFile {
        return ts.createSourceFile(fileName, content, target, setParentNodes);
    }

    private parseTypeDeclaration(node: ts.Node, sourceFile: ts.SourceFile, filePath: string): TypeInfo | null {
        if (ts.isInterfaceDeclaration(node)) {
            return this.parseInterfaceDeclaration(node, sourceFile, filePath);
        } else if (ts.isTypeAliasDeclaration(node)) {
            return this.parseTypeAliasDeclaration(node, sourceFile, filePath);
        } else if (ts.isClassDeclaration(node) && node.name) {
            return this.parseClassDeclaration(node, sourceFile, filePath);
        }

        return null;
    }

    private parseInterfaceDeclaration(node: ts.InterfaceDeclaration, sourceFile: ts.SourceFile, filePath: string): TypeInfo {
        const name = node.name.text;
        const members: MemberInfo[] = [];
        const extendsClauses: string[] = [];

        // Parse extends clauses
        if (node.heritageClauses) {
            for (const clause of node.heritageClauses) {
                if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
                    clause.types.forEach(type => {
                        const typeName = this.getTypeName(type.expression);
                        if (typeName) {
                            extendsClauses.push(typeName);
                        }
                    });
                }
            }
        }

        // Parse members
        node.members.forEach(member => {
            if (ts.isPropertySignature(member) && member.name && ts.isIdentifier(member.name)) {
                const memberName = member.name.text;
                const memberType = member.type ? this.typeToString(member.type, sourceFile) : 'any';
                const optional = member.questionToken !== undefined;

                members.push({
                    name: memberName,
                    type: memberType,
                    optional,
                    kind: 'property',
                    position: this.getNodePosition(member, sourceFile)
                });
            } else if (ts.isMethodSignature(member) && member.name && ts.isIdentifier(member.name)) {
                const memberName = member.name.text;
                const returnType = member.type ? this.typeToString(member.type, sourceFile) : 'void';
                const optional = member.questionToken !== undefined;

                members.push({
                    name: memberName,
                    type: returnType,
                    optional,
                    kind: 'method',
                    position: this.getNodePosition(member, sourceFile)
                });
            }
        });

        const position = this.getNodePosition(node, sourceFile);

        return {
            name,
            kind: 'interface',
            members,
            extends: extendsClauses,
            file: filePath,
            position
        };
    }

    private parseTypeAliasDeclaration(node: ts.TypeAliasDeclaration, sourceFile: ts.SourceFile, filePath: string): TypeInfo {
        const name = node.name.text;
        const type = this.typeToString(node.type, sourceFile);

        // Extract members from type alias (simplified)
        const members: MemberInfo[] = this.extractMembersFromType(node.type, sourceFile);

        const position = this.getNodePosition(node, sourceFile);

        return {
            name,
            kind: 'type',
            members,
            file: filePath,
            position
        };
    }

    private parseClassDeclaration(node: ts.ClassDeclaration, sourceFile: ts.SourceFile, filePath: string): TypeInfo {
        const name = node.name ? node.name.text : 'AnonymousClass';
        const members: MemberInfo[] = [];
        const extendsClauses: string[] = [];
        const implementsClauses: string[] = [];

        // Parse extends/implements
        if (node.heritageClauses) {
            for (const clause of node.heritageClauses) {
                if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
                    clause.types.forEach(type => {
                        const typeName = this.getTypeName(type.expression);
                        if (typeName) {
                            extendsClauses.push(typeName);
                        }
                    });
                } else if (clause.token === ts.SyntaxKind.ImplementsKeyword) {
                    clause.types.forEach(type => {
                        const typeName = this.getTypeName(type.expression);
                        if (typeName) {
                            implementsClauses.push(typeName);
                        }
                    });
                }
            }
        }

        // Parse members
        node.members.forEach(member => {
            if (ts.isPropertyDeclaration(member) && member.name && ts.isIdentifier(member.name)) {
                const memberName = member.name.text;
                const memberType = member.type ? this.typeToString(member.type, sourceFile) : 'any';

                members.push({
                    name: memberName,
                    type: memberType,
                    optional: member.questionToken !== undefined,
                    kind: 'property',
                    position: this.getNodePosition(member, sourceFile)
                });
            } else if (ts.isMethodDeclaration(member) && member.name && ts.isIdentifier(member.name)) {
                const memberName = member.name.text;
                const returnType = member.type ? this.typeToString(member.type, sourceFile) : 'void';

                members.push({
                    name: memberName,
                    type: returnType,
                    optional: member.questionToken !== undefined,
                    kind: 'method',
                    position: this.getNodePosition(member, sourceFile)
                });
            } else if (ts.isConstructorDeclaration(member)) {
                members.push({
                    name: 'constructor',
                    type: '',
                    optional: false,
                    kind: 'constructor',
                    position: this.getNodePosition(member, sourceFile)
                });
            }
        });

        const position = this.getNodePosition(node, sourceFile);

        return {
            name,
            kind: 'class',
            members,
            extends: extendsClauses,
            implements: implementsClauses,
            file: filePath,
            position
        };
    }

    private parseFunctionDeclaration(node: ts.FunctionDeclaration, sourceFile: ts.SourceFile): {
        name: string;
        returnType: string;
        parameters: Array<{ name: string; type: string }>;
    } | null {
        if (!node.name) return null;

        const name = node.name.text;
        const returnType = node.type ? this.typeToString(node.type, sourceFile) : 'void';
        const parameters: Array<{ name: string; type: string }> = [];

        node.parameters.forEach(param => {
            if (ts.isIdentifier(param.name)) {
                const paramName = param.name.text;
                const paramType = param.type ? this.typeToString(param.type, sourceFile) : 'any';
                parameters.push({ name: paramName, type: paramType });
            }
        });

        return { name, returnType, parameters };
    }

    private extractMembersFromType(type: ts.TypeNode, sourceFile: ts.SourceFile): MemberInfo[] {
        const members: MemberInfo[] = [];

        const extract = (node: ts.Node): void => {
            if (ts.isTypeLiteralNode(node)) {
                node.members.forEach(member => {
                    if (ts.isPropertySignature(member) && member.name && ts.isIdentifier(member.name)) {
                        const name = member.name.text;
                        const type = member.type ? this.typeToString(member.type, sourceFile) : 'any';
                        const optional = member.questionToken !== undefined;

                        members.push({
                            name,
                            type,
                            optional,
                            kind: 'property',
                            position: this.getNodePosition(member, sourceFile)
                        });
                    }
                });
            } else if (ts.isIntersectionTypeNode(node) || ts.isUnionTypeNode(node)) {
                node.types.forEach(extract);
            }
        };

        extract(type);
        return members;
    }

    private getTypeName(expression: ts.Expression): string | null {
        if (ts.isIdentifier(expression)) {
            return expression.text;
        } else if (ts.isPropertyAccessExpression(expression)) {
            return this.getTypeName(expression.expression) + '.' + expression.name.text;
        }
        return null;
    }

    private typeToString(type: ts.TypeNode, sourceFile: ts.SourceFile): string {
        const printer = ts.createPrinter();
        return printer.printNode(ts.EmitHint.Unspecified, type, sourceFile);
    }

    private getNodePosition(node: ts.Node, sourceFile: ts.SourceFile): ASTNodeInfo['position'] {
        const start = node.getStart();
        const end = node.getEnd();
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(start);

        return {
            start,
            end,
            line: line + 1,
            column: character + 1
        };
    }

    private extractTypeReferences(typeString: string): string[] {
        const references: string[] = [];
        const typeRegex = /[A-Z][a-zA-Z0-9_$]*/g;

        const primitives = new Set(['string', 'number', 'boolean', 'any', 'void', 'null', 'undefined']);

        let match;
        while ((match = typeRegex.exec(typeString)) !== null) {
            const typeName = match[0];
            if (!primitives.has(typeName)) {
                references.push(typeName);
            }
        }

        return references;
    }

    private getRelativeImportPath(fromFile: string, toFile: string): string {
        const fromDir = path.dirname(fromFile);
        const toDir = path.dirname(toFile);

        let relativePath = path.relative(fromDir, toFile).replace(/\.(ts|tsx)$/, '');

        if (!relativePath.startsWith('.')) {
            relativePath = './' + relativePath;
        }

        return relativePath.replace(/\/index$/, '');
    }

    private async getAllTypeScriptFiles(dir: string): Promise<string[]> {
        const files: string[] = [];

        try {
            const entries = await fs.promises.readdir(dir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);

                if (entry.isDirectory()) {
                    if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
                        files.push(...await this.getAllTypeScriptFiles(fullPath));
                    }
                } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
                    files.push(fullPath);
                }
            }
        } catch {
            // Ignore directory errors
        }

        return files;
    }

    private isExportNode(node: ts.Node): boolean {
        // Check for export declarations
        if (ts.isExportDeclaration(node) || ts.isExportAssignment(node)) {
            return true;
        }
        
        // Check for nodes with export modifiers
        return this.hasExportModifier(node);
    }

    private hasExportModifier(node: ts.Node): boolean {
        // Type guard functions for nodes that can have modifiers
        const hasModifiers = (n: ts.Node): n is ts.Node & { modifiers?: ts.Modifier[] } => {
            return ts.isClassDeclaration(n) || 
                ts.isFunctionDeclaration(n) || 
                ts.isInterfaceDeclaration(n) || 
                ts.isTypeAliasDeclaration(n) ||
                ts.isVariableStatement(n) ||
                ts.isEnumDeclaration(n) ||
                ts.isModuleDeclaration(n);
        };

        if (hasModifiers(node)) {
            return !!node.modifiers?.some((modifier: ts.Modifier) =>
                modifier.kind === ts.SyntaxKind.ExportKeyword
            );
        }
        return false;
    }

    async analyzeFileDependencies(filePath: string): Promise<string[]> {
        const { imports } = await this.parseFile(filePath);
        return imports.map(imp => imp.module);
    }

    generateASTReport(filePath: string): string {
        try {
            const sourceCode = fs.readFileSync(filePath, 'utf8');
            const sourceFile = ts.createSourceFile(
                filePath,
                sourceCode,
                ts.ScriptTarget.Latest,
                true
            );

            const { imports, exports, types, functions } = this.parseSourceFile(sourceFile, filePath);

            const lines: string[] = [];

            lines.push('# AST Analysis Report');
            lines.push(`**File:** ${filePath}`);
            lines.push(`**Generated:** ${new Date().toISOString()}`);
            lines.push('');

            lines.push('## 📥 Imports');
            lines.push('');
            if (imports.length === 0) {
                lines.push('No imports found');
            } else {
                for (const imp of imports) {
                    lines.push(`- **${imp.module}**: ${imp.imports.join(', ')}`);
                }
            }
            lines.push('');

            lines.push('## 📤 Exports');
            lines.push('');
            if (exports.length === 0) {
                lines.push('No exports found');
            } else {
                for (const exp of exports) {
                    lines.push(`- **${exp.name}** (${exp.kind})`);
                    if (exp.members.length > 0) {
                        lines.push(`  Members: ${exp.members.length}`);
                    }
                }
            }
            lines.push('');

            lines.push('## 🏗️ Types');
            lines.push('');
            if (types.length === 0) {
                lines.push('No types found');
            } else {
                for (const type of types) {
                    lines.push(`### ${type.name} (${type.kind})`);
                    lines.push(`**File:** ${type.file}`);
                    if (type.extends && type.extends.length > 0) {
                        lines.push(`**Extends:** ${type.extends.join(', ')}`);
                    }
                    if (type.implements && type.implements.length > 0) {
                        lines.push(`**Implements:** ${type.implements.join(', ')}`);
                    }
                    if (type.members.length > 0) {
                        lines.push(`**Members (${type.members.length}):**`);
                        for (const member of type.members.slice(0, 5)) {
                            lines.push(`  - ${member.name}: ${member.type}${member.optional ? '?' : ''}`);
                        }
                        if (type.members.length > 5) {
                            lines.push(`  ... and ${type.members.length - 5} more`);
                        }
                    }
                    lines.push('');
                }
            }

            lines.push('## ⚙️ Functions');
            lines.push('');
            if (functions.length === 0) {
                lines.push('No functions found');
            } else {
                for (const func of functions.slice(0, 5)) {
                    lines.push(`- **${func.name}**`);
                    lines.push(`  Returns: ${func.returnType}`);
                    if (func.parameters.length > 0) {
                        lines.push(`  Parameters: ${func.parameters.map(p => `${p.name}: ${p.type}`).join(', ')}`);
                    }
                }
                if (functions.length > 5) {
                    lines.push(`... and ${functions.length - 5} more functions`);
                }
            }

            return lines.join('\n');

        } catch (error) {
            return `# AST Analysis Failed\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    }


















        // ========== PUBLIC API ==========

    /**
     * Calculate relative import path between two TypeScript files
     * 
     * @param fromPath - Source file path (where import statement will be)
     * @param toPath - Target file path (what will be imported)
     * @returns Relative import path suitable for TypeScript import statements
     * 
     * @example
     * ```typescript
     * const parser = new ASTParserUtils();
     * const relativePath = parser.calculateImportPath(
     *   '/project/src/app/components/Button.tsx',
     *   '/project/src/app/utils/helpers.ts'
     * );
     * // Returns: '../utils/helpers'
     * ```
     */
    public calculateImportPath(fromPath: string, toPath: string): string {
        return this.getRelativeImportPath(fromPath, toPath);
    }

    /**
     * Calculate import path with validation and normalization
     * 
     * @param fromPath - Source file path
     * @param toPath - Target file path
     * @param options - Configuration options
     * @returns Normalized import path
     */
    public calculateNormalizedImportPath(
        fromPath: string, 
        toPath: string, 
        options: {
            preserveExtension?: boolean;
            normalizeAliases?: boolean;
            projectAliases?: Record<string, string>;
        } = {}
    ): string {
        const {
            preserveExtension = false,
            normalizeAliases = true,
            projectAliases = {}
        } = options;

        let importPath = this.getRelativeImportPath(fromPath, toPath);

        // Handle path aliases
        if (normalizeAliases && Object.keys(projectAliases).length > 0) {
            importPath = this.normalizePathAlias(importPath, projectAliases);
        }

        // Add extension if requested
        if (preserveExtension) {
            const ext = path.extname(toPath);
            if (ext) {
                importPath += ext;
            }
        }

        return importPath;
    }

    /**
     * Calculate import path for multiple files
     * 
     * @param fromPath - Source file path
     * @param toPaths - Array of target file paths
     * @returns Map of file paths to their relative import paths
     */
    public calculateImportPaths(
        fromPath: string, 
        toPaths: string[]
    ): Map<string, string> {
        const importPaths = new Map<string, string>();
        
        for (const toPath of toPaths) {
            importPaths.set(toPath, this.getRelativeImportPath(fromPath, toPath));
        }
        
        return importPaths;
    }

    /**
     * Calculate the most efficient import path (chooses between relative and alias)
     * 
     * @param fromPath - Source file path
     * @param toPath - Target file path
     * @param aliases - Path aliases configuration (e.g., {'@/': 'src/'})
     * @returns The most efficient import path (relative or alias)
     */
    public calculateOptimalImportPath(
        fromPath: string,
        toPath: string,
        aliases: Record<string, string> = {}
    ): string {
        const relativePath = this.getRelativeImportPath(fromPath, toPath);
        
        // Check if any alias would be more efficient
        let optimalPath = relativePath;
        let optimalDepth = this.calculatePathDepth(relativePath);
        
        for (const [alias, aliasPath] of Object.entries(aliases)) {
            const fromProjectPath = path.relative(this.projectRoot, fromPath);
            const toProjectPath = path.relative(this.projectRoot, toPath);
            
            // Check if target is under alias path
            if (toProjectPath.startsWith(aliasPath)) {
                const aliasImportPath = alias + toProjectPath.slice(aliasPath.length)
                    .replace(/\.(ts|tsx)$/, '');
                
                const aliasDepth = this.calculatePathDepth(aliasImportPath);
                
                if (aliasDepth < optimalDepth) {
                    optimalPath = aliasImportPath;
                    optimalDepth = aliasDepth;
                }
            }
        }
        
        return optimalPath;
    }

    /**
     * Generate import statement with proper formatting
     * 
     * @param fromPath - Source file path
     * @param toPath - Target file path
     * @param exportNames - Array of export names to import
     * @param isDefaultImport - Whether it's a default import
     * @returns Complete import statement
     */
    public generateImportStatement(
        fromPath: string,
        toPath: string,
        exportNames: string[] = [],
        isDefaultImport: boolean = false
    ): string {
        const importPath = this.getRelativeImportPath(fromPath, toPath);
        
        if (isDefaultImport && exportNames.length === 1) {
            return `import ${exportNames[0]} from '${importPath}';`;
        } else if (exportNames.length > 0) {
            return `import { ${exportNames.join(', ')} } from '${importPath}';`;
        } else {
            return `import '${importPath}';`;
        }
    }

    /**
     * Check if import path is valid and resolvable
     * 
     * @param fromPath - Source file path
     * @param importPath - Import path to validate
     * @returns Object with validation result and suggestions
     */
    public validateImportPath(
        fromPath: string,
        importPath: string
    ): {
        isValid: boolean;
        error?: string;
        resolvedPath?: string;
        suggestion?: string;
    } {
        try {
            let resolvedPath: string;
            
            if (importPath.startsWith('.') || importPath.startsWith('/')) {
                // Relative or absolute path
                resolvedPath = path.resolve(path.dirname(fromPath), importPath);
            } else {
                // Module path or alias
                resolvedPath = importPath;
            }
            
            // Check if file exists
            const possibleExtensions = ['.ts', '.tsx', '.js', '.jsx', ''];
            let fileExists = false;
            let actualPath = '';
            
            for (const ext of possibleExtensions) {
                const testPath = resolvedPath + ext;
                if (fs.existsSync(testPath)) {
                    fileExists = true;
                    actualPath = testPath;
                    break;
                }
                
                // Also check with /index suffix
                const indexPath = path.join(resolvedPath, 'index' + ext);
                if (fs.existsSync(indexPath)) {
                    fileExists = true;
                    actualPath = indexPath;
                    break;
                }
            }
            
            if (!fileExists) {
                return {
                    isValid: false,
                    error: `Cannot find module: ${importPath}`,
                    suggestion: `Check if ${resolvedPath} exists with extensions: ${possibleExtensions.join(', ')}`
                };
            }
            
            return {
                isValid: true,
                resolvedPath: actualPath
            };
            
        } catch (error) {
            return {
                isValid: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    // ========== PRIVATE HELPER METHODS ==========

    private normalizePathAlias(importPath: string, aliases: Record<string, string>): string {
        for (const [alias, aliasPath] of Object.entries(aliases)) {
            if (importPath.startsWith(aliasPath)) {
                return alias + importPath.slice(aliasPath.length);
            }
        }
        return importPath;
    }

    private calculatePathDepth(importPath: string): number {
        // Count number of ../ segments
        const segments = importPath.split('/');
        let depth = 0;
        
        for (const segment of segments) {
            if (segment === '..') {
                depth++;
            } else if (segment !== '.' && segment !== '') {
                depth++;
            }
        }
        
        return depth;
    }

    // ========== UTILITY METHODS ==========

    /**
     * Extract all imports from a file and convert to relative paths
     * 
     * @param filePath - Path to the file to analyze
     * @returns Array of import information with relative paths
     */
    public async analyzeFileImports(filePath: string): Promise<Array<{
        importPath: string;
        relativePath: string;
        lineNumber: number;
        exportNames: string[];
        isRelative: boolean;
    }>> {
        const content = fs.readFileSync(filePath, 'utf-8');
        const sourceFile = ts.createSourceFile(
            filePath,
            content,
            ts.ScriptTarget.Latest,
            true
        );

        const imports: Array<{
            importPath: string;
            relativePath: string;
            lineNumber: number;
            exportNames: string[];
            isRelative: boolean;
        }> = [];

        const visit = (node: ts.Node) => {
            if (ts.isImportDeclaration(node)) {
                const importPath = node.moduleSpecifier.getText().slice(1, -1); // Remove quotes
                const isRelative = importPath.startsWith('.');
                let relativePath = importPath;
                
                if (isRelative) {
                    // Already relative, just normalize
                    const fullPath = path.resolve(path.dirname(filePath), importPath);
                    relativePath = this.getRelativeImportPath(filePath, fullPath);
                }
                
                const lineNumber = sourceFile.getLineAndCharacterOfPosition(node.pos).line + 1;
                
                // Extract export names
                const exportNames: string[] = [];
                if (node.importClause) {
                    if (node.importClause.name) {
                        // Default import
                        exportNames.push(node.importClause.name.text);
                    }
                    if (node.importClause.namedBindings) {
                        if (ts.isNamedImports(node.importClause.namedBindings)) {
                            node.importClause.namedBindings.elements.forEach(element => {
                                exportNames.push(element.name.text);
                            });
                        } else if (ts.isNamespaceImport(node.importClause.namedBindings)) {
                            exportNames.push(node.importClause.namedBindings.name.text + '.*');
                        }
                    }
                }
                
                imports.push({
                    importPath,
                    relativePath,
                    lineNumber,
                    exportNames,
                    isRelative
                });
            }
            
            ts.forEachChild(node, visit);
        };
        
        visit(sourceFile);
        return imports;
    }

    /**
     * Fix import paths in a file by converting them to proper relative paths
     * 
     * @param filePath - Path to the file to fix
     * @returns Array of changes made
     */
    public async fixImportPaths(filePath: string): Promise<Array<{
        oldPath: string;
        newPath: string;
        lineNumber: number;
    }>> {
        const imports = await this.analyzeFileImports(filePath);
        const changes: Array<{
            oldPath: string;
            newPath: string;
            lineNumber: number;
        }> = [];
        
        let content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        
        for (const imp of imports) {
            if (imp.isRelative && imp.importPath !== imp.relativePath) {
                // Replace the import path in the line
                const lineIndex = imp.lineNumber - 1;
                const oldLine = lines[lineIndex];
                const newLine = oldLine.replace(
                    new RegExp(`from\\s+['"]${imp.importPath}['"]`),
                    `from '${imp.relativePath}'`
                );
                
                if (oldLine !== newLine) {
                    lines[lineIndex] = newLine;
                    changes.push({
                        oldPath: imp.importPath,
                        newPath: imp.relativePath,
                        lineNumber: imp.lineNumber
                    });
                }
            }
        }
        
        if (changes.length > 0) {
            fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
        }
        
        return changes;
    }
}