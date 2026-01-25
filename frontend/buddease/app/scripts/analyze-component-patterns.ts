// analyze-component-patterns.ts
import { PatternAnalysisCoordinator } from '@/core/analyzers/PatternAnalysisCoordinator';
import { CorrectionGenerator } from '@/core/generators/corrections/CorrectionGenerator';

async function main() {
  // 1. Generate corrections (or load existing ones)
  const correctionGenerator = new CorrectionGenerator();
  const corrections = await correctionGenerator.analyzeCodebase('.');
  
  // 2. Create coordinator
  const coordinator = new PatternAnalysisCoordinator(corrections);
  
  // 3. Run comprehensive analysis
  const report = await coordinator.runCompleteAnalysis({
    entityDirectory: './src/app/models',
    componentDirectory: './src/components',
    generateReports: true
  });
  
  // 4. Save results
  await coordinator.saveConsolidatedReport(report, './reports/patterns');
  
  console.log('✅ Comprehensive pattern analysis complete!');
}

main().catch(console.error);