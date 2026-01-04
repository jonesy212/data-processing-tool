QualityReport.ts
src/app/quality/reports/QualityReport.ts
import { Correction } from '@/core/generators/corrections/CorrectionGenerator';
import { CorrectionType } from '@/core/typings/correctionTypes';
import fs from 'fs';
import path from 'path';

export interface QualityMetrics {
  totalIssues: number;
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  byCategory: Record<string, number>; 
  byType: Record<CorrectionType, number>; // Use Record instead of fixed object
  filesAffected: number;
  estimatedFixTime: string;
}

export class QualityReport {
  private issues: Correction[];
  private metrics: QualityMetrics;

  constructor(issues: Correction[]) {
    this.issues = issues;
    this.metrics = this.calculateMetrics(issues);
  }

  private calculateMetrics(issues: Correction[]): QualityMetrics {
    const bySeverity = { critical: 0, high: 0, medium: 0, low: 0 };
    const byCategory: Record<string, number> = {};
    const byType: Record<CorrectionType, number> = {} as Record<CorrectionType, number>; // Initialize as empty record
    const affectedFiles = new Set();

    // Initialize all possible correction types to 0
    const allTypes: CorrectionType[] = [
      'error', 'warning', 'suggestion', 'types', 'info', 'react', 
      'sensitive_data', 'missing_sanitization', 'role_violation', 'insecure_pattern'
    ];
    
    allTypes.forEach(type => {
      byType[type] = 0;
    });

    issues.forEach(issue => {
      // Count by severity
      bySeverity[issue.severity] = (bySeverity[issue.severity] || 0) + 1;
      
      // Count by category
      byCategory[issue.category] = (byCategory[issue.category] || 0) + 1;
      
      // Count by type - now safe because we initialized all possible types
      byType[issue.type] = (byType[issue.type] || 0) + 1;
      
      // Track affected files
      if (issue.file) {
        affectedFiles.add(issue.file);
      }
    });

    // Estimate fix time (rough calculation)
    const estimatedMinutes = this.estimateFixTime(issues);
    const estimatedTime = estimatedMinutes < 60 
      ? `${estimatedMinutes} minutes` 
      : `${Math.ceil(estimatedMinutes / 60)} hours`;

    return {
      totalIssues: issues.length,
      bySeverity,
      byCategory,
      byType,
      filesAffected: affectedFiles.size,
      estimatedFixTime: estimatedTime
    };
  }

  private estimateFixTime(issues: Correction[]): number {
    // Rough estimation: 2 minutes per low, 5 per medium, 15 per high, 30 per critical
    const timePerSeverity = {
      low: 2,
      medium: 5,
      high: 15,
      critical: 30
    };

    return issues.reduce((total, issue) => {
      return total + (timePerSeverity[issue.severity] || 5);
    }, 0);
  }

  async generateMarkdownReport(outputPath?: string): Promise<string> {
    // Filter out types with 0 counts for cleaner reporting
    const activeTypes = Object.entries(this.metrics.byType)
      .filter(([_, count]) => count > 0)
      .reduce((acc, [type, count]) => ({ ...acc, [type]: count }), {});

    const report = [
      '# Code Quality Report',
      '',
      `**Generated:** ${new Date().toISOString()}`,
      `**Total Issues:** ${this.metrics.totalIssues}`,
      `**Files Affected:** ${this.metrics.filesAffected}`,
      `**Estimated Fix Time:** ${this.metrics.estimatedFixTime}`,
      '',
      '## Summary',
      '',
      '### By Severity',
      ...Object.entries(this.metrics.bySeverity).map(([severity, count]) => 
        `- ${severity}: ${count}`
      ),
      '',
      '### By Type',
      ...Object.entries(activeTypes).map(([type, count]) => 
        `- ${type}: ${count}`
      ),
      '',
      '### By Category',
      ...Object.entries(this.metrics.byCategory).map(([category, count]) => 
        `- ${category}: ${count}`
      ),
      '',
      '## Issues by Priority',
      '',
      ...this.generatePrioritySections(),
      '',
      '## Quick Wins',
      '',
      ...this.generateQuickWins(),
      '',
      '## Detailed Issues',
      '',
      ...this.generateDetailedIssues()
    ].join('\n');

    if (outputPath) {
      const fullPath = path.resolve(process.cwd(), outputPath);
      await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.promises.writeFile(fullPath, report, 'utf8');
      console.log(`📊 Quality report saved to: ${fullPath}`);
    }

    return report;
  }

  async generateHTMLReport(outputPath?: string): Promise<string> {
    // Filter out types with 0 counts for cleaner reporting
    const activeTypes = Object.entries(this.metrics.byType)
      .filter(([_, count]) => count > 0)
      .reduce((acc, [type, count]) => ({ ...acc, [type]: count }), {});

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Quality Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .metric-card { background: #f5f5f5; padding: 20px; margin: 10px 0; border-radius: 8px; }
        .severity-critical { border-left: 4px solid #dc3545; }
        .severity-high { border-left: 4px solid #fd7e14; }
        .severity-medium { border-left: 4px solid #ffc107; }
        .severity-low { border-left: 4px solid #20c997; }
        .issue { margin: 15px 0; padding: 10px; background: white; border-radius: 4px; }
        .code-snippet { background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; }
        .quick-win { background: #d4edda; padding: 10px; margin: 5px 0; border-radius: 4px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
    </style>
</head>
<body>
    <h1>Code Quality Report</h1>
    <div class="metric-card">
        <p><strong>Generated:</strong> ${new Date().toISOString()}</p>
        <p><strong>Total Issues:</strong> ${this.metrics.totalIssues}</p>
        <p><strong>Files Affected:</strong> ${this.metrics.filesAffected}</p>
        <p><strong>Estimated Fix Time:</strong> ${this.metrics.estimatedFixTime}</p>
    </div>
    
    <h2>Summary</h2>
    ${this.generateHTMLMetrics(activeTypes)}
    
    <h2>Issues by Priority</h2>
    ${this.generateHTMLPrioritySections()}
    
    <h2>Quick Wins</h2>
    ${this.generateHTMLQuickWins()}
    
    <h2>Detailed Issues</h2>
    ${this.generateHTMLDetailedIssues()}
</body>
</html>
    `.trim();

    if (outputPath) {
      const fullPath = path.resolve(process.cwd(), outputPath);
      await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.promises.writeFile(fullPath, html, 'utf8');
      console.log(`📊 HTML report saved to: ${fullPath}`);
    }

    return html;
  }

  private generatePrioritySections(): string[] {
    const sections: string[] = [];
    
    // Critical & High priority
    const criticalHigh = this.issues.filter(issue => 
      issue.severity === 'critical' || issue.severity === 'high'
    );
    
    if (criticalHigh.length > 0) {
      sections.push('### 🚨 Critical & High Priority', '');
      criticalHigh.forEach(issue => {
        sections.push(`- **${issue.title}** (${issue.file}:${issue.line})`);
      });
      sections.push('');
    }

    // Medium priority
    const medium = this.issues.filter(issue => issue.severity === 'medium');
    if (medium.length > 0) {
      sections.push('### ⚠️ Medium Priority', '');
      medium.forEach(issue => {
        sections.push(`- ${issue.title} (${issue.file}:${issue.line})`);
      });
      sections.push('');
    }

    return sections;
  }

  private generateQuickWins(): string[] {
    const quickWins = this.issues.filter(issue => 
      issue.severity === 'low' && 
      issue.type === 'suggestion' &&
      this.isQuickFix(issue)
    ).slice(0, 10); // Top 10 quick wins

    return quickWins.map(issue => 
      `- **${issue.title}** - ${issue.suggestion}`
    );
  }

  private generateDetailedIssues(): string[] {
    return this.issues.map(issue => 
      `### ${issue.title}\n\n` +
      `**File:** ${issue.file}:${issue.line || 'N/A'}\n\n` +
      `**Severity:** ${issue.severity} | **Type:** ${issue.type} | **Category:** ${issue.category}\n\n` +
      `**Code:**\n\`\`\`typescript\n${issue.codeSnippet}\n\`\`\`\n\n` +
      `**Suggestion:** ${issue.suggestion}\n\n` +
      `---\n`
    );
  }

  private isQuickFix(issue: Correction): boolean {
    const quickFixPatterns = [
      /magic number/i,
      /missing comments/i,
      /wildcard import/i,
      /commented code/i
    ];
    return quickFixPatterns.some(pattern => pattern.test(issue.title || ''));
  }

  // HTML generation helper methods
  private generateHTMLMetrics(activeTypes: Record<string, number>): string {
    return `
    <div class="metrics-grid">
        <div class="metric-card">
            <h3>By Severity</h3>
            ${Object.entries(this.metrics.bySeverity).map(([severity, count]) => 
              `<p>${severity}: <strong>${count}</strong></p>`
            ).join('')}
        </div>
        <div class="metric-card">
            <h3>By Type</h3>
            ${Object.entries(activeTypes).map(([type, count]) => 
              `<p>${type}: <strong>${count}</strong></p>`
            ).join('')}
        </div>
        <div class="metric-card">
            <h3>By Category</h3>
            ${Object.entries(this.metrics.byCategory).map(([category, count]) => 
              `<p>${category}: <strong>${count}</strong></p>`
            ).join('')}
        </div>
    </div>
    `;
  }

  private generateHTMLPrioritySections(): string {
    const criticalHigh = this.issues.filter(issue => 
      issue.severity === 'critical' || issue.severity === 'high'
    );

    return criticalHigh.map(issue => `
      <div class="issue severity-${issue.severity}">
        <h4>${issue.title}</h4>
        <p><strong>File:</strong> ${issue.file}:${issue.line || 'N/A'}</p>
        <div class="code-snippet">${issue.codeSnippet}</div>
        <p><strong>Fix:</strong> ${issue.suggestion}</p>
      </div>
    `).join('');
  }

  private generateHTMLQuickWins(): string {
    const quickWins = this.issues.filter(issue => 
      issue.severity === 'low' && 
      issue.type === 'suggestion' &&
      this.isQuickFix(issue)
    ).slice(0, 10);

    return quickWins.map(issue => `
      <div class="quick-win">
        <strong>${issue.title}</strong><br>
        ${issue.suggestion}<br>
        <small>File: ${issue.file}:${issue.line || 'N/A'}</small>
      </div>
    `).join('');
  }

  private generateHTMLDetailedIssues(): string {
    return this.issues.map(issue => `
      <div class="issue severity-${issue.severity}">
        <h3>${issue.title}</h3>
        <p><strong>Location:</strong> ${issue.file}:${issue.line || 'N/A'}</p>
        <p><strong>Severity:</strong> ${issue.severity} | <strong>Type:</strong> ${issue.type} | <strong>Category:</strong> ${issue.category}</p>
        <div class="code-snippet">${issue.codeSnippet}</div>
        <p><strong>Suggested Fix:</strong> ${issue.suggestion}</p>
      </div>
    `).join('');
  }

  getMetrics(): QualityMetrics {
    return this.metrics;
  }

  getIssues(): Correction[] {
    return this.issues;
  }
}