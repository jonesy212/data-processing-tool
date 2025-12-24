// src/app/error-analyzer/ReportGenerator.ts
import fs from 'fs';
import path from 'path';
import { FixPlan, RelationshipMap } from '@/app/error-analyzer/ErrorFixManager';
import { AnalyzedError } from '@/app/error-analyzer/TypeScriptErrorAnalyzer';

export class ReportGenerator {
  async generateReports(fixPlans: FixPlan[], relationshipMap: RelationshipMap): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportDir = `reports/ts-fixes-${timestamp}`;
    
    await fs.promises.mkdir(reportDir, { recursive: true });
    
    // Generate different report types
    await this.generateSummaryReport(fixPlans, reportDir);
    await this.generateFileBasedReport(fixPlans, reportDir);
    await this.generateTypeBasedReport(fixPlans, relationshipMap, reportDir);
    await this.generateFixImplementationReport(fixPlans, relationshipMap, reportDir);
    await this.generateConfidenceReport(fixPlans, reportDir);
    
    console.log(`📊 Reports generated in: ${reportDir}`);
  }

  private async generateSummaryReport(fixPlans: FixPlan[], reportDir: string): Promise<void> {
    const lines: string[] = [];
    
    lines.push('# TypeScript Error Fix Summary');
    lines.push(`**Generated:** ${new Date().toISOString()}`);
    lines.push(`**Total Errors:** ${fixPlans.length}`);
    lines.push('');
    
    // Statistics by fix type
    const byFixType = new Map<string, number>();
    const byPriority = new Map<string, number>();
    const byConfidence = {
      high: 0, // 80-100
      medium: 0, // 60-79
      low: 0, // 0-59
    };
    
    for (const plan of fixPlans) {
      byFixType.set(plan.fixType, (byFixType.get(plan.fixType) || 0) + 1);
      byPriority.set(plan.priority, (byPriority.get(plan.priority) || 0) + 1);
      
      if (plan.confidence >= 80) byConfidence.high++;
      else if (plan.confidence >= 60) byConfidence.medium++;
      else byConfidence.low++;
    }
    
    lines.push('## 📊 Statistics');
    lines.push('');
    
    lines.push('### By Fix Type');
    for (const [type, count] of byFixType.entries()) {
      lines.push(`- **${type}**: ${count} errors`);
    }
    lines.push('');
    
    lines.push('### By Priority');
    for (const [priority, count] of byPriority.entries()) {
      lines.push(`- **${priority}**: ${count} errors`);
    }
    lines.push('');
    
    lines.push('### By Confidence Level');
    lines.push(`- **High (80-100%)**: ${byConfidence.high} fixes`);
    lines.push(`- **Medium (60-79%)**: ${byConfidence.medium} fixes`);
    lines.push(`- **Low (0-59%)**: ${byConfidence.low} fixes`);
    lines.push('');
    
    // Files with most errors
    const files = new Map<string, number>();
    for (const plan of fixPlans) {
      const file = plan.error.resource;
      files.set(file, (files.get(file) || 0) + 1);
    }
    
    const sortedFiles = Array.from(files.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    if (sortedFiles.length > 0) {
      lines.push('### Top 10 Files with Errors');
      for (const [file, count] of sortedFiles) {
        lines.push(`- **${path.basename(file)}**: ${count} errors`);
      }
      lines.push('');
    }
    
    // Recommendations
    lines.push('## 🎯 Recommended Fix Order');
    lines.push('');
    lines.push('1. **High confidence, high priority fixes first** (quick wins)');
    lines.push('2. **Critical circular dependencies** (blocking issues)');
    lines.push('3. **File-based grouping** - fix all errors in one file before moving on');
    lines.push('4. **Type-based grouping** - fix related type issues together');
    lines.push('5. **Low confidence fixes last** (may require manual review)');
    lines.push('');
    
    await fs.promises.writeFile(
      path.join(reportDir, 'summary.md'),
      lines.join('\n')
    );
  }

  private async generateFileBasedReport(fixPlans: FixPlan[], reportDir: string): Promise<void> {
    // Group fixes by file
    const fixesByFile = new Map<string, FixPlan[]>();
    
    for (const plan of fixPlans) {
      const file = plan.error.resource;
      if (!fixesByFile.has(file)) {
        fixesByFile.set(file, []);
      }
      fixesByFile.get(file)!.push(plan);
    }
    
    // Create report for each file
    for (const [file, plans] of fixesByFile.entries()) {
      const lines: string[] = [];
      const fileName = path.basename(file);
      
      lines.push(`# Fixes for ${fileName}`);
      lines.push(`**File:** ${file}`);
      lines.push(`**Total Errors:** ${plans.length}`);
      lines.push('');
      
      // Sort by line number
      const sortedPlans = plans.sort((a, b) => a.error.startLineNumber - b.error.startLineNumber);
      
      for (const plan of sortedPlans) {
        lines.push(this.generateFixPlanSection(plan));
        lines.push('---');
        lines.push('');
      }
      
      // File-specific recommendations
      lines.push('## 💡 File-Specific Recommendations');
      lines.push('');
      
      const errorTypes = new Set(plans.map(p => p.fixType));
      if (errorTypes.has('missing_import')) {
        lines.push('- **Multiple missing imports**: Consider creating a barrel export file');
        lines.push('- **Check import paths**: Ensure relative paths are correct');
      }
      
      if (errorTypes.has('type_mismatch')) {
        lines.push('- **Type inconsistencies**: Review type definitions in this file');
        lines.push('- **Consider creating interfaces**: For complex type relationships');
      }
      
      if (plans.length > 5) {
        lines.push(`- **High error density**: Consider refactoring this file (${plans.length} errors)`);
      }
      
      await fs.promises.writeFile(
        path.join(reportDir, `file-${fileName.replace(/[^a-z0-9]/gi, '-')}.md`),
        lines.join('\n')
      );
    }
    
    // Create index of files
    const indexLines: string[] = [];
    indexLines.push('# Files Needing Fixes');
    indexLines.push('');
    
    const sortedFiles = Array.from(fixesByFile.entries())
      .sort((a, b) => b[1].length - a[1].length);
    
    for (const [file, plans] of sortedFiles) {
      const fileName = path.basename(file);
      const errorCount = plans.length;
      const criticalCount = plans.filter(p => p.priority === 'critical').length;
      
      indexLines.push(`## [${fileName}](file-${fileName.replace(/[^a-z0-9]/gi, '-')}.md)`);
      indexLines.push(`**Path:** ${file}`);
      indexLines.push(`**Total Errors:** ${errorCount}`);
      if (criticalCount > 0) {
        indexLines.push(`**Critical Errors:** ${criticalCount} ⚠️`);
      }
      indexLines.push('');
    }
    
    await fs.promises.writeFile(
      path.join(reportDir, 'files-index.md'),
      indexLines.join('\n')
    );
  }

  private async generateTypeBasedReport(
    fixPlans: FixPlan[],
    relationshipMap: RelationshipMap,
    reportDir: string
  ): Promise<void> {
    // Group fixes by type/identifier
    const fixesByIdentifier = new Map<string, FixPlan[]>();
    
    for (const plan of fixPlans) {
      const error = plan.error;
      const message = error.message;
      
      // Extract identifier from error message
      let identifier: string | null = null;
      
      if (message.includes("Cannot find name")) {
        const match = message.match(/Cannot find name ['"]([^'"]+)['"]/);
        if (match) identifier = match[1];
      } else if (message.includes("Property")) {
        const match = message.match(/Property ['"]([^'"]+)['"]/);
        if (match) identifier = match[1];
      } else if (message.includes("type '")) {
        const match = message.match(/type '([^']+)'/);
        if (match) identifier = match[1];
      }
      
      if (identifier) {
        if (!fixesByIdentifier.has(identifier)) {
          fixesByIdentifier.set(identifier, []);
        }
        fixesByIdentifier.get(identifier)!.push(plan);
      }
    }
    
    const lines: string[] = [];
    lines.push('# Type/Identifier Based Fix Report');
    lines.push('');
    lines.push('> Fixes grouped by identifier for consistent updates across files');
    lines.push('');
    
    for (const [identifier, plans] of fixesByIdentifier.entries()) {
      lines.push(`## ${identifier}`);
      lines.push(`**Total Occurrences:** ${plans.length}`);
      lines.push('');
      
      // Show all usages from relationship map
      const usages = relationshipMap.propertyUsages.get(identifier) || 
                     relationshipMap.methodUsages.get(identifier);
      
      if (usages && usages.length > 0) {
        lines.push('### 📍 Usage Locations:');
        const uniqueFiles = new Set<string>();
        
        for (const usage of usages) {
          if (usage.file) {
            uniqueFiles.add(usage.file);
          }
        }
        
        for (const file of uniqueFiles) {
          lines.push(`- ${path.basename(file)}`);
        }
        lines.push('');
      }
      
      // Show fixes for this identifier
      lines.push('### 🔧 Required Fixes:');
      for (const plan of plans) {
        const error = plan.error;
        lines.push(`- **${path.basename(error.resource)}:${error.startLineNumber}**`);
        lines.push(`  - Error: ${error.message.substring(0, 100)}...`);
        lines.push(`  - Confidence: ${plan.confidence}%`);
        lines.push(`  - Priority: ${plan.priority}`);
        lines.push('');
      }
      
      // Generate unified fix suggestion
      if (plans.length > 1) {
        lines.push('### 💡 Unified Fix Strategy:');
        lines.push('Since this identifier appears in multiple places, consider:');
        lines.push('');
        
        const fixTypes = new Set(plans.map(p => p.fixType));
        if (fixTypes.has('missing_import')) {
          lines.push('1. **Add centralized import** in a shared utility file');
          lines.push('2. **Create barrel exports** for related functionality');
          lines.push('3. **Check if import path needs adjustment**');
        }
        
        if (fixTypes.has('type_mismatch')) {
          lines.push('1. **Define type once** and import where needed');
          lines.push('2. **Create type alias** for consistency');
          lines.push('3. **Update all usages** to match the correct type');
        }
        
        if (fixTypes.has('missing_property')) {
          lines.push('1. **Add property to interface/type definition**');
          lines.push('2. **Ensure all implementations include the property**');
          lines.push('3. **Consider making property optional** if appropriate');
        }
        
        lines.push('');
      }
      
      lines.push('---');
      lines.push('');
    }
    
    await fs.promises.writeFile(
      path.join(reportDir, 'type-based-report.md'),
      lines.join('\n')
    );
  }

  private async generateFixImplementationReport(
    fixPlans: FixPlan[],
    relationshipMap: RelationshipMap,
    reportDir: string
  ): Promise<void> {
    const lines: string[] = [];
    
    lines.push('# Fix Implementation Guide');
    lines.push('');
    lines.push('> Step-by-step guide for implementing fixes');
    lines.push('');
    
    // Group by confidence level
    const highConfidence = fixPlans.filter(p => p.confidence >= 80 && !p.requiresManualReview);
    const mediumConfidence = fixPlans.filter(p => p.confidence >= 60 && p.confidence < 80);
    const lowConfidence = fixPlans.filter(p => p.confidence < 60 || p.requiresManualReview);
    
    if (highConfidence.length > 0) {
      lines.push('## 🟢 High Confidence Fixes (Auto-fixable)');
      lines.push('');
      lines.push('These fixes can likely be applied automatically:');
      lines.push('');
      
      for (const plan of highConfidence.slice(0, 10)) { // Show first 10
        lines.push(this.generateImplementationStep(plan, relationshipMap));
      }
      
      if (highConfidence.length > 10) {
        lines.push(`*... and ${highConfidence.length - 10} more high confidence fixes*`);
      }
      lines.push('');
    }
    
    if (mediumConfidence.length > 0) {
      lines.push('## 🟡 Medium Confidence Fixes (Semi-auto)');
      lines.push('');
      lines.push('These fixes may require some manual adjustment:');
      lines.push('');
      
      for (const plan of mediumConfidence.slice(0, 5)) {
        lines.push(this.generateImplementationStep(plan, relationshipMap));
      }
      lines.push('');
    }
    
    if (lowConfidence.length > 0) {
      lines.push('## 🔴 Low Confidence Fixes (Manual Review)');
      lines.push('');
      lines.push('These fixes require manual review and testing:');
      lines.push('');
      
      for (const plan of lowConfidence.slice(0, 5)) {
        lines.push(this.generateImplementationStep(plan, relationshipMap));
      }
      lines.push('');
    }
    
    // Implementation workflow
    lines.push('## 📋 Implementation Workflow');
    lines.push('');
    lines.push('1. **Start with high confidence fixes**');
    lines.push('2. **Test each fix** before moving to the next');
    lines.push('3. **Use TypeScript compiler** to verify: `npx tsc --noEmit`');
    lines.push('4. **Check related files** using the relationship maps');
    lines.push('5. **Run tests** to ensure no regressions');
    lines.push('6. **Document changes** for future reference');
    lines.push('');
    
    await fs.promises.writeFile(
      path.join(reportDir, 'implementation-guide.md'),
      lines.join('\n')
    );
  }

  private generateFixPlanSection(plan: FixPlan): string {
    const lines: string[] = [];
    const error = plan.error;
    
    lines.push(`## ${this.getErrorIcon(plan.priority)} Line ${error.startLineNumber}: ${error.message.substring(0, 80)}...`);
    lines.push('');
    lines.push(`**File:** ${path.basename(error.resource)}`);
    lines.push(`**Location:** ${error.resource}:${error.startLineNumber}`);
    lines.push(`**Error Code:** ${error.code}`);
    lines.push(`**Fix Type:** ${plan.fixType}`);
    lines.push(`**Confidence:** ${plan.confidence}%`);
    lines.push(`**Priority:** ${plan.priority}`);
    lines.push(`**Manual Review Needed:** ${plan.requiresManualReview ? 'Yes ⚠️' : 'No ✅'}`);
    lines.push('');
    
    lines.push('### Problem:');
    lines.push('```typescript');
    lines.push(error.message);
    lines.push('```');
    lines.push('');
    
    lines.push('### Suggested Fix:');
    lines.push('```typescript');
    lines.push(plan.suggestedFix);
    lines.push('```');
    lines.push('');
    
    if (plan.affectedFiles.length > 1) {
      lines.push('### Affected Files:');
      for (const file of plan.affectedFiles) {
        lines.push(`- ${path.basename(file)}`);
      }
      lines.push('');
    }
    
    if (plan.validationRules.length > 0) {
      lines.push('### Validation Rules:');
      for (const rule of plan.validationRules) {
        lines.push(`- ${rule}`);
      }
      lines.push('');
    }
    
    return lines.join('\n');
  }

  private generateImplementationStep(plan: FixPlan, relationshipMap: RelationshipMap): string {
    const lines: string[] = [];
    const error = plan.error;
    
    lines.push(`### ${this.getFixIcon(plan.confidence)} ${path.basename(error.resource)}:${error.startLineNumber}`);
    lines.push('');
    lines.push(`**Error:** ${error.message.substring(0, 100)}...`);
    lines.push('');
    
    lines.push('**Steps:**');
    lines.push('1. Open the file:');
    lines.push(`   \`${error.resource}\``);
    lines.push(`2. Go to line ${error.startLineNumber}`);
    lines.push('3. Apply the fix:');
    lines.push('```typescript');
    lines.push(plan.suggestedFix.split('\n').slice(0, 5).join('\n')); // Show first 5 lines
    if (plan.suggestedFix.split('\n').length > 5) {
      lines.push('// ...');
    }
    lines.push('```');
    
    // Check for related identifiers
    const message = error.message;
    const identifierMatch = message.match(/Cannot find name ['"]([^'"]+)['"]/);
    if (identifierMatch) {
      const identifier = identifierMatch[1];
      const relatedUsages = relationshipMap.propertyUsages.get(identifier) || 
                           relationshipMap.methodUsages.get(identifier);
      
      if (relatedUsages && relatedUsages.length > 1) {
        lines.push('');
        lines.push(`**Note:** "${identifier}" is used in ${relatedUsages.length} places.`);
        lines.push('Update all occurrences for consistency.');
      }
    }
    
    lines.push('');
    lines.push('**Verification:**');
    lines.push('- Run: `npx tsc --noEmit` to check TypeScript');
    lines.push('- Test related functionality');
    lines.push('');
    lines.push('---');
    lines.push('');
    
    return lines.join('\n');
  }

  private async generateConfidenceReport(fixPlans: FixPlan[], reportDir: string): Promise<void> {
    const lines: string[] = [];
    
    lines.push('# Fix Confidence Analysis');
    lines.push('');
    
    // Sort by confidence
    const sortedPlans = [...fixPlans].sort((a, b) => b.confidence - a.confidence);
    
    lines.push('## High Confidence Fixes (80-100%)');
    lines.push('');
    const highConfidence = sortedPlans.filter(p => p.confidence >= 80);
    this.addConfidenceTable(highConfidence, lines);
    
    lines.push('');
    lines.push('## Medium Confidence Fixes (60-79%)');
    lines.push('');
    const mediumConfidence = sortedPlans.filter(p => p.confidence >= 60 && p.confidence < 80);
    this.addConfidenceTable(mediumConfidence, lines);
    
    lines.push('');
    lines.push('## Low Confidence Fixes (0-59%)');
    lines.push('');
    const lowConfidence = sortedPlans.filter(p => p.confidence < 60);
    this.addConfidenceTable(lowConfidence, lines);
    
    // Confidence factors analysis
    lines.push('');
    lines.push('## Confidence Factors');
    lines.push('');
    lines.push('High confidence typically indicates:');
    lines.push('- Clear error patterns (missing imports, simple type mismatches)');
    lines.push('- Limited affected files');
    lines.push('- Straightforward fixes');
    lines.push('');
    lines.push('Low confidence typically indicates:');
    lines.push('- Complex type relationships');
    lines.push('- Multiple affected files');
    lines.push('- Circular dependencies');
    lines.push('- Ambiguous error messages');
    
    await fs.promises.writeFile(
      path.join(reportDir, 'confidence-analysis.md'),
      lines.join('\n')
    );
  }

  private addConfidenceTable(plans: FixPlan[], lines: string[]): void {
    if (plans.length === 0) {
      lines.push('*No fixes in this confidence range*');
      return;
    }
    
    lines.push('| File | Line | Error | Confidence | Fix Type |');
    lines.push('|------|------|-------|------------|----------|');
    
    for (const plan of plans.slice(0, 20)) { // Show top 20
      const error = plan.error;
      const shortMessage = error.message.length > 50 
        ? error.message.substring(0, 47) + '...' 
        : error.message;
      
      lines.push(`| ${path.basename(error.resource)} | ${error.startLineNumber} | ${shortMessage} | ${plan.confidence}% | ${plan.fixType} |`);
    }
    
    if (plans.length > 20) {
      lines.push(`| ... | ... | ... | ... | ... |`);
      lines.push(`| *${plans.length - 20} more fixes* | | | | |`);
    }
  }

  private getErrorIcon(priority: string): string {
    switch (priority) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '🔧';
      case 'low': return '💡';
      default: return '📝';
    }
  }

  private getFixIcon(confidence: number): string {
    if (confidence >= 80) return '🟢';
    if (confidence >= 60) return '🟡';
    return '🔴';
  }
}