// analyzers/run-analysis.ts
import { ImportTypeAnalyzer } from './ImportTypeAnalyzer';
import { ReduxAnalyzer } from './ReduxAnalyzer';
import type { Correction } from '@/core/generators/corrections/CorrectionGenerator';
import { glob } from 'glob';
import path from 'path';

class AnalysisOrchestrator {
  private analyzers = [
    new ImportTypeAnalyzer(),
    new ReduxAnalyzer(),
    // Add more analyzers here
  ];
  
  async analyzeProject(targetPath?: string): Promise<Correction[]> {
    const allCorrections: Correction[] = [];
    
    // Use target path or default to src directory
    const searchPath = targetPath || 'src';
    const tsFiles = await glob(`${searchPath}/**/*.{ts,tsx}`, {
      ignore: ['node_modules/**', 'dist/**']
    });
    
    console.log(`🔍 Analyzing ${tsFiles.length} TypeScript files...\n`);
    
    for (const analyzer of this.analyzers) {
      console.log(`📊 Running ${analyzer.name} analyzer...`);
      
      // Some analyzers have project-wide analysis
      if (analyzer.name === 'import-type') {
        const corrections = await analyzer.analyzeProject();
        allCorrections.push(...corrections);
      } else {
        // File-by-file analysis
        for (const file of tsFiles.slice(0, 50)) { // Limit for demo
          const corrections = await analyzer.analyzeFile(file);
          allCorrections.push(...corrections);
        }
      }
    }
    
    // Sort by severity/priority
    return allCorrections.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const aPriority = severityOrder[a.severity] || 4;
      const bPriority = severityOrder[b.severity] || 4;
      
      if (aPriority !== bPriority) return aPriority - bPriority;
      
      // Same severity, sort by file path
      return a.file.localeCompare(b.file);
    });
  }
  
  printReport(corrections: Correction[]): void {
    console.log('\n' + '='.repeat(80));
    console.log('📊 ANALYSIS REPORT');
    console.log('='.repeat(80));
    
    if (corrections.length === 0) {
      console.log('✅ No issues found!');
      return;
    }
    
    // Group by category
    const byCategory = new Map<string, Correction[]>();
    corrections.forEach(correction => {
      const category = correction.category || 'uncategorized';
      if (!byCategory.has(category)) {
        byCategory.set(category, []);
      }
      byCategory.get(category)!.push(correction);
    });
    
    // Print by category
    for (const [category, categoryCorrections] of byCategory.entries()) {
      console.log(`\n📁 ${category.toUpperCase()}: ${categoryCorrections.length} issues\n`);
      
      categoryCorrections.forEach((correction, index) => {
        const severityIcon = {
          critical: '🔴',
          high: '🟠',
          medium: '🟡',
          low: '🟢'
        }[correction.severity] || '⚪';
        
        console.log(`${severityIcon} ${index + 1}. ${correction.title}`);
        console.log(`   File: ${path.relative(process.cwd(), correction.file)}:${correction.line || 'N/A'}`);
        console.log(`   Fix: ${correction.suggestion}`);
        if (correction.codeSnippet) {
          console.log(`   Code: ${correction.codeSnippet.substring(0, 100)}...`);
        }
        console.log('');
      });
    }
    
    // Summary
    const critical = corrections.filter(c => c.severity === 'critical').length;
    const high = corrections.filter(c => c.severity === 'high').length;
    const medium = corrections.filter(c => c.severity === 'medium').length;
    const low = corrections.filter(c => c.severity === 'low').length;
    
    console.log('📈 SUMMARY:');
    console.log(`   🔴 Critical: ${critical}`);
    console.log(`   🟠 High: ${high}`);
    console.log(`   🟡 Medium: ${medium}`);
    console.log(`   🟢 Low: ${low}`);
    console.log(`   📊 Total: ${corrections.length}`);
  }
}

// CLI entry point
async function main() {
  const args = process.argv.slice(2);
  const targetPath = args[0];
  
  const orchestrator = new AnalysisOrchestrator();
  const corrections = await orchestrator.analyzeProject(targetPath);
  
  orchestrator.printReport(corrections);
  
  if (corrections.length > 0) {
    console.log('\n💡 Recommended actions:');
    console.log('   1. Review critical/high severity issues first');
    console.log('   2. Run auto-fix commands where available');
    console.log('   3. Use --dry-run flag to preview changes');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}