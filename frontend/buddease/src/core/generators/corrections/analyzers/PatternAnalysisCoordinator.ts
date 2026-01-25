// PatternAnalysisCoordinator.ts
import { PatternReport } from '@/core/generators/corrections/reports/PatternReport';
import { DynamicPhaseExecutor } from '@/core/error-analyzer/phases/DynamicPhaseSystem';
import { ComponentPatternAnalyzer } from '@/core/generators/corrections/analyzers/ComponentPatternAnalyzer';
import { UnifiedPatternReport } from '@/core/shared/pattern-types';
import type { Correction } from '@/core/generators/corrections/CorrectionGenerator';

export class PatternAnalysisCoordinator {
  private patternReport: PatternReport;
  private dynamicPhaseExecutor?: DynamicPhaseExecutor;
  private componentAnalyzer: ComponentPatternAnalyzer;

  constructor(corrections: Correction[]) {
    this.patternReport = new PatternReport(corrections);
    this.componentAnalyzer = new ComponentPatternAnalyzer();
  }

  async runCompleteAnalysis(options: {
    entityDirectory?: string;
    componentDirectory?: string;
    generateReports?: boolean;
  } = {}): Promise<UnifiedPatternReport> {
    console.log('🔍 Starting comprehensive pattern analysis...');
    
    // 1. Run basic pattern analysis from corrections
    const basicReport = await this.patternReport.generateUnifiedReport();
    
    // 2. Run dynamic phase system for entity patterns
    if (options.entityDirectory) {
      console.log('📊 Analyzing entity patterns...');
      try {
        this.dynamicPhaseExecutor = new DynamicPhaseExecutor({
          entityDirectory: options.entityDirectory,
          generateReports: options.generateReports
        });
        
        const phaseResults = await this.dynamicPhaseExecutor.executeAllPhases();
        const entityAnalysis = this.dynamicPhaseExecutor.getEntityAnalysis();
        const patternAnalysis = this.dynamicPhaseExecutor.getPatternAnalysis();
        
        // Convert to base patterns for unified report
        const basePatterns = Array.from(patternAnalysis.values()).map(p => ({
          patternName: p.patternName,
          entityCount: p.entityCount,
          totalUsages: p.totalUsages,
          files: p.files,
          variations: p.variations,
          compatibilityMatrix: p.compatibilityMatrix,
          patternType: p.patternName // For compatibility
        }));
        
        basicReport.patternAnalysis.basePatterns = basePatterns;
      } catch (error) {
        console.warn('⚠️ Could not run entity pattern analysis:', error);
      }
    }
    
    // 3. Run component pattern analysis
    if (options.componentDirectory || options.entityDirectory) {
      console.log('⚛️  Analyzing component patterns...');
      try {
        const componentAnalysis = await this.componentAnalyzer.analyzeProject(
          options.componentDirectory || options.entityDirectory || '.'
        );
        
        basicReport.patternAnalysis.componentPatterns = componentAnalysis;
      } catch (error) {
        console.warn('⚠️ Could not run component pattern analysis:', error);
      }
    }
    
    // 4. Generate consolidated recommendations
    basicReport.recommendations = this.generateConsolidatedRecommendations(basicReport);
    
    return basicReport;
  }

  private generateConsolidatedRecommendations(report: UnifiedPatternReport) {
    const recommendations = {
      technical: [...report.recommendations.technical],
      quickWins: [...report.recommendations.quickWins],
      standardization: [...report.recommendations.standardization]
    };
    
    // Add component-specific recommendations
    if (report.patternAnalysis.componentPatterns) {
      const { componentPatterns } = report.patternAnalysis;
      
      if (componentPatterns.patterns.reactFC < componentPatterns.totalComponents * 0.3) {
        recommendations.technical.push(
          'Consider using React.FC for better TypeScript integration'
        );
      }
    }
    
    // Add entity-specific recommendations from base patterns
    report.patternAnalysis.basePatterns.forEach(pattern => {
      if (pattern.entityCount > 3 && pattern.variations.size > 1) {
        recommendations.standardization.push(
          `Standardize ${pattern.patternName} pattern (${pattern.variations.size} variations found)`
        );
      }
    });
    
    return recommendations;
  }

  async saveConsolidatedReport(report: UnifiedPatternReport, outputDir: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(outputDir, `pattern-analysis-${timestamp}.json`);
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`📈 Consolidated pattern report saved to: ${reportPath}`);
    
    // Also save component analysis separately if available
    if (report.patternAnalysis.componentPatterns) {
      const componentReport = this.componentAnalyzer.generateReport(
        report.patternAnalysis.componentPatterns
      );
      const componentPath = path.join(outputDir, `component-patterns-${timestamp}.md`);
      fs.writeFileSync(componentPath, componentReport, 'utf8');
      console.log(`⚛️  Component pattern report saved to: ${componentPath}`);
    }
  }
}