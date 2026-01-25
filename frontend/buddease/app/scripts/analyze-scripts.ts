#!/usr/bin/env tsx
// scripts/analyze-scripts.ts
// Analyzes package.json and scripts folder for duplicates/redundancies

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

interface ScriptInfo {
  name: string;
  command: string;
  filePath?: string;
  category: string;
  similarity: number;
}

interface DuplicateReport {
  exactDuplicates: Array<{ scripts: string[]; command: string }>;
  similarScripts: Array<{ script1: string; script2: string; similarity: number; suggestion?: string }>;
  unusedScripts: string[];
  consolidationSuggestions: string[];
}

class ScriptAnalyzer {
  private packageJson: any;
  private scriptsFolder: string = './scripts';
  private scriptFiles: string[] = [];

  constructor(packageJsonPath: string = './package.json') {
    this.packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  }

  async analyze(): Promise<DuplicateReport> {
    console.log('🔍 Analyzing scripts for duplicates and redundancies...\n');
    
    // Find all script files
    this.scriptFiles = await glob('scripts/**/*.{ts,js,sh}', { 
      ignore: ['node_modules/**', '**/node_modules/**'] 
    });

    const report: DuplicateReport = {
      exactDuplicates: [],
      similarScripts: [],
      unusedScripts: [],
      consolidationSuggestions: []
    };

    // Analyze npm scripts
    const npmScripts = this.analyzeNpmScripts();
    report.exactDuplicates.push(...npmScripts.exactDuplicates);
    report.similarScripts.push(...npmScripts.similarScripts);

    // Find potentially unused scripts
    report.unusedScripts = this.findUnusedScripts();

    // Generate consolidation suggestions
    report.consolidationSuggestions = this.generateSuggestions(report);

    return report;
  }

  private analyzeNpmScripts() {
    const scripts = this.packageJson.scripts || {};
    const entries = Object.entries(scripts) as [string, string][];
    
    // Find exact duplicates
    const commandMap = new Map<string, string[]>();
    const exactDuplicates: DuplicateReport['exactDuplicates'] = [];
    const similarScripts: DuplicateReport['similarScripts'] = [];

    entries.forEach(([name, command]) => {
      const existing = commandMap.get(command) || [];
      commandMap.set(command, [...existing, name]);
    });

    commandMap.forEach((scriptNames, command) => {
      if (scriptNames.length > 1) {
        exactDuplicates.push({ scripts: scriptNames, command });
      }
    });

    // Find similar scripts (fuzzy matching)
    const categories = new Map<string, string[]>();
    
    entries.forEach(([name, command]) => {
      const category = this.categorizeScript(name);
      const existing = categories.get(category) || [];
      categories.set(category, [...existing, name]);
    });

    // Check for patterns that suggest consolidation
    categories.forEach((scriptNames, category) => {
      if (scriptNames.length > 3) {
        similarScripts.push({
          script1: scriptNames[0],
          script2: scriptNames[1],
          similarity: 0.9,
          suggestion: `Consider consolidating ${scriptNames.length} scripts in category "${category}" into a single script with options`
        });
      }
    });

    return { exactDuplicates, similarScripts };
  }

  private categorizeScript(name: string): string {
    if (name.includes('analyze')) return 'analyze';
    if (name.includes('fix')) return 'fix';
    if (name.includes('test')) return 'test';
    if (name.includes('build')) return 'build';
    if (name.includes('dev')) return 'dev';
    if (name.includes('workflow')) return 'workflow';
    if (name.includes('backup')) return 'backup';
    if (name.includes('lint')) return 'lint';
    return 'other';
  }

  private findUnusedScripts(): string[] {
    const scripts = this.packageJson.scripts || {};
    const unused: string[] = [];

    (Object.keys(scripts) as string[]).forEach(scriptName => {
      // Check if script is referenced elsewhere
      const isReferenced = Object.values(scripts).some((cmd: string) => 
        cmd.includes(scriptName)
      );
      
      // Check if corresponding file exists
      const hasFile = this.scriptFiles.some(file => {
        const basename = path.basename(file, path.extname(file));
        return scriptName.includes(basename) || basename.includes(scriptName);
      });

      if (!isReferenced && !hasFile && scriptName.includes('script:')) {
        unused.push(scriptName);
      }
    });

    return unused;
  }

  private generateSuggestions(report: DuplicateReport): string[] {
    const suggestions: string[] = [];

    // Suggest unified fixer
    const hasMultipleFixScripts = Object.keys(this.packageJson.scripts || {}).filter(s => 
      s.includes('fix:') && s.includes('file')
    ).length > 1;
    
    if (hasMultipleFixScripts) {
      suggestions.push('Use a single "fix:file" script with options instead of multiple file-fixing scripts');
    }

    // Suggest workflow consolidation
    const workflowCount = Object.keys(this.packageJson.scripts || {}).filter(s => 
      s.includes('workflow:')
    ).length;
    
    if (workflowCount > 20) {
      suggestions.push(`Consider consolidating ${workflowCount} workflow scripts into a single workflow manager CLI`);
    }

    // Suggest removing script: prefix
    const scriptPrefixCount = Object.keys(this.packageJson.scripts || {}).filter(s => 
      s.startsWith('script:')
    ).length;
    
    if (scriptPrefixCount > 10) {
      suggestions.push('Remove "script:" prefix from script names for brevity');
    }

    return suggestions;
  }

  printReport(report: DuplicateReport): void {
    console.log('='.repeat(60));
    console.log('📊 SCRIPT ANALYSIS REPORT');
    console.log('='.repeat(60));

    if (report.exactDuplicates.length > 0) {
      console.log('\n🚨 EXACT DUPLICATES FOUND:');
      report.exactDuplicates.forEach(({ scripts, command }) => {
        console.log(`   Scripts: ${scripts.join(', ')}`);
        console.log(`   Command: ${command}`);
        console.log('');
      });
    }

    if (report.similarScripts.length > 0) {
      console.log('\n⚠️  SIMILAR SCRIPTS (Consolidation Opportunities):');
      report.similarScripts.forEach(({ script1, script2, suggestion }) => {
        console.log(`   • ${script1} ↔ ${script2}`);
        if (suggestion) console.log(`     💡 ${suggestion}`);
      });
    }

    if (report.unusedScripts.length > 0) {
      console.log('\n🔍 POTENTIALLY UNUSED SCRIPTS:');
      report.unusedScripts.forEach(script => {
        console.log(`   • ${script}`);
      });
    }

    if (report.consolidationSuggestions.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      report.consolidationSuggestions.forEach(suggestion => {
        console.log(`   • ${suggestion}`);
      });
    }

    if (Object.values(report).every(arr => Array.isArray(arr) && arr.length === 0)) {
      console.log('\n✅ No duplicates or redundancies found!');
    }

    console.log('\n' + '='.repeat(60));
  }

  async generateCleanedPackageJson(): Promise<any> {
    const cleaned = { ...this.packageJson };
    const report = await this.analyze();

    // Remove exact duplicates (keep first occurrence)
    report.exactDuplicates.forEach(({ scripts }) => {
      if (scripts.length > 1) {
        scripts.slice(1).forEach(script => {
          delete cleaned.scripts[script];
        });
      }
    });

    // Sort scripts alphabetically
    const sortedScripts: Record<string, string> = {};
    Object.keys(cleaned.scripts as Record<string, string>).sort().forEach(key => {
      sortedScripts[key] = cleaned.scripts[key];
    });
    cleaned.scripts = sortedScripts;

    return cleaned;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const analyzer = new ScriptAnalyzer();

  switch (command) {
    case 'report':
      const report = await analyzer.analyze();
      analyzer.printReport(report);
      break;

    case 'clean':
      const cleaned = await analyzer.generateCleanedPackageJson();
      fs.writeFileSync('package.json.clean', JSON.stringify(cleaned, null, 2), 'utf8');
      console.log('✅ Generated cleaned package.json.clean');
      break;

    default:
      console.log(`
🔧 Script Analyzer

Usage:
  pnpm analyze:scripts report    - Show duplicate analysis
  pnpm analyze:scripts clean     - Generate cleaned package.json

This tool identifies:
  • Exact duplicate scripts
  • Similar script patterns
  • Potentially unused scripts
  • Consolidation opportunities
      `);
      break;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ScriptAnalyzer, DuplicateReport };