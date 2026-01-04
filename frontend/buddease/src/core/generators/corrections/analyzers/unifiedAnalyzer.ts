utils/unifiedAnalyzer.ts
import { ComprehensiveFrontendAnalyzer } from '@/core/generators/corrections/analyzers/ComprehensiveFrontendAnalyzer';

/**
 * Unified analyzer that provides all frontend analysis capabilities
 */
export class UnifiedFrontendAnalyzer {
  private analyzer: ComprehensiveFrontendAnalyzer;

  constructor() {
    this.analyzer = new ComprehensiveFrontendAnalyzer();
  }

  /**
   * Run all analysis types on a path
   */
  async analyzeAll(path: string): Promise<{
    summary: any;
    detailed: any;
    report: string;
  }> {
    // Run comprehensive analysis
    const comprehensive = await this.analyzer.analyzeComprehensive(path);
    
    // Generate report
    const report = await this.analyzer.generateComprehensiveReport(path);
    
    // Create summary
    const summary = this.createSummary(comprehensive);
    
    // Return detailed results
    return {
      summary,
      detailed: comprehensive,
      report
    };
  }

  /**
   * Create summary from analysis results
   */
  private createSummary(analysis: any) {
    const totalFiles = analysis.fileAnalysis.length;
    const totalComponents = analysis.fileAnalysis.flatMap((f: any) => f.components).length;
    const totalIssues = analysis.reactAnalysis.length;
    
    const criticalIssues = analysis.reactAnalysis.filter((c: any) => c.severity === 'critical').length;
    const highIssues = analysis.reactAnalysis.filter((c: any) => c.severity === 'high').length;
    
    return {
      filesAnalyzed: totalFiles,
      componentsFound: totalComponents,
      totalIssues,
      criticalIssues,
      highIssues,
      needsAttention: criticalIssues > 0 || highIssues > 5,
      complexityScore: this.calculateComplexityScore(analysis)
    };
  }

  /**
   * Calculate overall complexity score
   */
  private calculateComplexityScore(analysis: any): number {
    let score = 0;
    
    // Add points for complex files
    analysis.fileAnalysis.forEach((file: any) => {
      score += file.complexity.lines * 0.01;
      score += file.complexity.depth * 0.1;
      score += file.complexity.functions * 0.05;
    });
    
    // Add points for issues
    analysis.reactAnalysis.forEach((issue: any) => {
      switch (issue.severity) {
        case 'critical': score += 10; break;
        case 'high': score += 5; break;
        case 'medium': score += 2; break;
        case 'low': score += 1; break;
      }
    });
    
    return Math.round(score * 100) / 100;
  }
}

Export singleton instance
export const unifiedAnalyzer = new UnifiedFrontendAnalyzer();