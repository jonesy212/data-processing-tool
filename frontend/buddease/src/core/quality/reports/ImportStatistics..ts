// ImportStatistics..ts
import { ImportAnalysis } from '@/core/generators/corrections/reports/ImportReport';

export class ImportStatistics {
  /**
   * Calculate accurate statistics from import analysis
   */
  static calculateAccurateStatistics(analysisArray: ImportAnalysis[]) {
    let totalUnusedImports = 0;
    let totalDuplicateImports = 0;
    
    analysisArray.forEach(analysis => {
      // Properly count unused imports from the parsed imports
      if (analysis.unusedImports && analysis.unusedImports.length > 0) {
        if (typeof analysis.unusedImports[0] === 'string' && 
            analysis.unusedImports[0].includes('unused imports detected')) {
          const match = analysis.unusedImports[0].match(/(\d+)/);
          totalUnusedImports += match ? parseInt(match[1]) : analysis.unusedImports.length;
        } else {
          totalUnusedImports += analysis.unusedImports.length;
        }
      }

      // Properly count duplicate imports
      if (analysis.duplicateImports && analysis.duplicateImports.length > 0) {
        if (typeof analysis.duplicateImports[0] === 'string' && 
            analysis.duplicateImports[0].includes('duplicate imports detected')) {
          const match = analysis.duplicateImports[0].match(/(\d+)/);
          totalDuplicateImports += match ? parseInt(match[1]) : analysis.duplicateImports.length;
        } else {
          totalDuplicateImports += analysis.duplicateImports.length;
        }
      }
    });

    return {
      totalUnusedImports,
      totalDuplicateImports,
      // Calculate accurate import type counts
      externalImports: analysisArray.reduce((sum, a) => sum + a.externalImports, 0),
      internalImports: analysisArray.reduce((sum, a) => sum + a.internalImports, 0),
      relativeImports: analysisArray.reduce((sum, a) => sum + a.relativeImports, 0),
      absoluteImports: analysisArray.reduce((sum, a) => sum + a.absoluteImports, 0),
      wildcardImports: analysisArray.reduce((sum, a) => sum + a.wildcardImports, 0),
      deepImports: analysisArray.reduce((sum, a) => sum + a.deepImports, 0),
      filesWithHighImpact: analysisArray.filter(a => a.bundleImpact === 'high').length,
      filesWithIssues: analysisArray.filter(a => a.issues.length > 0).length
    };
  }

  /**
   * Validate and fix analysis data
   */
  static validateAnalysis(analysis: ImportAnalysis): ImportAnalysis {
    // Ensure all counts are valid numbers
    return {
      ...analysis,
      totalImports: Math.max(0, analysis.totalImports || 0),
      externalImports: Math.max(0, analysis.externalImports || 0),
      internalImports: Math.max(0, analysis.internalImports || 0),
      deepImports: Math.max(0, analysis.deepImports || 0),
      relativeImports: Math.max(0, analysis.relativeImports || 0),
      absoluteImports: Math.max(0, analysis.absoluteImports || 0),
      wildcardImports: Math.max(0, analysis.wildcardImports || 0),
      unusedImports: Array.isArray(analysis.unusedImports) ? analysis.unusedImports : [],
      duplicateImports: Array.isArray(analysis.duplicateImports) ? analysis.duplicateImports : [],
      issues: Array.isArray(analysis.issues) ? analysis.issues : [],
      errors: Array.isArray(analysis.errors) ? analysis.errors : []
    };
  }
}