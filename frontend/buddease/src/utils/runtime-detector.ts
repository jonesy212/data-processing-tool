// runtime-detector.ts
import fs from 'fs';
import path from 'path';
import * as ts from 'typescript';
import { execSync } from 'child_process';

export interface ExportAnalysis {
  filePath: string;
  exports: {
    name: string;
    kind: 'interface' | 'type' | 'class' | 'function' | 'variable' | 'enum' | 'const';
    isTypeOnly: boolean;
    isDefault: boolean;
    source: string; // The actual export line
  }[];
}

export class RuntimeDetector {
  private exportCache = new Map<string, ExportAnalysis>();
  private runtimePatterns = new Set<string>();
  private typeOnlyPatterns = new Set<string>();
  
  constructor(private projectRoot: string = process.cwd()) {
    this.loadPatterns();
  }
  
  private loadPatterns() {
    // Load from cache if exists
    const cachePath = path.join(this.projectRoot, '.runtime-detector-cache.json');
    if (fs.existsSync(cachePath)) {
      try {
        const cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
        this.runtimePatterns = new Set(cache.runtimePatterns || []);
        this.typeOnlyPatterns = new Set(cache.typeOnlyPatterns || []);
        console.log('📁 Loaded runtime detection cache');
      } catch (error) {
        console.log('⚠️ Could not load cache, starting fresh');
      }
    }
  }
  
  private savePatterns() {
    const cachePath = path.join(this.projectRoot, '.runtime-detector-cache.json');
    const cache = {
      runtimePatterns: Array.from(this.runtimePatterns),
      typeOnlyPatterns: Array.from(this.typeOnlyPatterns),
      updated: new Date().toISOString()
    };
    fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf8');
  }
  
  async analyzeCoreExports(): Promise<void> {
    console.log('🔍 Analyzing core module exports...\n');
    
    // Find all @/core files
    const coreFiles = this.findCoreFiles();
    
    console.log(`📊 Found ${coreFiles.length} @/core files to analyze\n`);
    
    for (const file of coreFiles.slice(0, 50)) { // Limit for speed
      const analysis = this.analyzeFileExports(file);
      if (analysis) {
        this.exportCache.set(file, analysis);
        
        // Learn patterns from this file
        analysis.exports.forEach(exp => {
          if (exp.isTypeOnly) {
            this.typeOnlyPatterns.add(exp.name);
          } else {
            this.runtimePatterns.add(exp.name);
          }
        });
      }
    }
    
    this.savePatterns();
    
    console.log('📈 Learned patterns:');
    console.log(`   Runtime exports: ${this.runtimePatterns.size} patterns`);
    console.log(`   Type-only exports: ${this.typeOnlyPatterns.size} patterns`);
    
    // Show top patterns
    const runtimeArray = Array.from(this.runtimePatterns);
    const typeOnlyArray = Array.from(this.typeOnlyPatterns);
    
    console.log('\n🏃 Top Runtime Patterns:');
    runtimeArray.slice(0, 10).forEach(pattern => console.log(`   • ${pattern}`));
    
    console.log('\n📋 Top Type-Only Patterns:');
    typeOnlyArray.slice(0, 10).forEach(pattern => console.log(`   • ${pattern}`));
  }
  
  private findCoreFiles(): string[] {
    const findCmd = `find src -path "*/core/*" -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v test | head -100`;
    const output = execSync(findCmd, { encoding: 'utf8' });
    return output.split('\n').filter(f => f.trim());
  }
  
  private analyzeFileExports(filePath: string): ExportAnalysis | null {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const sourceFile = ts.createSourceFile(
        filePath,
        content,
        ts.ScriptTarget.Latest,
        true
      );
      
      const exports: ExportAnalysis['exports'] = [];
      
      const visit = (node: ts.Node) => {
        // Interface exports (always type-only)
        if (ts.isInterfaceDeclaration(node)) {
          const isExported = node.modifiers?.some(m => 
            m.kind === ts.SyntaxKind.ExportKeyword || 
            m.kind === ts.SyntaxKind.ExportDefaultKeyword
          );
          if (isExported) {
            exports.push({
              name: node.name.text,
              kind: 'interface',
              isTypeOnly: true,
              isDefault: node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportDefaultKeyword) || false,
              source: node.getText().substring(0, 100) + '...'
            });
          }
        }
        
        // Type alias exports (always type-only)
        else if (ts.isTypeAliasDeclaration(node)) {
          const isExported = node.modifiers?.some(m => 
            m.kind === ts.SyntaxKind.ExportKeyword || 
            m.kind === ts.SyntaxKind.ExportDefaultKeyword
          );
          if (isExported) {
            exports.push({
              name: node.name.text,
              kind: 'type',
              isTypeOnly: true,
              isDefault: node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportDefaultKeyword) || false,
              source: node.getText().substring(0, 100) + '...'
            });
          }
        }
        
        // Class exports (runtime, but can be used as types)
        else if (ts.isClassDeclaration(node) && node.name) {
          const isExported = node.modifiers?.some(m => 
            m.kind === ts.SyntaxKind.ExportKeyword || 
            m.kind === ts.SyntaxKind.ExportDefaultKeyword
          );
          if (isExported) {
            exports.push({
              name: node.name.text,
              kind: 'class',
              isTypeOnly: false, // Classes are runtime
              isDefault: node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportDefaultKeyword) || false,
              source: node.getText().substring(0, 100) + '...'
            });
          }
        }
        
        // Function exports (runtime)
        else if (ts.isFunctionDeclaration(node) && node.name) {
          const isExported = node.modifiers?.some(m => 
            m.kind === ts.SyntaxKind.ExportKeyword || 
            m.kind === ts.SyntaxKind.ExportDefaultKeyword
          );
          if (isExported) {
            exports.push({
              name: node.name.text,
              kind: 'function',
              isTypeOnly: false,
              isDefault: node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportDefaultKeyword) || false,
              source: node.getText().substring(0, 100) + '...'
            });
          }
        }
        
        // Variable exports (runtime)
        else if (ts.isVariableStatement(node)) {
          const hasExport = node.modifiers?.some(m => 
            m.kind === ts.SyntaxKind.ExportKeyword
          );
          if (hasExport) {
            ts.forEachChild(node, (child) => {
              if (ts.isVariableDeclaration(child) && child.name) {
                const name = ts.isIdentifier(child.name) 
                  ? child.name.text 
                  : child.name.getText();
                
                exports.push({
                  name,
                  kind: 'variable',
                  isTypeOnly: false,
                  isDefault: false,
                  source: child.getText().substring(0, 100) + '...'
                });
              }
            });
          }
        }
        
        // Export declarations (export { x } or export type { x })
        else if (ts.isExportDeclaration(node)) {
          if (node.exportClause && ts.isNamedExports(node.exportClause)) {
            node.exportClause.elements.forEach(element => {
              const name = element.name.text;
              
              // Check if it's from export type { ... }
              const isTypeOnly = node.isTypeOnly || false;
              
              exports.push({
                name,
                kind: isTypeOnly ? 'type' : 'variable',
                isTypeOnly,
                isDefault: false,
                source: element.getText()
              });
            });
          }
        }
        
        ts.forEachChild(node, visit);
      };
      
      visit(sourceFile);
      
      return {
        filePath,
        exports
      };
      
    } catch (error) {
      console.warn(`⚠️ Could not analyze ${filePath}:`, error.message);
      return null;
    }
  }
  
  isRuntimeExport(exportName: string): boolean {
    // Check cache first
    if (this.runtimePatterns.has(exportName)) return true;
    if (this.typeOnlyPatterns.has(exportName)) return false;
    
    // Fallback: Heuristic patterns
    const RUNTIME_HEURISTICS = [
      /^[a-z]/, // starts lowercase (camelCase functions/variables)
      /Manager$/i,
      /Engine$/i,
      /Handler$/i,
      /Service$/i,
      /Api$/i,
      /Provider$/i,
      /Component$/i,
      /Hook$/i,
      /^use[A-Z]/, // React hooks
      /^create[A-Z]/, // factory functions
      /^get[A-Z]/, // getter functions
      /^set[A-Z]/, // setter functions
      /^is[A-Z]/, // type guards
      /^has[A-Z]/, // check functions
      /^can[A-Z]/, // capability checks
      /^should[A-Z]/, // validation
      /Store$/i,
      /^store$/i,
      /^api$/i
    ];
    
    const TYPE_HEURISTICS = [
      /^[A-Z][a-z]+Entity$/i,
      /^[A-Z][a-z]+Props$/i,
      /^[A-Z][a-z]+State$/i,
      /^[A-Z][a-z]+Config$/i,
      /^[A-Z][a-z]+Options$/i,
      /^[A-Z][a-z]+Metadata$/i,
      /Interface$/i,
      /^I[A-Z]/, // IInterface convention
      /Type$/i,
      /Types$/i,
      /^[A-Z][a-z]+Data$/i,
      /^[A-Z][a-z]+Payload$/i
    ];
    
    // Check heuristics
    const looksLikeRuntime = RUNTIME_HEURISTICS.some(pattern => pattern.test(exportName));
    const looksLikeType = TYPE_HEURISTICS.some(pattern => pattern.test(exportName));
    
    // If both match, runtime takes precedence (safer)
    if (looksLikeRuntime || !looksLikeType) {
      this.runtimePatterns.add(exportName);
      return true;
    } else {
      this.typeOnlyPatterns.add(exportName);
      return false;
    }
  }
  
  getExportAnalysis(sourceFile: string, exportName: string): ExportAnalysis['exports'][0] | null {
    // Find which file exports this
    for (const [filePath, analysis] of this.exportCache.entries()) {
      const foundExport = analysis.exports.find(e => e.name === exportName);
      if (foundExport) {
        return foundExport;
      }
    }
    
    return null;
  }
}


