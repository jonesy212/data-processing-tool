ImplementationCounter.ts
import fs from 'fs';
import path from 'path';
import * as ts from 'typescript';

export class ImplementationCounter {
    private projectStructure: any;
    private program: ts.Program | null = null;

    constructor(projectStructure: any) {
        this.projectStructure = projectStructure;
    }

    async countImplementations(interfaceName: string): Promise<number> {
        let implementationCount = 0;
        
        try {
            // Strategy 1: AST-based detection (most accurate)
            implementationCount += await this.countImplementationsViaAST(interfaceName);
            
            // Strategy 2: File-based detection (fallback)
            if (implementationCount === 0) {
                implementationCount += this.countImplementationsViaFiles(interfaceName);
            }
            
            // Strategy 3: Pattern-based detection (additional coverage)
            implementationCount += this.countImplementationsViaPatterns(interfaceName);
            
        } catch (error) {
            console.warn(`⚠️  Error counting implementations for ${interfaceName}:`, error);
            // Fallback to basic pattern matching
            implementationCount = this.countImplementationsViaPatterns(interfaceName);
        }
        
        return implementationCount;
    }

    private async countImplementationsViaAST(interfaceName: string): Promise<number> {
        const implementations = new Set<string>();
        const sourceFiles = this.getTypeScriptSourceFiles();

        for (const filePath of sourceFiles) {
            try {
                const sourceCode = fs.readFileSync(filePath, 'utf-8');
                const sourceFile = ts.createSourceFile(
                    filePath,
                    sourceCode,
                    ts.ScriptTarget.Latest,
                    true
                );

                this.traverseAST(sourceFile, interfaceName, implementations, filePath);
            } catch (error) {
                console.warn(`⚠️  Could not parse ${filePath}:`, error);
            }
        }

        return implementations.size;
    }

    private traverseAST(
        node: ts.Node, 
        interfaceName: string, 
        implementations: Set<string>,
        filePath: string
    ): void {
        // Check for class implementations
        if (ts.isClassDeclaration(node) && node.name) {
            const heritageClauses = node.heritageClauses || [];
            const className = node.name.getText(); // ✅ Store immediately after type check

            heritageClauses.forEach(clause => {
                clause.types.forEach(type => {
                    const typeText = type.getText();
                    if (typeText.includes(interfaceName)) {
                        implementations.add(`${filePath}:${className}`); // ✅ Use stored variable
                    }
                });
            });
        }

        // Check for interface extensions
        if (ts.isInterfaceDeclaration(node) && node.name) {
            const heritageClauses = node.heritageClauses || [];
            const interfaceNameText = node.name.getText(); // ✅ Store immediately
            
            heritageClauses.forEach(clause => {
                clause.types.forEach(type => {
                    const typeText = type.getText();
                    if (typeText.includes(interfaceName)) {
                        implementations.add(`${filePath}:${interfaceNameText}`); // ✅ Use stored variable
                    }
                });
            });
        }

        // Check for type aliases that extend the interface
        if (ts.isTypeAliasDeclaration(node) && node.name) {
            const typeText = node.type.getText();
            const typeAliasName = node.name.getText(); // ✅ Store immediately
            
            if (typeText.includes(`extends ${interfaceName}`) || 
                typeText.includes(`& ${interfaceName}`)) {
                implementations.add(`${filePath}:${typeAliasName}`); // ✅ Use stored variable
            }
        }

        // Check for variable declarations with interface type
        if (ts.isVariableDeclaration(node) && node.type) {
            const typeText = node.type.getText();
            const variableName = node.name.getText(); // ✅ Store immediately
            
            if (typeText === interfaceName || typeText.includes(`<${interfaceName}`)) {
                implementations.add(`${filePath}:${variableName}`); // ✅ Use stored variable
            }
        }

        // Check for function parameters with interface type
        if (ts.isFunctionDeclaration(node) && node.name) {
            const functionName = node.name.getText(); // ✅ Store immediately
            
            node.parameters.forEach(param => {
                if (param.type) {
                    const typeText = param.type.getText();
                    if (typeText === interfaceName) {
                        implementations.add(`${filePath}:${functionName}.${param.name.getText()}`); // ✅ Use stored variable
                    }
                }
            });
        }

        // Check for arrow functions and function expressions
        if ((ts.isArrowFunction(node) || ts.isFunctionExpression(node)) && node.parameters.length > 0) {
            let contextName = 'anonymous';
            
            // Try to get context from parent
            if (node.parent) {
                if (ts.isVariableDeclaration(node.parent) && node.parent.name) {
                    contextName = node.parent.name.getText();
                } else if (ts.isPropertyAssignment(node.parent) && node.parent.name) {
                    contextName = node.parent.name.getText();
                } else if (ts.isMethodDeclaration(node.parent) && node.parent.name) {
                    contextName = node.parent.name.getText();
                }
            }
            
            node.parameters.forEach(param => {
                if (param.type) {
                    const typeText = param.type.getText();
                    if (typeText === interfaceName || typeText.includes(`<${interfaceName}`)) {
                        implementations.add(`${filePath}:${contextName}.${param.name.getText()}`);
                    }
                }
            });
        }

        // Check for method declarations in classes
        if (ts.isMethodDeclaration(node) && node.name) {
            const methodName = node.name.getText(); // ✅ Store immediately
            
            node.parameters.forEach(param => {
                if (param.type) {
                    const typeText = param.type.getText();
                    if (typeText === interfaceName) {
                        implementations.add(`${filePath}:${methodName}.${param.name.getText()}`); // ✅ Use stored variable
                    }
                }
            });
        }

        // Check for constructor parameters with interface type
        if (ts.isConstructorDeclaration(node)) {
            const className = this.getParentClassName(node);
            const contextName = className || 'constructor';
            
            node.parameters.forEach(param => {
                if (param.type) {
                    const typeText = param.type.getText();
                    if (typeText === interfaceName || typeText.includes(`<${interfaceName}`)) {
                        implementations.add(`${filePath}:${contextName}.${param.name.getText()}`);
                    }
                }
            });
        }

        // Recursively traverse child nodes
        ts.forEachChild(node, childNode => 
            this.traverseAST(childNode, interfaceName, implementations, filePath)
        );
    }

    // Helper method to get parent class name for constructors
    private getParentClassName(node: ts.Node): string | null {
        let parent = node.parent;
        while (parent) {
            if (ts.isClassDeclaration(parent) && parent.name) {
                return parent.name.getText();
            }
            parent = parent.parent;
        }
        return null;
    }

    private countImplementationsViaFiles(interfaceName: string): number {
        let count = 0;
        const sourceFiles = this.getTypeScriptSourceFiles();

        for (const filePath of sourceFiles) {
            try {
                const content = fs.readFileSync(filePath, 'utf-8');
                
                // Pattern 1: Class implements Interface
                const classImplementsRegex = new RegExp(
                    `class\\s+\\w+\\s+implements\\s+.*${interfaceName}\\b`,
                    'g'
                );
                if (classImplementsRegex.test(content)) {
                    count++;
                }

                // Pattern 2: Interface extends Interface
                const interfaceExtendsRegex = new RegExp(
                    `interface\\s+\\w+\\s+extends\\s+.*${interfaceName}\\b`,
                    'g'
                );
                if (interfaceExtendsRegex.test(content)) {
                    count++;
                }

                // Pattern 3: Type alias with interface
                const typeAliasRegex = new RegExp(
                    `type\\s+\\w+\\s*=\\s*.*${interfaceName}\\b`,
                    'g'
                );
                if (typeAliasRegex.test(content)) {
                    count++;
                }

            } catch (error) {
                console.warn(`⚠️  Could not read ${filePath}:`, error);
            }
        }

        return count;
    }

    private countImplementationsViaPatterns(interfaceName: string): number {
        let count = 0;
        
        // Look for common implementation patterns in the project structure
        if (this.projectStructure && this.projectStructure.files) {
            const files = this.projectStructure.files as string[];
            
            files.forEach(filePath => {
                if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
                    // Check filename patterns that might indicate implementations
                    const fileName = path.basename(filePath, path.extname(filePath));
                    
                    // Common patterns:
                    // - InterfaceName + "Impl"
                    // - InterfaceName + "Service" 
                    // - InterfaceName + "Component"
                    // - InterfaceName + "Handler"
                    const implementationPatterns = [
                        `${interfaceName}Impl`,
                        `${interfaceName}Service`,
                        `${interfaceName}Component`,
                        `${interfaceName}Handler`,
                        `${interfaceName}Manager`,
                        `${interfaceName}Controller`,
                        `${interfaceName}Util`,
                        `${interfaceName}Helper`
                    ];

                    if (implementationPatterns.some(pattern => 
                        fileName.includes(pattern) || 
                        fileName.toLowerCase().includes(interfaceName.toLowerCase())
                    )) {
                        count++;
                    }
                }
            });
        }

        return count;
    }

    private getTypeScriptSourceFiles(): string[] {
        const sourceFiles: string[] = [];
        
        if (this.projectStructure && this.projectStructure.files) {
            const files = this.projectStructure.files as string[];
            sourceFiles.push(...files.filter(file => 
                file.endsWith('.ts') || file.endsWith('.tsx')
            ));
        }

        // If no files in project structure, try to find them manually
        if (sourceFiles.length === 0) {
            sourceFiles.push(...this.findTypeScriptFiles(process.cwd()));
        }

        return sourceFiles;
    }

    private findTypeScriptFiles(dir: string): string[] {
        const files: string[] = [];
        
        try {
            const items = fs.readdirSync(dir);
            
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    // Skip node_modules and other common excluded directories
                    if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
                        files.push(...this.findTypeScriptFiles(fullPath));
                    }
                } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            console.warn(`⚠️  Could not read directory ${dir}:`, error);
        }
        
        return files;
    }

    // Additional utility method to get implementation details
    async getImplementationDetails(interfaceName: string): Promise<{
        count: number;
        implementations: Array<{
            file: string;
            name: string;
            type: 'class' | 'interface' | 'type' | 'variable' | 'function';
            line?: number;
        }>;
    }> {
        const implementations: Array<{
            file: string;
            name: string;
            type: 'class' | 'interface' | 'type' | 'variable' | 'function';
            line?: number;
        }> = [];

        const sourceFiles = this.getTypeScriptSourceFiles();

        for (const filePath of sourceFiles) {
            try {
                const sourceCode = fs.readFileSync(filePath, 'utf-8');
                const sourceFile = ts.createSourceFile(
                    filePath,
                    sourceCode,
                    ts.ScriptTarget.Latest,
                    true
                );

                this.collectImplementationDetails(sourceFile, interfaceName, implementations, filePath);
            } catch (error) {
                console.warn(`⚠️  Could not parse ${filePath}:`, error);
            }
        }

        return {
            count: implementations.length,
            implementations
        };
    }

    private collectImplementationDetails(
        node: ts.Node,
        interfaceName: string,
        implementations: Array<{
            file: string;
            name: string;
            type: 'class' | 'interface' | 'type' | 'variable' | 'function';
            line?: number;
        }>,
        filePath: string
    ): void {
        const line = ts.getLineAndCharacterOfPosition(node.getSourceFile(), node.getStart()).line + 1;

        if (ts.isClassDeclaration(node) && node.name) {
            const heritageClauses = node.heritageClauses || [];
            heritageClauses.forEach(clause => {
                clause.types.forEach(type => {
                    if (type.getText().includes(interfaceName)) {
                        implementations.push({
                            file: filePath,
                            name: node.name!.getText(),
                            type: 'class',
                            line
                        });
                    }
                });
            });
        }

        if (ts.isInterfaceDeclaration(node) && node.name) {
            const heritageClauses = node.heritageClauses || [];
            heritageClauses.forEach(clause => {
                clause.types.forEach(type => {
                    if (type.getText().includes(interfaceName)) {
                        implementations.push({
                            file: filePath,
                            name: node.name.getText(),
                            type: 'interface',
                            line
                        });
                    }
                });
            });
        }

        ts.forEachChild(node, childNode => 
            this.collectImplementationDetails(childNode, interfaceName, implementations, filePath)
        );
    }
}