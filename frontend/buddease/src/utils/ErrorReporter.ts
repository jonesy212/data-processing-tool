// src/app/utils/ErrorReporter.ts
import { ErrorManager, CategorizedError } from '@/utils/ErrorManager';
import fs from 'fs';
import path from 'path';

export class ErrorReporter {
  static async generateErrorReport(errorOutput: string, outputDir: string = './error-reports'): Promise<string> {
    const errors = ErrorManager.analyzeBuildOutput(errorOutput);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(outputDir, `error-report-${timestamp}.md`);

    const reportLines: string[] = [];
    
    reportLines.push('# 🚨 Build Error Analysis Report');
    reportLines.push(`**Generated:** ${new Date().toISOString()}`);
    reportLines.push(`**Total Errors Found:** ${errors.length}`);
    reportLines.push('');

    // Group by severity
    const bySeverity = {
      critical: errors.filter(e => e.error.severity === 'critical'),
      high: errors.filter(e => e.error.severity === 'high'),
      medium: errors.filter(e => e.error.severity === 'medium'),
      low: errors.filter(e => e.error.severity === 'low')
    };

    reportLines.push('## 📊 Error Summary');
    reportLines.push(`- 🚨 Critical: ${bySeverity.critical.length}`);
    reportLines.push(`- ⚠️ High: ${bySeverity.high.length}`);
    reportLines.push(`- 🔧 Medium: ${bySeverity.medium.length}`);
    reportLines.push(`- 💡 Low: ${bySeverity.low.length}`);
    reportLines.push('');

    // Critical errors first
    if (bySeverity.critical.length > 0) {
      reportLines.push('## 🚨 CRITICAL ERRORS - FIX IMMEDIATELY');
      bySeverity.critical.forEach(({ error, context, rawMessage }, index) => {
        reportLines.push(`### ${index + 1}. ${error.title}`);
        reportLines.push(ErrorManager.generateFixReport(error, context));
        reportLines.push(`**Raw Error:** \`${rawMessage}\``);
        reportLines.push('');
      });
    }

    // High priority errors
    if (bySeverity.high.length > 0) {
      reportLines.push('## ⚠️ HIGH PRIORITY ERRORS');
      bySeverity.high.forEach(({ error, context, rawMessage }, index) => {
        reportLines.push(`### ${index + 1}. ${error.title}`);
        reportLines.push(ErrorManager.generateFixReport(error, context));
        reportLines.push(`**Raw Error:** \`${rawMessage}\``);
        reportLines.push('');
      });
    }

    // All errors summary
    reportLines.push('## 📋 All Errors Summary');
    errors.forEach(({ error, context, rawMessage }, index) => {
      reportLines.push(`### ${index + 1}. ${error.title}`);
      reportLines.push(`- **Severity:** ${error.severity}`);
      reportLines.push(`- **Category:** ${error.category}`);
      if (context.file) {
        reportLines.push(`- **File:** ${context.file}:${context.line}`);
      }
      reportLines.push(`- **Raw Message:** \`${rawMessage}\``);
      reportLines.push('');
    });

    const reportContent = reportLines.join('\n');
    fs.writeFileSync(reportFile, reportContent, 'utf8');

    return reportFile;
  }

  static printQuickFixSummary(errorOutput: string): void {
    const errors = ErrorManager.analyzeBuildOutput(errorOutput);
    
    console.log('\n🎯 QUICK ERROR ANALYSIS');
    console.log('═'.repeat(60));
    
    if (errors.length === 0) {
      console.log('✅ No categorized errors found');
      console.log('💡 Tip: The error might be in a format we don\'t recognize yet.');
      console.log('   Consider adding it to ErrorManager.ts patterns.');
      return;
    }

    const criticalErrors = errors.filter(e => e.error.severity === 'critical');
    const highErrors = errors.filter(e => e.error.severity === 'high');

    if (criticalErrors.length > 0) {
      console.log('\n🚨 CRITICAL ERRORS (Fix these first):');
      criticalErrors.forEach(({ error, context, rawMessage }) => {
        console.log(`📌 ${error.title}`);
        if (context.file) {
          console.log(`   📁 FILE: ${context.file}`);
          console.log(`   📍 LINE: ${context.line}`);
        } else {
          // Try to extract file info from raw message
          const fileMatch = rawMessage.match(/\/([^\/]+\/[^:]+\.(ts|tsx|js|jsx)):\d+/);
          if (fileMatch) {
            console.log(`   📁 FILE: ${fileMatch[1]}`);
          }
        }
        console.log(`   🛠️  ACTION: ${error.immediateAction}`);
        console.log(`   📝 RAW: ${rawMessage.substring(0, 100)}...`);
        console.log('');
      });
    }

    if (highErrors.length > 0) {
      console.log('\n⚠️  HIGH PRIORITY ERRORS:');
      highErrors.forEach(({ error, context, rawMessage }) => {
        console.log(`📌 ${error.title}`);
        if (context.file) {
          console.log(`   📁 FILE: ${context.file}:${context.line}`);
        }
        console.log(`   🛠️  ACTION: ${error.immediateAction}`);
        console.log('');
      });
    }

    console.log(`\n📊 Summary: ${errors.length} errors found`);
    console.log(`   🚨 Critical: ${criticalErrors.length}`);
    console.log(`   ⚠️  High: ${highErrors.length}`);
    console.log(`   🔧 Medium: ${errors.filter(e => e.error.severity === 'medium').length}`);
    console.log(`   💡 Low: ${errors.filter(e => e.error.severity === 'low').length}`);
    
    if (errors.length > 0) {
      console.log('\n💡 For detailed fix instructions, check the generated error report.');
    }
  }
}