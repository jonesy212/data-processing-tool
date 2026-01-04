SnapshotAnalyzer.ts
import { Correction } from '@/core/generators/corrections/CorrectionGenerator';
import { CorrectionCategory, CorrectionSeverity, CorrectionType } from '@/core/typings/correctionTypes';
import fs from 'fs';
import path from 'path';

interface SnapshotIssue {
  id?: string;
  type: string;
  severity: string;
  message: string;
  file: string;
  codeSnippet?: string;
  suggestion?: string;
  line?: number;
}

export class SnapshotAnalyzer {
  private snapshotFolderPath: string;

  constructor(snapshotPath: string = '/src/app/snapshots') {
    this.snapshotFolderPath = path.resolve(process.cwd(), snapshotPath);
  }

  async analyzeSnapshotIssues(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    if (!fs.existsSync(this.snapshotFolderPath)) {
      console.warn(`Snapshot folder not found: ${this.snapshotFolderPath}`);
      return corrections;
    }

    console.log(`🔍 Analyzing snapshot folder: ${this.snapshotFolderPath}`);

    // Check for common snapshot issues and convert them to corrections
    const snapshotIssues: SnapshotIssue[] = [];
    
    snapshotIssues.push(...await this.findMissingImports());
    snapshotIssues.push(...await this.findTypeMismatches());
    snapshotIssues.push(...await this.findSerializationIssues());
    snapshotIssues.push(...await this.findDataModelProblems());

    // Convert all snapshot issues to standard corrections
    return this.processSnapshotIssues(snapshotIssues);
  }

  /**
   * Convert snapshot-specific issues to standard Correction format
   */
  private convertSnapshotIssueToCorrection(snapshotIssue: SnapshotIssue): Correction {
    return {
      id: `snapshot-${snapshotIssue.id || Date.now()}`,
      type: this.mapSnapshotIssueType(snapshotIssue.type),
      severity: this.mapSnapshotSeverity(snapshotIssue.severity),
      message: snapshotIssue.message,
      file: snapshotIssue.file,
      code: snapshotIssue.codeSnippet || '',
      fix: snapshotIssue.suggestion || this.generateSnapshotFix(snapshotIssue),
      category: this.mapSnapshotCategory(snapshotIssue.type),
      line: snapshotIssue.line,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Map snapshot issue types to standard CorrectionType
   */
  private mapSnapshotIssueType(snapshotType: string): CorrectionType {
    const typeMap: Record<string, CorrectionType> = {
      'import': 'error',
      'type': 'types',
      'serialization': 'warning',
      'compatibility': 'warning',
      'data-model': 'suggestion',
      'validation': 'warning',
      'performance': 'suggestion'
    };
    
    return typeMap[snapshotType] || 'info';
  }

  /**
   * Map snapshot severity to standard CorrectionSeverity
   */
  private mapSnapshotSeverity(snapshotSeverity: string): CorrectionSeverity {
    const severityMap: Record<string, CorrectionSeverity> = {
      'blocking': 'critical',
      'high': 'high',
      'medium': 'medium',
      'low': 'low',
      'info': 'low'
    };
    
    return severityMap[snapshotSeverity] || 'medium';
  }

  /**
   * Map snapshot type to category
   */
  private mapSnapshotCategory(snapshotType: string): CorrectionCategory {
    const categoryMap: Record<string, CorrectionCategory> = {
      'import': 'compilation',
      'type': 'structure',
      'serialization': 'runtime',
      'compatibility': 'compatibility',
      'data-model': 'structure',
      'validation': 'runtime',
      'performance': 'performance'
    };
    
    return categoryMap[snapshotType] || 'general';
  }

  /**
   * Generate context-aware fixes for snapshot issues
   */
  private generateSnapshotFix(issue: SnapshotIssue): string {
    switch (issue.type) {
      case 'import':
        return `// Fix import paths for snapshot utilities
Ensure all snapshot-related imports use correct paths
import { snapshotUtils } from '@/core/snapshots/Snapshot';

Check the import path and ensure the file exists
or install missing dependency if it's from node_modules`;

      case 'type':
        return `// Align snapshot types with main application types
Update type definitions to match component expectations
interface SnapshotData<T> {
  timestamp: string;
  data: T;
  version: string;
  metadata?: Record<string, any>;
}`;

      case 'serialization':
        return `// Fix serialization/deserialization issues
Use proper data transformation for snapshots
try {
  const serializedData = JSON.stringify(data, null, 2);
  const deserializedData = JSON.parse(serializedData);
} catch (error) {
  console.error('Serialization error:', error);
  // Handle error appropriately
}`;

      case 'compatibility':
        return `// Ensure snapshot compatibility
Add version checks and migration logic
const CURRENT_VERSION = '1.0.0';
if (snapshot.version !== CURRENT_VERSION) {
  return migrateSnapshot(snapshot);
}`;

      case 'data-model':
        return `// Consider breaking down large interfaces
Use composition over large single interfaces
interface BaseSnapshot {
  id: string;
  timestamp: string;
}

interface ExtendedSnapshot extends BaseSnapshot {
  // Add specific properties as needed
}`;

      default:
        return `// Fix snapshot issue: ${issue.message}
Review snapshot implementation and data flow
Ensure proper error handling and validation`;
    }
  }

  /**
   * Process snapshot folder and convert all issues
   */
  private processSnapshotIssues(snapshotIssues: SnapshotIssue[]): Correction[] {
    return snapshotIssues.map(issue => 
      this.convertSnapshotIssueToCorrection(issue)
    );
  }

  private async findMissingImports(): Promise<SnapshotIssue[]> {
    const issues: SnapshotIssue[] = [];
    const files = this.getTypeScriptFiles(this.snapshotFolderPath);

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      
      const importRegex = /from\s+['"]([^'"]+)['"]/g;
      let match;

      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        
        if (importPath.startsWith('.')) {
          const fullPath = path.resolve(path.dirname(file), importPath);
          const possibleExtensions = ['.ts', '.tsx', '.js', '.jsx', '/index.ts'];
          
          let found = false;
          for (const ext of possibleExtensions) {
            if (fs.existsSync(fullPath + ext) || fs.existsSync(fullPath)) {
              found = true;
              break;
            }
          }

          if (!found) {
            issues.push({
              type: 'import',
              severity: 'high',
              message: `Cannot find module '${importPath}'`,
              file: file,
              codeSnippet: `import ... from '${importPath}';`,
              suggestion: `Check the import path and ensure the file exists, or install missing dependency`
            });
          }
        }
      }
    }

    return issues;
  }

  private async findTypeMismatches(): Promise<SnapshotIssue[]> {
    const issues: SnapshotIssue[] = [];
    const files = this.getTypeScriptFiles(this.snapshotFolderPath);

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      
      const typeAssertionRegex = /as\s+([a-zA-Z_$][\w$]*)/g;
      let match;

      while ((match = typeAssertionRegex.exec(content)) !== null) {
        const typeName = match[1];
        
        issues.push({
          type: 'type',
          severity: 'medium',
          message: `Type assertion to '${typeName}' - verify this type exists`,
          file: file,
          codeSnippet: `... as ${typeName}`,
          suggestion: `Ensure '${typeName}' is properly defined and imported`
        });
      }
    }

    return issues;
  }

  private async findSerializationIssues(): Promise<SnapshotIssue[]> {
    const issues: SnapshotIssue[] = [];
    const files = this.getTypeScriptFiles(this.snapshotFolderPath);

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      
      if (content.includes('JSON.stringify') || content.includes('JSON.parse')) {
        issues.push({
          type: 'serialization',
          severity: 'medium',
          message: 'JSON serialization detected - ensure proper error handling',
          file: file,
          codeSnippet: 'JSON.stringify/JSON.parse usage',
          suggestion: 'Add proper error handling for JSON operations'
        });
      }
    }

    return issues;
  }

  private async findDataModelProblems(): Promise<SnapshotIssue[]> {
    const issues: SnapshotIssue[] = [];
    const files = this.getTypeScriptFiles(this.snapshotFolderPath);

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      
      const interfaceRegex = /interface\s+(\w+)\s*{([^}]+)}/g;
      let match;

      while ((match = interfaceRegex.exec(content)) !== null) {
        const interfaceName = match[1];
        const interfaceBody = match[2];
        const propertyCount = (interfaceBody.match(/[^:]:/g) || []).length;
        
        if (propertyCount > 10) {
          issues.push({
            type: 'data-model',
            severity: 'low',
            message: `Interface '${interfaceName}' has many properties (${propertyCount})`,
            file: file,
            codeSnippet: `interface ${interfaceName} { ... ${propertyCount} properties ... }`,
            suggestion: `Consider breaking down into smaller interfaces`
          });
        }
      }
    }

    return issues;
  }

  private getTypeScriptFiles(dir: string): string[] {
    const files: string[] = [];
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          files.push(...this.getTypeScriptFiles(fullPath));
        } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`Could not read directory: ${dir}`, error);
    }
    
    return files;
  }
}

export type { SnapshotIssue };
