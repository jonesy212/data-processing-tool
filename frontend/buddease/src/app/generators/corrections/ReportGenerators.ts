// ReportGenerators.ts
import path from 'path';
import { Correction, CorrectionReport, } from '@/app/generators/corrections/CorrectionGenerator';
import { TypeHierarchy } from '@/app/generators/corrections/TypeRelationshipMapper';
import { SecurityIssue } from '@//app/generators/corrections/SecurityAuditor'

export class ReportGenerators {
    static generateSecurityReport(report: CorrectionReport): string {
        const securityIssues = report.securityIssues || [];

        const lines: string[] = [];
        lines.push('# 🔒 Security Audit Report');
        lines.push(`**Generated:** ${report.timestamp}`);
        lines.push(`**Total Security Issues:** ${securityIssues.length}`);
        lines.push('');
        lines.push('> ⚠️ Security issues should be addressed immediately to prevent data breaches');
        lines.push('');

        if (securityIssues.length === 0) {
        lines.push('🎉 **No security issues found!** Your codebase follows good security practices.');
        lines.push('');
        return lines.join('\n');
        }

        // Group by severity and type
        const bySeverity = this.groupSecurityIssuesBySeverity(securityIssues);
        const byType = this.groupSecurityIssuesByType(securityIssues);

        // Critical issues first
        if (bySeverity.critical.length > 0) {
        lines.push('## 🚨 Critical Security Issues');
        lines.push('');
        lines.push('**IMMEDIATE ACTION REQUIRED** - These issues pose significant security risks:');
        lines.push('');
        
        bySeverity.critical.forEach((issue, index) => {
            this.generateSecurityIssueSection(lines, issue, index + 1);
        });
        }

        // High severity issues
        if (bySeverity.high.length > 0) {
        lines.push('## ⚠️ High Severity Security Issues');
        lines.push('');
        lines.push('Address these issues soon to maintain security standards:');
        lines.push('');
        
        bySeverity.high.forEach((issue, index) => {
            this.generateSecurityIssueSection(lines, issue, index + 1);
        });
        }

        // Security issue breakdown
        lines.push('## 📊 Security Issues Breakdown');
        lines.push('');
        lines.push('| Issue Type | Count | Severity |');
        lines.push('|------------|-------|----------|');
        
        Object.entries(byType).forEach(([type, issues]) => {
        const severityCounts = this.getSeverityCounts(issues);
        const severitySummary = Object.entries(severityCounts)
            .map(([sev, count]) => `${count} ${sev}`)
            .join(', ');
        
        lines.push(`| ${this.formatSecurityType(type)} | ${issues.length} | ${severitySummary} |`);
        });
        lines.push('');

        // Integration with hierarchy
        lines.push('## 🔗 Security & Architecture Integration');
        lines.push('');
        lines.push('The following security concerns relate to your type hierarchy:');
        lines.push('');
        
        this.generateSecurityHierarchyIntegration(lines, report);
        
        // Security recommendations
        lines.push('## 🛡️ Security Best Practices');
        lines.push('');
        this.generateSecurityRecommendations(lines);
        
        return lines.join('\n');
    }

    private static generateSecurityIssueSection(lines: string[], issue: SecurityIssue, index: number): void {
        lines.push(`### ${index}. ${issue.message}`);
        lines.push(`**File:** ${issue.file}`);
        if (issue.line) lines.push(`**Line:** ${issue.line}`);
        lines.push(`**Type:** ${this.formatSecurityType(issue.type)}`);
        lines.push(`**Severity:** ${issue.severity.toUpperCase()}`);
        lines.push('');
        
        lines.push('**Problem Code:**');
        lines.push('```typescript');
        lines.push(issue.code);
        lines.push('```');
        lines.push('');
        
        lines.push('**Fix:**');
        lines.push('```typescript');
        lines.push(issue.fix);
        lines.push('```');
        
        // Add hierarchy context if available
        const hierarchyContext = this.getSecurityHierarchyContext(issue);
        if (hierarchyContext) {
        lines.push('');
        lines.push('**Architecture Context:**');
        lines.push(hierarchyContext);
        }
        
        lines.push('---');
        lines.push('');
    }

    private static generateSecurityHierarchyIntegration(lines: string[], report: CorrectionReport): void {
        const securityIssues = report.securityIssues || [];
        
        // Find security issues that relate to type hierarchy
        const hierarchyRelatedIssues = securityIssues.filter(issue => 
        issue.type === 'sensitive_data' || issue.type === 'role_violation'
        );

        if (hierarchyRelatedIssues.length === 0) {
        lines.push('*No direct hierarchy-related security issues found.*');
        lines.push('');
        return;
        }

        hierarchyRelatedIssues.forEach((issue, index) => {
        lines.push(`### ${index + 1}. ${issue.message}`);
        
        // Extract type name from file path for hierarchy context
        const typeName = this.extractTypeNameFromFile(issue.file);
        if (typeName && report.typeHierarchies && report.typeHierarchies.has(typeName)) {
            const hierarchy = report.typeHierarchies.get(typeName);
            lines.push(`**Hierarchy Position:** ${hierarchy?.root.type} at depth ${hierarchy?.depth}`);
            
            if (hierarchy?.children.length > 0) {
            lines.push('**Affected Children:**');
            hierarchy.children.forEach(child => {
                lines.push(`- ${child.root.name}`);
            });
            }
        }
        
        lines.push('');
        });
    }

    private static generateSecurityRecommendations(lines: string[]): void {
        const recommendations = [
        {
            title: 'Data Protection',
            items: [
            'Use SecureFieldManager.createField() for all sensitive data fields',
            'Implement useSecurityAudit().sanitizeMetadata() for user-facing data',
            'Classify data sensitivity levels in your type definitions'
            ]
        },
        {
            title: 'Access Control',
            items: [
            'Centralize role management - avoid hardcoded role checks',
            'Use the SecurityAudit class for role-based data sanitization',
            'Implement proper permission hierarchies in your type system'
            ]
        },
        {
            title: 'Architecture Integration',
            items: [
            'Map sensitive data flows through your type hierarchy',
            'Use interface segregation for security boundaries',
            'Implement security-aware type relationships'
            ]
        },
        {
            title: 'API Security',
            items: [
            'Use SecurityAPI for security settings management',
            'Implement proper input validation and output encoding',
            'Audit API methods handling sensitive operations'
            ]
        }
        ];

        recommendations.forEach(rec => {
        lines.push(`#### ${rec.title}`);
        rec.items.forEach(item => {
            lines.push(`- ${item}`);
        });
        lines.push('');
        });
    }

    private static groupSecurityIssuesBySeverity(issues: SecurityIssue[]): Record<string, SecurityIssue[]> {
        const grouped: Record<string, SecurityIssue[]> = {
        critical: [],
        high: [],
        medium: [],
        low: []
        };

        issues.forEach(issue => {
        grouped[issue.severity].push(issue);
        });

        return grouped;
    }

    private static groupSecurityIssuesByType(issues: SecurityIssue[]): Record<string, SecurityIssue[]> {
        const grouped: Record<string, SecurityIssue[]> = {};

        issues.forEach(issue => {
        if (!grouped[issue.type]) {
            grouped[issue.type] = [];
        }
        grouped[issue.type].push(issue);
        });

        return grouped;
    }

    private static getSeverityCounts(issues: SecurityIssue[]): Record<string, number> {
        const counts: Record<string, number> = {};

        issues.forEach(issue => {
        counts[issue.severity] = (counts[issue.severity] || 0) + 1;
        });

        return counts;
    }

    private static formatSecurityType(type: string): string {
        const typeMap: Record<string, string> = {
        'sensitive_data': 'Sensitive Data Exposure',
        'missing_sanitization': 'Missing Sanitization',
        'role_violation': 'Role Violation',
        'insecure_pattern': 'Insecure Pattern'
        };

        return typeMap[type] || type.replace('_', ' ').toUpperCase();
    }

    private static getSecurityHierarchyContext(issue: SecurityIssue): string | null {
        // Extract context based on issue type
        switch (issue.type) {
        case 'sensitive_data':
            return 'This sensitive field should be properly encapsulated in your type hierarchy. Consider using SecureFieldManager in the interface definition.';
        
        case 'role_violation':
            return 'Role-based access should be implemented at the architecture level, not hardcoded in components.';
        
        case 'missing_sanitization':
            return 'Data sanitization should be integrated into your data flow architecture.';
        
        default:
            return null;
        }
    }

    private static extractTypeNameFromFile(filePath: string): string | null {
        const match = filePath.match(/\/([^\/]+)\.(ts|tsx)$/);
        return match ? match[1] : null;
    }
    static generateCriticalErrorsReport(report: CorrectionReport): string {
        const critical = report.corrections.filter(c => c.severity === 'critical');
        
        const lines: string[] = [];
        lines.push('# 🚨 Critical Errors - Blocking Development');
        lines.push(`**Generated:** ${report.timestamp}`);
        lines.push(`**Total Critical Errors:** ${critical.length}`);
        lines.push('');
        lines.push('> ⚠️ These errors prevent the application from compiling or running');
        lines.push('');

        if (critical.length === 0) {
        lines.push('🎉 **No critical errors found!** The application should compile successfully.');
        lines.push('');
        lines.push('Check other reports for warnings and suggestions.');
        return lines.join('\n');
        }

        // Group by file for better organization
        const errorsByFile = new Map<string, Correction[]>();
        critical.forEach(error => {
        if (!errorsByFile.has(error.file)) {
            errorsByFile.set(error.file, []);
        }
        errorsByFile.get(error.file)!.push(error);
        });

        errorsByFile.forEach((errors, file) => {
        lines.push(`## 📄 ${path.basename(file)}`);
        lines.push(`**Path:** ${file}`);
        lines.push('');

        errors.forEach((error, index) => {
            lines.push(`### ${index + 1}. ${error.message}`);
            lines.push(`**Type:** ${error.type}`);
            lines.push(`**Category:** ${error.category}`);
            lines.push('');
            
            if (error.line) {
            lines.push(`**Line ${error.line}:**`);
            }

            lines.push('**Problem Code:**');
            lines.push('```typescript');
            lines.push(error.code);
            lines.push('```');
            lines.push('');

            lines.push('**Fix:**');
            lines.push('```typescript');
            lines.push(error.fix);
            lines.push('```');
            lines.push('---');
            lines.push('');
        });
        });

        // Add summary
        lines.push('## 📊 Critical Errors Summary');
        lines.push('');
        lines.push(`- **Total Files Affected:** ${errorsByFile.size}`);
        lines.push(`- **Total Critical Errors:** ${critical.length}`);
        lines.push('');
        lines.push('## 🎯 Recommended Fix Order');
        lines.push('');
        lines.push('1. **Start with compilation errors** - Fix "cannot find" and import issues first');
        lines.push('2. **Address type errors** - Fix TypeScript type mismatches');
        lines.push('3. **Fix structural issues** - Resolve component and interface problems');
        lines.push('4. **Run validation** - Use `pnpm type-check` to verify fixes');
        lines.push('');

        return lines.join('\n');
    }

  static generateStructuralReport(report: CorrectionReport): string {
    const structuralIssues = report.corrections.filter(c => 
      c.category === 'structure' && c.severity !== 'low'
    );

    const lines: string[] = [];
    lines.push('# 🏗️ Structural Issues Report');
    lines.push(`**Generated:** ${report.timestamp}`);
    lines.push(`**Total Structural Issues:** ${structuralIssues.length}`);
    lines.push('');

    // Group by file for better organization
    const issuesByFile = new Map<string, Correction[]>();
    structuralIssues.forEach(issue => {
      if (!issuesByFile.has(issue.file)) {
        issuesByFile.set(issue.file, []);
      }
      issuesByFile.get(issue.file)!.push(issue);
    });

    issuesByFile.forEach((issues, file) => {
      lines.push(`## 📄 ${path.basename(file)}`);
      lines.push(`**Path:** ${file}`);
      lines.push('');

      issues.forEach((issue, index) => {
        lines.push(`### ${index + 1}. ${issue.message}`);
        lines.push(`**Severity:** ${issue.severity.toUpperCase()}`);
        lines.push(`**Type:** ${issue.type}`);
        lines.push('');
        
        if (issue.line) {
          lines.push('**Location:**');
          lines.push(`\`${file}:${issue.line}\``);
          lines.push('');
        }

        lines.push('**Problem Code:**');
        lines.push('```typescript');
        lines.push(issue.code);
        lines.push('```');
        lines.push('');

        lines.push('**Suggested Fix:**');
        lines.push('```typescript');
        lines.push(issue.fix);
        lines.push('```');
        lines.push('---');
        lines.push('');
      });
    });

    // Add summary of file associations if available
    if (report.fileAssociations && report.fileAssociations.size > 0) {
      lines.push('## 🔗 File Associations');
      lines.push('');
      lines.push('The following files are strongly related and should be reviewed together:');
      lines.push('');

      report.fileAssociations.forEach((associations, file) => {
        if (associations.length > 0) {
          lines.push(`### ${path.basename(file)}`);
          lines.push('**Related Files:**');
          associations.forEach(assocFile => {
            lines.push(`- ${path.basename(assocFile)}`);
          });
          lines.push('');
        }
      });
    }

    return lines.join('\n');
  }

  static generateTypeRelationshipsReport(report: CorrectionReport): string {
    const lines: string[] = [];
    lines.push('# 🔗 Type Relationships Report');
    lines.push(`**Generated:** ${report.timestamp}`);
    lines.push('');

    if (report.typeHierarchies && report.typeHierarchies.size > 0) {
      lines.push('## Type Hierarchies');
      lines.push('');

      report.typeHierarchies.forEach((hierarchy, rootName) => {
        lines.push(`### 🏷️ ${rootName}`);
        lines.push(`**File:** ${hierarchy.root.file}`);
        lines.push(`**Type:** ${hierarchy.root.type}`);
        lines.push(`**Depth:** ${hierarchy.depth}`);
        lines.push('');

        if (hierarchy.children.length > 0) {
          lines.push('**Inheritance Tree:**');
          this.printTypeHierarchy(hierarchy, lines, 1);
        } else {
          lines.push('*No children found*');
        }

        // Show properties and methods
        if (hierarchy.root.properties.length > 0) {
          lines.push('');
          lines.push('**Properties:**');
          hierarchy.root.properties.forEach(prop => {
            lines.push(`- ${prop}`);
          });
        }

        if (hierarchy.root.methods.length > 0) {
          lines.push('');
          lines.push('**Methods:**');
          hierarchy.root.methods.forEach(method => {
            lines.push(`- ${method}`);
          });
        }

        lines.push('');
        lines.push('---');
        lines.push('');
      });
    }

    // Show circular dependencies
    if (report.circularDependencies && report.circularDependencies.length > 0) {
      lines.push('## ⚠️ Circular Dependencies');
      lines.push('');
      lines.push('The following types have circular dependencies that may cause "Excessive stack depth" errors:');
      lines.push('');

      report.circularDependencies.forEach((type, index) => {
        lines.push(`${index + 1}. **${type}**`);
      });
      lines.push('');
    }

    // Show type usage patterns
    const typeUsageIssues = report.corrections.filter(c => 
      c.category === 'compilation' && 
      c.message.includes('cannot find') &&
      c.severity === 'critical'
    );

    if (typeUsageIssues.length > 0) {
      lines.push('## 🔍 Type Usage Issues');
      lines.push('');
      lines.push('Critical type resolution errors found:');
      lines.push('');

      typeUsageIssues.forEach((issue, index) => {
        lines.push(`### ${index + 1}. ${issue.message}`);
        lines.push(`**File:** ${issue.file}`);
        lines.push('**Fix:**');
        lines.push('```typescript');
        lines.push(issue.fix);
        lines.push('```');
        lines.push('');
      });
    }

    return lines.join('\n');
  }

  private static printTypeHierarchy(hierarchy: TypeHierarchy, lines: string[], depth: number): void {
    const indent = '  '.repeat(depth);
    const bullet = depth === 1 ? '└──' : '├──';

    hierarchy.children.forEach((child, index) => {
      const isLast = index === hierarchy.children.length - 1;
      const connector = isLast ? '└──' : '├──';
      
      lines.push(`${indent}${connector} ${child.root.name} (${child.root.type})`);
      
      if (child.children.length > 0) {
        const newIndent = indent + (isLast ? '    ' : '│   ');
        this.printTypeHierarchy(child, lines, depth + 1);
      }
    });
  }

  static generateSnapshotFolderReport(report: CorrectionReport, snapshotFolderPath: string): string {
    // Filter corrections for snapshot folder only
    const snapshotIssues = report.corrections.filter(correction => 
      correction.file.includes(snapshotFolderPath)
    );

    const lines: string[] = [];
    lines.push('# 📸 Snapshot Folder - Critical Issues Report');
    lines.push(`**Generated:** ${report.timestamp}`);
    lines.push(`**Folder:** ${snapshotFolderPath}`);
    lines.push(`**Total Issues:** ${snapshotIssues.length}`);
    lines.push('');

    // Group by severity
    const critical = snapshotIssues.filter(i => i.severity === 'critical');
    const high = snapshotIssues.filter(i => i.severity === 'high');
    const medium = snapshotIssues.filter(i => i.severity === 'medium');

    if (critical.length > 0) {
      lines.push('## 🚨 Critical Issues (Blocking)');
      lines.push('');
      critical.forEach((issue, index) => {
        lines.push(`### ${index + 1}. ${issue.message}`);
        lines.push(`**File:** ${path.basename(issue.file)}`);
        if (issue.line) lines.push(`**Line:** ${issue.line}`);
        lines.push('');
        lines.push('**Fix:**');
        lines.push('```typescript');
        lines.push(issue.fix);
        lines.push('```');
        lines.push('---');
        lines.push('');
      });
    }

    if (high.length > 0) {
      lines.push('## ⚠️ High Priority Issues');
      lines.push('');
      high.forEach((issue, index) => {
        lines.push(`### ${index + 1}. ${issue.message}`);
        lines.push(`**File:** ${path.basename(issue.file)}`);
        lines.push('');
        lines.push('**Fix:**');
        lines.push('```typescript');
        lines.push(issue.fix);
        lines.push('```');
        lines.push('');
      });
    }

    // Add specific snapshot-related recommendations
    lines.push('## 💡 Snapshot-Specific Recommendations');
    lines.push('');
    lines.push('1. **Check import paths** - Ensure all snapshot utilities are properly imported');
    lines.push('2. **Validate data models** - Verify snapshot data structures match component expectations');
    lines.push('3. **Review type definitions** - Ensure snapshot types align with main application types');
    lines.push('4. **Test serialization** - Confirm snapshot data can be properly serialized/deserialized');
    lines.push('');

    return lines.join('\n');
  }
}