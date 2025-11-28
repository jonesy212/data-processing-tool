// analyzeDuplicates.ts
// scripts/analyzeDuplicates.ts
import fs from 'fs';
import path from 'path';

interface DuplicateReport {
  duplicates: {
    interfaces: Map<string, string[]>;
    types: Map<string, string[]>;
    classes: Map<string, string[]>;
    enums: Map<string, string[]>;
  };
  timestamp: string;
  totalFilesScanned: number;
}

class TypeScriptDuplicateAnalyzer {
  private interfaces = new Map<string, string[]>();
  private types = new Map<string, string[]>();
  private classes = new Map<string, string[]>();
  private enums = new Map<string, string[]>();

  async analyzeProject(srcDir: string = './src'): Promise<DuplicateReport> {
    console.log('🔍 Scanning for duplicate interfaces, types, classes, and enums...');
    
    const files = this.getTypeScriptFiles(srcDir);
    let totalFilesScanned = 0;

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        this.analyzeFile(content, file);
        totalFilesScanned++;
      } catch (error) {
        console.warn(`⚠️ Could not read file: ${file}`);
      }
    }

    return {
      duplicates: {
        interfaces: this.filterDuplicates(this.interfaces),
        types: this.filterDuplicates(this.types),
        classes: this.filterDuplicates(this.classes),
        enums: this.filterDuplicates(this.enums),
      },
      timestamp: new Date().toISOString(),
      totalFilesScanned
    };
  }

  private getTypeScriptFiles(dir: string): string[] {
    const files: string[] = [];
    
    const items = fs.readdirSync(dir);
    for (const item of items) {
      if (item === 'node_modules' || item === 'dist') continue;
      
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...this.getTypeScriptFiles(fullPath));
      } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  private analyzeFile(content: string, filePath: string): void {
    // Match interfaces
    const interfaceRegex = /(?:export\s+)?interface\s+(\w+)/g;
    let match;
    while ((match = interfaceRegex.exec(content)) !== null) {
      this.addToMap(this.interfaces, match[1], filePath);
    }

    // Match type aliases
    const typeRegex = /(?:export\s+)?type\s+(\w+)\s*=/g;
    while ((match = typeRegex.exec(content)) !== null) {
      this.addToMap(this.types, match[1], filePath);
    }

    // Match classes
    const classRegex = /(?:export\s+)?class\s+(\w+)/g;
    while ((match = classRegex.exec(content)) !== null) {
      this.addToMap(this.classes, match[1], filePath);
    }

    // Match enums
    const enumRegex = /(?:export\s+)?enum\s+(\w+)/g;
    while ((match = enumRegex.exec(content)) !== null) {
      this.addToMap(this.enums, match[1], filePath);
    }
  }

  private addToMap(map: Map<string, string[]>, name: string, filePath: string): void {
    if (!map.has(name)) {
      map.set(name, []);
    }
    map.get(name)!.push(filePath);
  }

  private filterDuplicates(map: Map<string, string[]>): Map<string, string[]> {
    const duplicates = new Map<string, string[]>();
    for (const [name, files] of map.entries()) {
      if (files.length > 1) {
        duplicates.set(name, files);
      }
    }
    return duplicates;
  }

  generateReport(report: DuplicateReport): string {
    const { duplicates, timestamp, totalFilesScanned } = report;
    
    let output = `# TypeScript Duplicate Analysis Report\n`;
    output += `**Generated**: ${timestamp}\n`;
    output += `**Files Scanned**: ${totalFilesScanned}\n\n`;

    if (this.hasDuplicates(duplicates)) {
      output += `## ❌ DUPLICATES FOUND\n\n`;

      // Interfaces
      if (duplicates.interfaces.size > 0) {
        output += `### Interfaces (${duplicates.interfaces.size} duplicates)\n`;
        for (const [name, files] of duplicates.interfaces.entries()) {
          output += `- **${name}**\n`;
          files.forEach(file => output += `  - ${file}\n`);
        }
        output += '\n';
      }

      // Types
      if (duplicates.types.size > 0) {
        output += `### Type Aliases (${duplicates.types.size} duplicates)\n`;
        for (const [name, files] of duplicates.types.entries()) {
          output += `- **${name}**\n`;
          files.forEach(file => output += `  - ${file}\n`);
        }
        output += '\n';
      }

      // Classes
      if (duplicates.classes.size > 0) {
        output += `### Classes (${duplicates.classes.size} duplicates)\n`;
        for (const [name, files] of duplicates.classes.entries()) {
          output += `- **${name}**\n`;
          files.forEach(file => output += `  - ${file}\n`);
        }
        output += '\n';
      }

      // Enums
      if (duplicates.enums.size > 0) {
        output += `### Enums (${duplicates.enums.size} duplicates)\n`;
        for (const [name, files] of duplicates.enums.entries()) {
          output += `- **${name}**\n`;
          files.forEach(file => output += `  - ${file}\n`);
        }
      }
    } else {
      output += `## ✅ No duplicates found! Your codebase is clean.\n`;
    }

    return output;
  }

  private hasDuplicates(duplicates: DuplicateReport['duplicates']): boolean {
    return duplicates.interfaces.size > 0 || 
           duplicates.types.size > 0 || 
           duplicates.classes.size > 0 || 
           duplicates.enums.size > 0;
  }
}

// Run the analysis
async function main() {
  const analyzer = new TypeScriptDuplicateAnalyzer();
  const report = await analyzer.analyzeProject();
  
  const reportContent = analyzer.generateReport(report);
  console.log(reportContent);
  
  // Save to file
  fs.writeFileSync('./duplicate-analysis-report.md', reportContent);
  console.log('📄 Report saved to: duplicate-analysis-report.md');
}

if (require.main === module) {
  main().catch(console.error);
}

export { TypeScriptDuplicateAnalyzer };