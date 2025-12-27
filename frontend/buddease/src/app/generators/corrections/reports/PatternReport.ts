// PatternReport.ts
// reports/PatternReport.ts
import fs from 'fs';
import path from 'path';
import { Correction } from '@/app/generators/corrections/CorrectionGenerator';

export interface BasePatternAnalysis {
  patternName: string;
  entityCount: number;
  totalUsages: number;
  files: string[];
  variations: Map<string, number>;
  compatibilityMatrix: Map<string, string[]>;
}


export interface PatternAnalysis {
  patternType: string;
  occurrences: number;
  files: string[];
  examples: string[];
  complexityScore: number; // 1-10 scale
  fixEffort: 'low' | 'medium' | 'high';
  impact: 'performance' | 'maintainability' | 'readability' | 'security';
}

export interface PatternTrend {
  pattern: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  change: number; // percentage change
  historicalData: Array<{ date: string; count: number }>;
}

export class PatternReport {
  private issues: Correction[];
  private patterns: Map<string, PatternAnalysis>;

  constructor(issues: Correction[]) {
    this.issues = issues;
    this.patterns = this.analyzePatterns(issues);
  }

  private analyzePatterns(issues: Correction[]): Map<string, PatternAnalysis> {
    const patternMap = new Map<string, PatternAnalysis>();

    issues.forEach(issue => {
      const patternType = this.categorizePattern(issue);
      
      if (!patternMap.has(patternType)) {
        patternMap.set(patternType, {
          patternType,
          occurrences: 0,
          files: [],
          examples: [],
          complexityScore: 0,
          fixEffort: 'medium',
          impact: 'maintainability'
        });
      }

      const pattern = patternMap.get(patternType)!;
      pattern.occurrences++;
      
      if (issue.file && !pattern.files.includes(issue.file)) {
        pattern.files.push(issue.file);
      }
      
      if (issue.codeSnippet && pattern.examples.length < 3) {
        pattern.examples.push(issue.codeSnippet);
      }

      // Update complexity score based on issue severity and type
      pattern.complexityScore = this.calculateComplexityScore(pattern);
      pattern.fixEffort = this.determineFixEffort(pattern);
      pattern.impact = this.determineImpact(issue);
    });

    return patternMap;
  }

  private categorizePattern(issue: Correction): string {
    const title = (issue.title || '').toLowerCase();
    
    if (title.includes('magic number')) return 'magic-numbers';
    if (title.includes('long method') || title.includes('long function')) return 'long-methods';
    if (title.includes('duplicate')) return 'code-duplication';
    if (title.includes('complex conditional') || title.includes('nested')) return 'complex-conditionals';
    if (title.includes('deep relative')) return 'deep-imports';
    if (title.includes('wildcard')) return 'wildcard-imports';
    if (title.includes('commented code')) return 'commented-code';
    if (title.includes('todo')) return 'todo-comments';
    if (title.includes('any type')) return 'typescript-any';
    if (title.includes('inline function')) return 'inline-functions';
    if (title.includes('missing key')) return 'missing-react-keys';
    if (title.includes('dom query') || title.includes('inefficient loop')) return 'performance-issues';
    
    return 'other';
  }

  private calculateComplexityScore(pattern: PatternAnalysis): number {
    let score = 0;
    
    // Base score from occurrences
    if (pattern.occurrences > 20) score += 8;
    else if (pattern.occurrences > 10) score += 6;
    else if (pattern.occurrences > 5) score += 4;
    else score += 2;

    // Penalty for multiple files affected
    if (pattern.files.length > 10) score += 3;
    else if (pattern.files.length > 5) score += 2;
    else if (pattern.files.length > 1) score += 1;

    return Math.min(10, score);
  }

  private determineFixEffort(pattern: PatternAnalysis): 'low' | 'medium' | 'high' {
    const { patternType, occurrences, files } = pattern;
    
    // Low effort patterns
    const lowEffortPatterns = ['magic-numbers', 'todo-comments', 'commented-code'];
    if (lowEffortPatterns.includes(patternType)) return 'low';
    
    // High effort patterns
    const highEffortPatterns = ['code-duplication', 'long-methods', 'complex-conditionals'];
    if (highEffortPatterns.includes(patternType) && occurrences > 5) return 'high';
    
    // Medium effort by default, or based on scale
    if (files.length > 5 || occurrences > 10) return 'high';
    if (files.length > 2 || occurrences > 5) return 'medium';
    
    return 'low';
  }

  private determineImpact(issue: Correction): PatternAnalysis['impact'] {
    const { category, title } = issue;
    const titleLower = (title || '').toLowerCase();
  
    if (category === 'performance' || titleLower.includes('performance')) return 'performance';
    if (category === 'security' || titleLower.includes('security')) return 'security';
    if (category === 'readability' || titleLower.includes('readability')) return 'readability';
    
    return 'maintainability';
  }

  async generatePatternReport(outputPath?: string): Promise<string> {
    const patternsArray = Array.from(this.patterns.values())
      .sort((a, b) => b.complexityScore - a.complexityScore);

    const report = [
      '# Code Pattern Analysis Report',
      '',
      `**Generated:** ${new Date().toISOString()}`,
      `**Total Patterns:** ${patternsArray.length}`,
      `**Total Issues:** ${this.issues.length}`,
      '',
      '## Pattern Summary',
      '',
      '| Pattern | Occurrences | Files Affected | Complexity | Fix Effort | Impact |',
      '|---------|-------------|----------------|------------|------------|--------|',
      ...patternsArray.map(pattern => 
        `| ${this.formatPatternName(pattern.patternType)} | ${pattern.occurrences} | ${pattern.files.length} | ${pattern.complexityScore}/10 | ${pattern.fixEffort} | ${pattern.impact} |`
      ),
      '',
      '## Detailed Pattern Analysis',
      '',
      ...this.generatePatternDetails(patternsArray),
      '',
      '## Recommendations',
      '',
      ...this.generateRecommendations(patternsArray),
      '',
      '## Quick Fix Priority',
      '',
      ...this.generateFixPriority(patternsArray)
    ].join('\n');

    if (outputPath) {
      const fullPath = path.resolve(process.cwd(), outputPath);
      await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.promises.writeFile(fullPath, report, 'utf8');
      console.log(`📈 Pattern report saved to: ${fullPath}`);
    }

    return report;
  }

  async generateVisualPatternReport(outputPath?: string): Promise<string> {
    const patternsArray = Array.from(this.patterns.values())
      .sort((a, b) => b.occurrences - a.occurrences);

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pattern Analysis Report</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .pattern-card { 
            background: white; 
            padding: 20px; 
            margin: 15px 0; 
            border-radius: 8px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border-left: 4px solid #007acc;
        }
        .pattern-high { border-left-color: #dc3545; }
        .pattern-medium { border-left-color: #ffc107; }
        .pattern-low { border-left-color: #20c997; }
        .chart-container { margin: 30px 0; background: white; padding: 20px; border-radius: 8px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin: 20px 0; }
        .metric-box { background: #f8f9fa; padding: 15px; border-radius: 6px; text-align: center; }
        .example-code { background: #f1f3f4; padding: 10px; border-radius: 4px; font-family: monospace; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>🔍 Code Pattern Analysis Report</h1>
    
    <div class="metrics-grid">
        <div class="metric-box">
            <h3>Total Patterns</h3>
            <p style="font-size: 2em; margin: 0;">${this.patterns.size}</p>
        </div>
        <div class="metric-box">
            <h3>Total Issues</h3>
            <p style="font-size: 2em; margin: 0;">${this.issues.length}</p>
        </div>
        <div class="metric-box">
            <h3>Files Affected</h3>
            <p style="font-size: 2em; margin: 0;">${new Set(this.issues.map(i => i.file)).size}</p>
        </div>
    </div>

    <div class="chart-container">
        <canvas id="patternChart" width="400" height="200"></canvas>
    </div>

    <h2>Pattern Analysis</h2>
    ${this.generateHTMLPatternCards(patternsArray)}

    <script>
        const ctx = document.getElementById('patternChart').getContext('2d');
        const patternData = ${JSON.stringify(patternsArray.map(p => ({
          pattern: p.patternType,
          occurrences: p.occurrences,
          effort: p.fixEffort
        })))};
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: patternData.map(p => p.pattern.replace(/-/g, ' ')),
                datasets: [{
                    label: 'Occurrences',
                    data: patternData.map(p => p.occurrences),
                    backgroundColor: patternData.map(p => 
                        p.effort === 'high' ? '#dc3545' : 
                        p.effort === 'medium' ? '#ffc107' : '#20c997'
                    ),
                    borderColor: patternData.map(p => 
                        p.effort === 'high' ? '#c82333' : 
                        p.effort === 'medium' ? '#e0a800' : '#1e7e34'
                    ),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Code Patterns by Occurrence and Fix Effort'
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Occurrences'
                        }
                    }
                }
            }
        });
    </script>
</body>
</html>
    `.trim();

    if (outputPath) {
      const fullPath = path.resolve(process.cwd(), outputPath);
      await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.promises.writeFile(fullPath, html, 'utf8');
      console.log(`📈 Visual pattern report saved to: ${fullPath}`);
    }

    return html;
  }

  private generatePatternDetails(patterns: PatternAnalysis[]): string[] {
    return patterns.map(pattern => [
      `### ${this.formatPatternName(pattern.patternType)}`,
      '',
      `- **Occurrences:** ${pattern.occurrences}`,
      `- **Files Affected:** ${pattern.files.length}`,
      `- **Complexity Score:** ${pattern.complexityScore}/10`,
      `- **Fix Effort:** ${pattern.fixEffort}`,
      `- **Impact:** ${pattern.impact}`,
      '',
      '**Example Issues:**',
      ...pattern.examples.map(example => 
        `\`\`\`typescript\n${example}\n\`\`\``
      ),
      '',
      `**Affected Files:** ${pattern.files.slice(0, 5).join(', ')}${pattern.files.length > 5 ? `... and ${pattern.files.length - 5} more` : ''}`,
      '',
      '---',
      ''
    ]).flat();
  }

  private generateRecommendations(patterns: PatternAnalysis[]): string[] {
    const recommendations: string[] = [];
    
    const highPriority = patterns.filter(p => p.fixEffort === 'high' && p.complexityScore >= 7);
    const mediumPriority = patterns.filter(p => p.fixEffort === 'medium' && p.complexityScore >= 5);
    
    if (highPriority.length > 0) {
      recommendations.push(
        '### 🚨 High Priority Recommendations',
        '',
        ...highPriority.map(pattern => 
          `- **Address ${this.formatPatternName(pattern.patternType)}**: ${pattern.occurrences} occurrences across ${pattern.files.length} files`
        ),
        ''
      );
    }
    
    if (mediumPriority.length > 0) {
      recommendations.push(
        '### ⚠️ Medium Priority Recommendations',
        '',
        ...mediumPriority.map(pattern => 
          `- **Improve ${this.formatPatternName(pattern.patternType)}**: ${pattern.occurrences} occurrences`
        ),
        ''
      );
    }

    // Specific technical recommendations
    const specificRecs = this.generateTechnicalRecommendations(patterns);
    recommendations.push(...specificRecs);

    return recommendations;
  }

  private generateTechnicalRecommendations(patterns: PatternAnalysis[]): string[] {
    const recs: string[] = [];
    
    patterns.forEach(pattern => {
      switch (pattern.patternType) {
        case 'magic-numbers':
          recs.push('- **Magic Numbers**: Create constants for frequently used numbers');
          break;
        case 'long-methods':
          recs.push('- **Long Methods**: Apply Extract Method refactoring pattern');
          break;
        case 'code-duplication':
          recs.push('- **Code Duplication**: Identify common patterns and extract utility functions');
          break;
        case 'complex-conditionals':
          recs.push('- **Complex Conditionals**: Use guard clauses and extract condition logic');
          break;
        case 'deep-imports':
          recs.push('- **Deep Imports**: Set up path aliases and barrel exports');
          break;
        case 'typescript-any':
          recs.push('- **TypeScript Any**: Define proper interfaces and types');
          break;
      }
    });

    return recs.length > 0 ? ['### 🛠️ Technical Recommendations', '', ...recs, ''] : [];
  }

  private generateFixPriority(patterns: PatternAnalysis[]): string[] {
    const priorityList = patterns
      .sort((a, b) => {
        // Sort by effort (low first) then by complexity (high first)
        const effortOrder = { low: 0, medium: 1, high: 2 };
        if (effortOrder[a.fixEffort] !== effortOrder[b.fixEffort]) {
          return effortOrder[a.fixEffort] - effortOrder[b.fixEffort];
        }
        return b.complexityScore - a.complexityScore;
      })
      .slice(0, 10); // Top 10 for quick wins

    return [
      '| Pattern | Fix Effort | Impact | Quick Win |',
      '|---------|------------|--------|-----------|',
      ...priorityList.map(pattern => 
        `| ${this.formatPatternName(pattern.patternType)} | ${pattern.fixEffort} | ${pattern.impact} | ${pattern.fixEffort === 'low' ? '✅' : '⏳'} |`
      ),
      '',
      '**Legend:** ✅ = Quick Win (under 15 minutes) | ⏳ = Requires more time'
    ];
  }

  private generateHTMLPatternCards(patterns: PatternAnalysis[]): string {
    return patterns.map(pattern => {
      const effortClass = `pattern-${pattern.fixEffort}`;
      
      return `
      <div class="pattern-card ${effortClass}">
        <h3>${this.formatPatternName(pattern.patternType)}</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin: 10px 0;">
          <div><strong>Occurrences:</strong> ${pattern.occurrences}</div>
          <div><strong>Files:</strong> ${pattern.files.length}</div>
          <div><strong>Complexity:</strong> ${pattern.complexityScore}/10</div>
          <div><strong>Effort:</strong> ${pattern.fixEffort}</div>
        </div>
        ${pattern.examples.length > 0 ? `
        <div>
          <strong>Example:</strong>
          <div class="example-code">${pattern.examples[0]}</div>
        </div>
        ` : ''}
      </div>
      `;
    }).join('');
  }

  private formatPatternName(patternType: string): string {
    return patternType
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getPatternAnalysis(): Map<string, PatternAnalysis> {
    return this.patterns;
  }

  getTopPatterns(limit: number = 5): PatternAnalysis[] {
    return Array.from(this.patterns.values())
      .sort((a, b) => b.complexityScore - a.complexityScore)
      .slice(0, limit);
  }

  async savePatternData(outputPath: string): Promise<void> {
    const patternData = {
      generated: new Date().toISOString(),
      totalIssues: this.issues.length,
      totalPatterns: this.patterns.size,
      patterns: Object.fromEntries(this.patterns),
      summary: {
        highEffortPatterns: Array.from(this.patterns.values()).filter(p => p.fixEffort === 'high').length,
        quickWins: Array.from(this.patterns.values()).filter(p => p.fixEffort === 'low').length,
        mostCommonPattern: Array.from(this.patterns.values()).sort((a, b) => b.occurrences - a.occurrences)[0]?.patternType
      }
    };

    const fullPath = path.resolve(process.cwd(), outputPath);
    await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.promises.writeFile(fullPath, JSON.stringify(patternData, null, 2), 'utf8');
    console.log(`💾 Pattern data saved to: ${fullPath}`);
  }
}