// UsageAnalyzer.ts
import fs from 'fs';
import path from 'path';
import * as ts from 'typescript';

export interface UsageData {
  type: string;
  name: string;
  file: string;
  line: number;
  context: string;
  signature?: string;
  returnType?: string;
  params?: string[];
  extends?: string;
  implements?: string[];
  genericTypes?: string[];
  typeConstraints?: string[];
  source?: string;
  isTypeOnly?: boolean;
}

export interface PropertyUsage {
  type: 'property';
  context: string;
  valueType: string;
  file: string;
  line: number;
  name: string;
}

export interface MethodUsage {
  type: 'method';
  signature: string;
  returnType: string;
  file: string;
  line: number;
  name: string;
  genericTypes?: string[];
}

export interface FunctionUsage {
  type: 'function';
  params: string[];
  returnType: string;
  file: string;
  line: number;
  name: string;
}

export interface ClassUsage {
  type: 'class';
  name: string;
  extends?: string;
  implements?: string[];
  file: string;
  line: number;
}

export interface InterfaceUsage {
  type: 'interface';
  name: string;
  extends?: string[];
  members: string[];
  file: string;
  line: number;
}

export type Usage = 
  | PropertyUsage 
  | MethodUsage 
  | FunctionUsage 
  | ClassUsage 
  | InterfaceUsage 
  | UsageData;

export class UsageAnalyzer {
  private projectRoot: string;
  private typeChecker?: ts.TypeChecker;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  /**
   * Main function to get usage data from the project
   */
  async getUsageData(): Promise<Usage[]> {
    console.log('🔍 Analyzing usage patterns in project...');
    
    const tsFiles = this.getTypeScriptFiles(this.projectRoot);
    const allUsages: Usage[] = [];

    for (const file of tsFiles) {
      try {
        const usages = await this.analyzeFile(file);
        allUsages.push(...usages);
      } catch (error) {  // <-- ADD CATCH BLOCK HERE
        // Now error is available in the catch block
        if (error instanceof Error) {
          console.warn(`⚠️ Could not analyze ${file}:`, error.message);
        } else {
          console.warn(`⚠️ Could not analyze ${file}:`, String(error));
        }
      }
    }

    console.log(`📊 Found ${allUsages.length} usage patterns across ${tsFiles.length} files`);
    return allUsages;
  }

  /**
   * Analyze a single TypeScript file for usage patterns
   */
  private async analyzeFile(filePath: string): Promise<Usage[]> {
    const usages: Usage[] = [];
    const sourceCode = fs.readFileSync(filePath, 'utf8');
    
    // Create TypeScript source file
    const sourceFile = ts.createSourceFile(
      filePath,
      sourceCode,
      ts.ScriptTarget.Latest,
      true
    );

    // Extract imports
    const imports = this.extractImports(sourceFile);
    
    // Analyze declarations
    this.analyzeDeclarations(sourceFile, filePath, usages);
    
    // Analyze usage patterns in code
    this.analyzeUsagePatterns(sourceFile, filePath, usages);
    
    return usages;
  }

  /**
   * Extract imports from source file
   */
  private extractImports(sourceFile: ts.SourceFile): Map<string, string> {
    const imports = new Map<string, string>();
    
    const visit = (node: ts.Node) => {
      if (ts.isImportDeclaration(node)) {
        const importClause = node.importClause;
        const moduleSpecifier = node.moduleSpecifier;
        
        if (importClause && ts.isStringLiteral(moduleSpecifier)) {
          // Named imports
          if (importClause.namedBindings && ts.isNamedImports(importClause.namedBindings)) {
            importClause.namedBindings.elements.forEach(element => {
              imports.set(element.name.text, moduleSpecifier.text);
            });
          }
          // Default import
          if (importClause.name) {
            imports.set(importClause.name.text, moduleSpecifier.text);
          }
        }
      }
      ts.forEachChild(node, visit);
    };
    
    visit(sourceFile);
    return imports;
  }

  /**
   * Analyze type declarations (interfaces, types, classes, functions)
   */
  private analyzeDeclarations(
    sourceFile: ts.SourceFile, 
    filePath: string, 
    usages: Usage[]
  ): void {
    const visit = (node: ts.Node) => {
      const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
      
      // Interface declarations
      if (ts.isInterfaceDeclaration(node)) {
        usages.push({
          type: 'interface',
          name: node.name.text,
          extends: node.heritageClauses
            ?.filter(hc => hc.token === ts.SyntaxKind.ExtendsKeyword)
            .flatMap(hc => hc.types.map(t => t.getText()))
            || [],
          members: node.members.map(m => m.getText()),
          file: filePath,
          line: line + 1
        } as InterfaceUsage);
      }
      
      // Type alias declarations
      else if (ts.isTypeAliasDeclaration(node)) {
        usages.push({
          type: 'type',
          name: node.name.text,
          context: node.type?.getText() || '',
          file: filePath,
          line: line + 1
        });
      }
      
      // Class declarations
      else if (ts.isClassDeclaration(node) && node.name) {
        const extendsClause = node.heritageClauses?.find(
          hc => hc.token === ts.SyntaxKind.ExtendsKeyword
        );
        const implementsClauses = node.heritageClauses?.filter(
          hc => hc.token === ts.SyntaxKind.ImplementsKeyword
        );
        
        usages.push({
          type: 'class',
          name: node.name.text,
          extends: extendsClause?.types[0]?.getText(),
          implements: implementsClauses?.flatMap(ic => 
            ic.types.map(t => t.getText())
          ),
          file: filePath,
          line: line + 1
        } as ClassUsage);
      }
      
      // Function declarations
      else if (ts.isFunctionDeclaration(node) && node.name) {
        const params = node.parameters.map(p => p.getText());
        const returnType = node.type?.getText() || 'void';
        
        usages.push({
          type: 'function',
          name: node.name.text,
          params,
          returnType,
          file: filePath,
          line: line + 1
        } as FunctionUsage);
      }
      
      // Variable declarations (const, let, var)
      else if (ts.isVariableDeclaration(node) && node.name && ts.isIdentifier(node.name)) {
        const typeNode = node.type;
        const initializer = node.initializer;
        
        if (typeNode) {
          usages.push({
            type: 'property',
            name: node.name.text,
            context: initializer?.getText() || '',
            valueType: typeNode.getText(),
            file: filePath,
            line: line + 1
          } as PropertyUsage);
        }
      }
      
      // Method declarations
      else if (ts.isMethodDeclaration(node) && node.name) {
        const signature = this.getMethodSignature(node);
        const returnType = node.type?.getText() || 'void';
        
        usages.push({
          type: 'method',
          name: node.name.getText(),
          signature,
          returnType,
          file: filePath,
          line: line + 1
        } as MethodUsage);
      }
      
      ts.forEachChild(node, visit);
    };
    
    visit(sourceFile);
  }

  /**
   * Analyze usage patterns in code (how types are used)
   */
  private analyzeUsagePatterns(
    sourceFile: ts.SourceFile, 
    filePath: string, 
    usages: Usage[]
  ): void {
    const visit = (node: ts.Node) => {
      const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
      const source = node.getText();
      
      // Type annotations
      if (ts.isTypeReferenceNode(node)) {
        // Get parent context (e.g., variable declaration, function parameter, etc.)
        const parentContext = this.getParentContext(node, sourceFile);
        const typeName = node.typeName.getText();
        
        usages.push({
          type: 'type-reference',
          name: typeName,
          source,
          file: filePath,
          line: line + 1,
          context: `Type reference: ${typeName} in ${parentContext}`
        });
      }
      
      // Generic types
      if (ts.isTypeReferenceNode(node) && node.typeArguments) {
        const parentContext = this.getParentContext(node, sourceFile);
        const typeName = node.typeName.getText();
        const genericArgs = node.typeArguments.map(arg => arg.getText()).join(', ');
        
        usages.push({
          type: 'generic-type',
          name: typeName,
          genericTypes: node.typeArguments.map(arg => arg.getText()),
          source,
          file: filePath,
          line: line + 1,
          context: `Generic type: ${typeName}<${genericArgs}> in ${parentContext}`
        });
      }
      
      // Type assertions (as keyword)
      if (ts.isAsExpression(node)) {
        const expression = node.expression.getText();
        const type = node.type.getText();
        
        usages.push({
          type: 'type-assertion',
          name: type,
          source,
          file: filePath,
          line: line + 1,
          context: `Type assertion: (${expression} as ${type})`
        });
      }
      
      // Satisfies expressions
      if (ts.isSatisfiesExpression(node)) {
        const expression = node.expression.getText();
        const type = node.type.getText();
        
        usages.push({
          type: 'satisfies',
          name: type,
          source,
          file: filePath,
          line: line + 1,
          context: `Satisfies expression: ${expression} satisfies ${type}`
        });
      }
      
      // Also check for interface declarations
      if (ts.isInterfaceDeclaration(node)) {
        const interfaceName = node.name.text;
        const heritageClauses = node.heritageClauses?.map(hc => hc.getText()).join(' ') || '';
        
        usages.push({
          type: 'interface',
          name: interfaceName,
          source,
          file: filePath,
          line: line + 1,
          context: `Interface declaration: interface ${interfaceName} ${heritageClauses}`
        });
      }
      
      // Check for type alias declarations
      if (ts.isTypeAliasDeclaration(node)) {
        const typeName = node.name.text;
        const typeDefinition = node.type?.getText() || 'unknown';
        
        usages.push({
          type: 'type-alias',
          name: typeName,
          source,
          file: filePath,
          line: line + 1,
          context: `Type alias: type ${typeName} = ${typeDefinition}`
        });
      }
      
      // Check for class declarations with type parameters
      if (ts.isClassDeclaration(node) && node.typeParameters) {
        const className = node.name?.text || 'anonymous';
        const typeParams = node.typeParameters.map(tp => tp.getText()).join(', ');
        
        usages.push({
          type: 'generic-class',
          name: className,
          genericTypes: node.typeParameters.map(tp => tp.getText()),
          source,
          file: filePath,
          line: line + 1,
          context: `Generic class: class ${className}<${typeParams}>`
        });
      }
      
      // Check for function/method declarations with type parameters
      if ((ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) && node.typeParameters) {
        const funcName = ts.isFunctionDeclaration(node) 
          ? (node.name?.text || 'anonymous')
          : 'method';
        const typeParams = node.typeParameters.map(tp => tp.getText()).join(', ');
        
        usages.push({
          type: 'generic-function',
          name: funcName,
          genericTypes: node.typeParameters.map(tp => tp.getText()),
          source,
          file: filePath,
          line: line + 1,
          context: `Generic function: ${funcName}<${typeParams}>()`
        });
      }
      
      ts.forEachChild(node, visit);
    };
    
    visit(sourceFile);
  }


  /**
 * Get parent context for better error messages
 */
  private getParentContext(node: ts.Node, sourceFile: ts.SourceFile): string {
    const parent = node.parent;
    
    if (!parent) return 'global scope';
    
    if (ts.isVariableDeclaration(parent)) {
      const varName = parent.name.getText();
      return `variable declaration: ${varName}`;
    }
    
    if (ts.isParameter(parent)) {
      return `function parameter`;
    }
    
    if (ts.isPropertyDeclaration(parent)) {
      const propName = parent.name?.getText() || 'property';
      return `class property: ${propName}`;
    }
    
    if (ts.isFunctionDeclaration(parent)) {
      const funcName = parent.name?.getText() || 'anonymous function';
      return `function: ${funcName}`;
    }
    
    if (ts.isMethodDeclaration(parent)) {
      const methodName = parent.name?.getText() || 'method';
      return `method: ${methodName}`;
    }
    
    if (ts.isReturnStatement(parent)) {
      return `return type`;
    }
    
    if (ts.isArrowFunction(parent)) {
      return `arrow function`;
    }
    
    if (ts.isCallExpression(parent)) {
      return `function call`;
    }
    
    // Try to get some text context
    try {
      const parentText = parent.getText();
      // Take first 50 chars for context
      const context = parentText.length > 50 
        ? parentText.substring(0, 47) + '...' 
        : parentText;
      
      // Determine parent type
      const parentType = ts.SyntaxKind[parent.kind].replace(/([A-Z])/g, ' $1').trim().toLowerCase();
      return `${parentType}: ${context}`;
    } catch {
      return 'unknown context';
    }
  }

  /**
   * Get method signature from method declaration
   */
  private getMethodSignature(node: ts.MethodDeclaration): string {
    const params = node.parameters.map(p => p.getText()).join(', ');
    const returnType = node.type?.getText() || 'void';
    const typeParams = node.typeParameters 
      ? `<${node.typeParameters.map(tp => tp.getText()).join(', ')}>` 
      : '';
    
    return `(${params})${typeParams}: ${returnType}`;
  }

  /**
   * Get all TypeScript files in project
   */
  private getTypeScriptFiles(dir: string): string[] {
    const files: string[] = [];

    const scan = (currentDir: string) => {
      try {
        const items = fs.readdirSync(currentDir, { withFileTypes: true });

        for (const item of items) {
          if (item.name.startsWith('.') || item.name === 'node_modules') {
            continue;
          }

          const fullPath = path.join(currentDir, item.name);

          if (item.isDirectory()) {
            scan(fullPath);
          } else if (item.isFile() &&
              (item.name.endsWith('.ts') || item.name.endsWith('.tsx'))) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        console.warn(`Could not scan directory ${currentDir}:`, error);
      }
    };

    scan(dir);
    return files;
  }
}

// Type guard functions for the usage data
export function isPropertyUsage(usage: any): usage is PropertyUsage {
  return usage?.type === 'property' && 
         'context' in usage && 
         'valueType' in usage;
}

export function isMethodUsage(usage: any): usage is MethodUsage {
  return usage?.type === 'method' && 
         'signature' in usage && 
         'returnType' in usage;
}

export function isFunctionUsage(usage: any): usage is FunctionUsage {
  return usage?.type === 'function' && 
         'params' in usage && 
         'returnType' in usage;
}

export function isClassUsage(usage: any): usage is ClassUsage {
  return usage?.type === 'class' && 
         'name' in usage;
}

export function isInterfaceUsage(usage: any): usage is InterfaceUsage {
  return usage?.type === 'interface' && 
         'name' in usage;
}

/**
 * Main function to get usage data - this is what you need for your code
 */
export async function getUsageData(projectRoot?: string): Promise<Usage[]> {
  const analyzer = new UsageAnalyzer(projectRoot);
  return analyzer.getUsageData();
}

/**
 * Helper function to analyze type context from usage data
 * This is the function you were missing for your code
 */
/**
 * Helper function to analyze type context from usage data
 * This function uses your original checking logic
 */
export function analyzeTypeContext(allUsages: Usage[]): {
  hasTypeContext: boolean;
  typeUsages: Usage[];
  valueUsages: Usage[];
} {
  const typeUsages: Usage[] = [];
  const valueUsages: Usage[] = [];
  
  // Use your original checking logic
  allUsages.forEach(usage => {
    const isTypeUsage = checkIfTypeUsage(usage);
    
    if (isTypeUsage) {
      typeUsages.push(usage);
    } else {
      valueUsages.push(usage);
    }
  });
  
  const hasTypeContext = typeUsages.length > 0;
  
  return {
    hasTypeContext,
    typeUsages,
    valueUsages
  };
}

/**
 * This is your original checking logic extracted to a reusable function
 */
export function checkIfTypeUsage(usage: Usage): boolean {
  // First handle all the type-guarded cases
  if (isPropertyUsage(usage)) {
    // Property usage - use valueType instead of type
    return usage.context.includes(':') || 
           usage.context.includes('interface') ||
           usage.valueType.includes(':') ||  // Changed from usage.type
           usage.context.includes('as ') ||
           usage.context.includes('satisfies');
  }
  
  if (isMethodUsage(usage)) {
    // Method usage
    return usage.signature.includes(':') || 
           usage.signature.includes('=>') ||
           usage.signature.includes('<') ||
           usage.returnType.includes(':') ||
           usage.returnType.includes('<');
  }
  
  if (isFunctionUsage(usage)) {
    // Function usage
    return usage.returnType.includes(':') ||
           usage.params.some((param: string) => param.includes(':'));
  }
  
  if (isClassUsage(usage)) {
    // Class usage - FIXED: Use explicit boolean checks
    const hasExtends = !!usage.extends;
    const hasImplements = !!(usage.implements && usage.implements.length > 0);
    return hasExtends || hasImplements;
  }
  
  if (isInterfaceUsage(usage)) {
    // Interface usage - always has type context
    return true;
  }
  
  // After all type guards, we need to cast to any to check dynamic properties
  const usageAny = usage as any;
  
  // Check for dynamic properties using type assertions
  if ('type' in usageAny && typeof usageAny.type === 'string') {
    // Generic usage with type property
    const type = usageAny.type as string;
    return type.includes(':') || 
           type.includes('=>') ||
           type.includes('<') ||
           type.includes('interface');
  }
  
  if ('genericTypes' in usageAny) {
    // Has generic type annotations
    return Array.isArray(usageAny.genericTypes) && usageAny.genericTypes.length > 0;
  }
  
  if ('typeConstraints' in usageAny) {
    // Has type constraints
    return Array.isArray(usageAny.typeConstraints) && usageAny.typeConstraints.length > 0;
  }
  
  // Check for TypeScript-specific type patterns
  if ('source' in usageAny && typeof usageAny.source === 'string') {
    const source = usageAny.source as string;
    return source.includes(':') || 
           source.includes('as ') ||
           source.includes('satisfies') ||
           source.includes('extends ') ||
           source.includes('implements ');
  }
  
  return false;
}
// Now your original code can use these functions:
export async function getUsageDataAndAnalyze(): Promise<{
  allUsages: Usage[];
  hasTypeContext: boolean;
  typeUsages: Usage[];
  valueUsages: Usage[];
}> {
  // Get all usage data from project
  const allUsages = await getUsageData();
  
  // Analyze type context using the optimized function
  const analysis = analyzeTypeContext(allUsages);
  
  return {
    allUsages,
    ...analysis
  };
}


// Example: How to use it without duplication
async function exampleUsage() {
  // Option 1: Use analyzeTypeContext which internally uses checkIfTypeUsage
  const allUsages = await getUsageData();
  const { hasTypeContext, typeUsages, valueUsages } = analyzeTypeContext(allUsages);
  
  // Option 2: Directly check a single usage
  const singleUsage = allUsages[0];
  const isType = checkIfTypeUsage(singleUsage);
  
  // Option 3: Use .some() with checkIfTypeUsage (your original pattern)
  const hasAnyTypeContext = allUsages.some(checkIfTypeUsage);
  
  return { hasTypeContext, isType, hasAnyTypeContext };
}

// Export everything you need
export default {
  getUsageData,
  analyzeTypeContext,
  getUsageDataAndAnalyze,
  isPropertyUsage,
  isMethodUsage,
  isFunctionUsage,
  isClassUsage,
  isInterfaceUsage,
  UsageAnalyzer
};





