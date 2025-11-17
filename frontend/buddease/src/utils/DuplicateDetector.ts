// src/utils/DuplicateDetector.ts
import fs from 'fs';
import path from 'path';

export class DuplicateDetector {
  static findDuplicateMethods(filePath: string): Array<{ method: string; lines: number[] }> {
    const duplicates: Array<{ method: string; lines: number[] }> = [];
    
    if (!fs.existsSync(filePath)) {
      return duplicates;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      // Pattern to match method definitions (excludes try-catch blocks)
      const methodPattern = /(?:private|public|protected|async\s+)?(\w+)\s*\([^)]*\)\s*(?::[^{]*)?\s*\{[^}]*\}(?=\s*(?:\/\/.*)?$)/gm;
      // More precise method detection
      const methodMap = new Map<string, number[]>();
      
      lines.forEach((line, index) => {
        // Skip lines that are clearly try-catch blocks or other non-method contexts
        if (this.isTryCatchBlock(line) || this.isControlFlow(line)) {
          return;
        }
        
        // Look for method patterns
        const methodMatch = line.match(/(?:private|public|protected|async\s+)?(\w+)\s*\([^)]*\)\s*(?::[^{]*)?\s*\{/);
        if (methodMatch && !this.isCommonKeyword(methodMatch[1])) {
          const methodName = methodMatch[1];
          if (!methodMap.has(methodName)) {
            methodMap.set(methodName, []);
          }
          methodMap.get(methodName)!.push(index + 1);
        }
      });
      
      // Find methods that appear more than once
      methodMap.forEach((lines, method) => {
        if (lines.length > 1) {
          duplicates.push({ method, lines });
        }
      });
  
    } catch (error) {
      console.error('Error analyzing file for duplicates:', error);
    }
    
    return duplicates;
  }
  
  private static isTryCatchBlock(line: string): boolean {
    return line.trim().startsWith('} catch') || 
           line.trim().startsWith('catch') ||
           line.includes('} catch {') ||
           line.includes('try {');
  }
  
  private static isControlFlow(line: string): boolean {
    const controlFlowPatterns = [
      /^\s*catch\s*\(/,
      /^\s*if\s*\(/,
      /^\s*for\s*\(/,
      /^\s*while\s*\(/,
      /^\s*switch\s*\(/,
      /^\s*else\s*\{/,
      /^\s*\}?\s*catch\s*\{/
    ];
    
    return controlFlowPatterns.some(pattern => pattern.test(line));
  }
  
  
  private static isCommonKeyword(word: string): boolean {
    const commonKeywords = [
      'if', 'else', 'for', 'while', 'switch', 'case', 'return', 'function',
      'class', 'interface', 'type', 'const', 'let', 'var', 'import', 'export',
      'try', 'catch', 'finally', 'throw'
    ];
    return commonKeywords.includes(word);
  }
  
  static analyzeFileForDuplicates(filePath: string): string {
    const duplicates = this.findDuplicateMethods(filePath);
    
    if (duplicates.length === 0) {
      return '✅ No duplicate methods found';
    }
    
    const report: string[] = [];
    report.push('🚨 DUPLICATE METHODS FOUND:');
    report.push('═'.repeat(50));
    
    duplicates.forEach(({ method, lines }) => {
      report.push(`📌 Method: ${method}`);
      report.push(`   📍 Lines: ${lines.join(', ')}`);
      report.push(`   🛠️  Action: Remove duplicate method definitions`);
      report.push('');
    });
    
    report.push('💡 Tips:');
    report.push('   • Keep only one implementation of each method');
    report.push('   • Check for accidental copy-paste errors');
    report.push('   • Ensure method names are unique within the class');
    
    return report.join('\n');
  }

  static findSpecificDuplicate(filePath: string, methodName: string): { lines: number[]; code: string[] } {
    const result = { lines: [] as number[], code: [] as string[] };
    
    if (!fs.existsSync(filePath)) {
      return result;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      // Look for the specific method
      const methodPattern = new RegExp(`(?:private|public|protected|async\\s+)?${methodName}\\s*\\([^)]*\\)\\s*(?::[^{]*)?\\s*\\{`, 'g');
      
      lines.forEach((line, index) => {
        if (methodPattern.test(line)) {
          result.lines.push(index + 1);
          
          // Get some context around the method
          const start = Math.max(0, index - 2);
          const end = Math.min(lines.length, index + 5);
          result.code.push(lines.slice(start, end).join('\n'));
        }
      });
      
    } catch (error) {
      console.error('Error analyzing file for specific duplicate:', error);
    }
    
    return result;
  }
}