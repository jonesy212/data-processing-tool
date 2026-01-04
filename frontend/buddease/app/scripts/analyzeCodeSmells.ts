// analyzeCodeSmells.ts
// src/app/scripts/analyzeCodeSmells.ts
import { CodeQualityScript } from '@/app/scripts/CodeQualityScript';
import { PatternAnalyzer } from '@/core/generators/corrections/analyzers/PatternAnalyzer';

async function analyzeCodeSmells() {
  console.log('🔍 Starting comprehensive code smell analysis...');
  
  const patternAnalyzer = new PatternAnalyzer();
  const qualityScript = new CodeQualityScript();
  
  const [patternIssues, qualityIssues] = await Promise.all([
    patternAnalyzer.analyze(),
    qualityScript.execute()
  ]);
  
  const allIssues = [...patternIssues, ...qualityIssues];
  
  // Generate reports
  await generateQualityReport(allIssues);
  await generateQuickFixes(allIssues);
  
  console.log(`✅ Analysis complete: ${allIssues.length} issues found`);
  return allIssues;
}

async function generateQualityReport(issues: any[]) {
  // Implementation for generating HTML/Markdown reports
}

async function generateQuickFixes(issues: any[]) {
  // Implementation for generating fix commands
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  analyzeCodeSmells().catch(console.error);
}