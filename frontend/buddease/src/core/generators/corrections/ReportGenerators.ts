// ReportGenerators.ts
import type { SecurityIssue } from '@/core/generators/corrections/SecurityAuditor';
import type { Correction, CorrectionReport, } from '@/core/generators/corrections/CorrectionGenerator';
import type { ImportFix } from '@/core/generators/corrections/ImportFixServicies';
import type { TypeHierarchy } from '@/core/generators/corrections/TypeRelationshipMapper';
import { FileHeaderManager } from '@/utils/fileHeaderManager';

import fs from 'fs';
import path from 'path';

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

    // Update the security report method similarly
    private static generateSecurityIssueSection(lines: string[], issue: SecurityIssue, index: number): void {
        lines.push(`### ${index}. ${issue.message}`);
        lines.push(`**File:** ${issue.file}`);
        if (issue.line) lines.push(`**Line:** ${issue.line}`);
        lines.push(`**Type:** ${this.formatSecurityType(issue.type)}`);
        lines.push(`**Severity:** ${issue.severity.toUpperCase()}`);
        lines.push('');

        // Use improved code formatting
        lines.push('**Problem Code:**');
        if (!issue.code || issue.code.trim() === '') {
            lines.push('```typescript');
            lines.push(this.getCodeContext(issue.file, issue.line));
            lines.push('// Security issue detected - review file for sensitive data exposure');
            lines.push('```');
        } else {
            lines.push(this.formatCodeBlock(issue.code));
        }
        lines.push('');

        lines.push('**Fix:**');

        // Extract fix text - handle both string and ImportFix types
        let fixText = '';
        if (issue.fix) {
            if (typeof issue.fix === 'string') {
                fixText = issue.fix;
            } else if (typeof issue.fix === 'object' && 'newLine' in issue.fix) {
                fixText = (issue.fix as ImportFix).newLine;
            }
        }

        if (!fixText || fixText.trim() === '') {
            lines.push('```typescript');
            lines.push('// Security fix required:');
            lines.push('// 1. Remove hardcoded secrets and API keys');
            lines.push('// 2. Use environment variables for sensitive data');
            lines.push('// 3. Implement proper input validation and sanitization');
            lines.push('// 4. Use SecureFieldManager for sensitive field handling');
            lines.push('```');
        } else {
            lines.push(this.formatCodeBlock(fixText));
        }

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

                const children = hierarchy?.children ?? [];
                if (children.length > 0) {
                    lines.push('**Affected Children:**');
                    children.forEach(child => lines.push(`- ${child.root.name}`));
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

        // Check if we have educational examples
        const educationalExamples = report.corrections.filter(c => c.category === 'education');
        const hasEducationalHeader = educationalExamples.some(e => e.id === 'educational-header');
        const hasOnlyEducationalExamples = hasEducationalHeader && critical.length === 0;

        const lines: string[] = [];
        lines.push('# 🚨 Critical Errors - Blocking Development');
        lines.push(`**Generated:** ${report.timestamp}`);

        if (hasOnlyEducationalExamples) {
            // Show educational examples count instead of errors
            lines.push(`**Educational Examples:** ${educationalExamples.length - 1}`); // -1 for header
        } else {
            lines.push(`**Total Critical Errors:** ${critical.length}`);
        }

        lines.push('');
        lines.push('> ⚠️ These errors prevent the application from compiling or running');
        lines.push('');

        // Handle no errors case with educational examples
        if (hasOnlyEducationalExamples) {
            lines.push('## 🎓 No Critical Errors Found - Educational Examples Below');
            lines.push('');
            lines.push('✅ **Your code compiles successfully!** The examples below are for learning purposes only.');
            lines.push('');
        } else if (critical.length === 0) {
            // No errors and no educational examples
            lines.push('🎉 **No critical errors found!** The application should compile successfully.');
            lines.push('');
            lines.push('Check other reports for warnings and suggestions.');
            return lines.join('\n');
        }

        // Show real critical errors if they exist
        if (critical.length > 0) {
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

                    lines.push(...this.generateProblemCodeSection(error));
                    lines.push(...this.generateFixSection(error));

                    lines.push('---');
                    lines.push('');
                });
            });
        }

        // Show educational examples ONLY when there are no critical errors
        if (hasOnlyEducationalExamples) {
            lines.push('## 💡 TypeScript Best Practices & Patterns');
            lines.push('');
            lines.push('*These examples demonstrate common TypeScript patterns - implement them to improve code quality*');
            lines.push('');

            educationalExamples.forEach((example, index) => {
                const fixText = this.getFixText(example) || '// Best practice implementation';

                if (example.id === 'educational-header') {
                    return; // Skip header
                }

                lines.push(`### Example ${index + 1}: ${example.message}`);
                lines.push(`**File:** ${example.file}`);
                if (example.line && example.line > 0) {
                    lines.push(`**Reference Line:** ${example.line}`);
                }
                lines.push('');

                lines.push('**Current Pattern:**');
                lines.push('```typescript');
                lines.push(example.code || '// Pattern demonstration');
                lines.push('```');
                lines.push('');

                lines.push('**Improved Approach:**');
                lines.push('```typescript');
                lines.push(fixText);
                lines.push('```');
                lines.push('---');
                lines.push('');
            });
        }

        // Add appropriate summary based on content
        lines.push('## 📊 Summary');
        lines.push('');

        if (hasOnlyEducationalExamples) {
            lines.push(`- **Educational Examples:** ${educationalExamples.length - 1}`);
            lines.push('- **Critical Errors:** 0 ✅');
            lines.push('- **Status:** Code compiles successfully');
        } else if (critical.length > 0) {
            const errorsByFile = new Map<string, Correction[]>();
            critical.forEach(error => errorsByFile.set(error.file, []));

            lines.push(`- **Files Affected:** ${errorsByFile.size}`);
            lines.push(`- **Total Critical Errors:** ${critical.length}`);
            lines.push('- **Status:** ❌ Fix required before compilation');
        } else {
            lines.push('- **Critical Errors:** 0 ✅');
            lines.push('- **Status:** Code compiles successfully');
        }

        lines.push('');
        lines.push('## 🎯 Recommended Fix Order');
        lines.push('');

        if (critical.length > 0) {
            lines.push('1. **Start with compilation errors** - Fix "cannot find" and import issues first');
            lines.push('2. **Address type errors** - Fix TypeScript type mismatches');
            lines.push('3. **Fix structural issues** - Resolve component and interface problems');
            lines.push('4. **Run validation** - Use `pnpm type-check` to verify fixes');
        } else if (hasOnlyEducationalExamples) {
            lines.push('1. **Review educational examples** - Learn TypeScript best practices');
            lines.push('2. **Implement improvements** - Apply patterns to enhance code quality');
            lines.push('3. **Run validation** - Use `pnpm type-check` to ensure no regressions');
            lines.push('4. **Continue development** - Your codebase is in good shape!');
        } else {
            lines.push('1. **Run validation** - Use `pnpm type-check` to verify compilation');
            lines.push('2. **Review other reports** - Check for warnings and suggestions');
            lines.push('3. **Continue development** - No critical issues found');
        }

        lines.push('');

        return lines.join('\n');
    }


    static async generateComponentReport(
        componentPath: string,
        corrections: Correction[]
    ): Promise<string> {
        const componentIssues = corrections.filter(c => c.file === componentPath);

        const report: CorrectionReport = {
            timestamp: new Date().toISOString(),
            summary: this.createSummary(componentIssues),
            corrections: componentIssues,
            securityIssues: [],
            typeHierarchies: new Map(),
            fileAssociations: new Map(),
            circularDependencies: []
        };

        const lines: string[] = [];
        lines.push(`# 🎯 Component Analysis: ${path.basename(componentPath)}`);
        lines.push(`**Generated:** ${report.timestamp}`);
        lines.push(`**Total Issues:** ${componentIssues.length}`);
        lines.push('');

        if (componentIssues.length === 0) {
            lines.push('✅ No issues found in this component!');
            return lines.join('\n');
        }

        // Group by severity
        const bySeverity = {
            critical: componentIssues.filter(i => i.severity === 'critical'),
            high: componentIssues.filter(i => i.severity === 'high'),
            medium: componentIssues.filter(i => i.severity === 'medium'),
            low: componentIssues.filter(i => i.severity === 'low')
        };

        // Add issues by severity
        Object.entries(bySeverity).forEach(([severity, issues]) => {
            if (issues.length > 0) {
                lines.push(`## ${this.getSeverityIcon(severity)} ${severity.toUpperCase()} Issues (${issues.length})`);
                lines.push('');

                issues.forEach((issue, index) => {
                    lines.push(`### ${index + 1}. ${issue.message}`);
                    lines.push(`**Type:** ${issue.type} | **Category:** ${issue.category}`);
                    if (issue.line) lines.push(`**Line:** ${issue.line}`);
                    lines.push('');

                    if (issue.code) {
                        lines.push('**Code:**');
                        lines.push('```typescript');
                        lines.push(issue.code);
                        lines.push('```');
                        lines.push('');
                    }

                    if (issue.fix) {
                        lines.push('**Fix:**');
                        lines.push('```typescript');
                        const fixText = this.getFixText(issue);
                        lines.push(fixText);
                        lines.push('```');
                    }

                    lines.push('---');
                    lines.push('');
                });
            }
        });

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

            // USE THE HELPER METHOD HERE
            issues.forEach((issue, index) => {
                this.generateStructuralIssueSection(lines, issue, index);
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

        if (!report.typeHierarchies || report.typeHierarchies.size === 0) {
            lines.push('## No Type Relationships Found');
            lines.push('');
            lines.push('No type hierarchy data was collected during analysis.');
            return lines.join('\n');
        }

        const totalTypes = report.typeHierarchies.size;

        // SECTION 1: Type Dependency Graph (Key Relationships)
        lines.push(`## 🔄 Type Dependency Graph (${totalTypes} types)`);
        lines.push('');
        lines.push('*Shows how types relate to each other through inheritance and implementation*');
        lines.push('');

        // Build dependency graph for analysis
        const dependencyGraph = new Map<string, { dependencies: string[], dependents: string[] }>();

        // First pass: Build the graph
        report.typeHierarchies.forEach((typeHierarchy, typeName) => {
            if (!typeHierarchy || !typeHierarchy.root || !typeName) return;

            const typeNode = typeHierarchy.root;
            const dependencies: string[] = [];

            // Collect inheritance dependencies from the root node
            if (typeNode.extends && typeNode.extends.length > 0) {
                typeNode.extends.forEach(ext => {
                    if (ext && !dependencies.includes(ext)) dependencies.push(ext);
                });
            }

            // Collect implementation dependencies from the root node
            if (typeNode.implements && typeNode.implements.length > 0) {
                typeNode.implements.forEach(impl => {
                    if (impl && !dependencies.includes(impl)) dependencies.push(impl);
                });
            }

            dependencyGraph.set(typeName, { dependencies, dependents: [] });
        });

        // Second pass: Build dependents (reverse dependencies)
        dependencyGraph.forEach((data, typeName) => {
            data.dependencies.forEach(dep => {
                const depData = dependencyGraph.get(dep);
                if (depData && !depData.dependents.includes(typeName)) {
                    depData.dependents.push(typeName);
                }
            });
        });

        // SECTION 1A: Inheritance Chains
        const inheritanceChains = Array.from(dependencyGraph.entries())
            .filter(([_, data]) => data.dependencies.length > 0);

        if (inheritanceChains.length > 0) {
            lines.push('### 🏗️ Inheritance Chains');
            lines.push('');

            inheritanceChains.forEach(([typeName, data]) => {
                lines.push(`**${typeName}**`);
                if (data.dependencies.length > 0) {
                    lines.push(`← Extends/Implements: ${data.dependencies.join(', ')}`);
                }
                if (data.dependents.length > 0) {
                    lines.push(`→ Extended by: ${data.dependents.join(', ')}`);
                }
                lines.push('');
            });
            lines.push('---');
            lines.push('');
        }

        // SECTION 1B: Root Types (No dependencies)
        const rootTypes = Array.from(dependencyGraph.entries())
            .filter(([_, data]) => data.dependencies.length === 0);

        if (rootTypes.length > 0) {
            lines.push('### 🌱 Root Types (No Dependencies)');
            lines.push('');
            rootTypes.forEach(([typeName, data]) => {
                lines.push(`- **${typeName}**`);
                if (data.dependents.length > 0) {
                    lines.push(`  *Used by ${data.dependents.length} types: ${data.dependents.join(', ')}*`);
                }
            });
            lines.push('');
        }

        // SECTION 1C: Leaf Types (No dependents)
        const leafTypes = Array.from(dependencyGraph.entries())
            .filter(([_, data]) => data.dependents.length === 0 && data.dependencies.length > 0);

        if (leafTypes.length > 0) {
            lines.push('### 🍃 Leaf Types (No Dependents)');
            lines.push('');
            leafTypes.forEach(([typeName, data]) => {
                lines.push(`- **${typeName}**`);
                if (data.dependencies.length > 0) {
                    lines.push(`  *Extends: ${data.dependencies.join(', ')}*`);
                }
            });
            lines.push('');
        }

        // SECTION 2: Detailed Type Analysis
        lines.push('## 📊 Detailed Type Analysis');
        lines.push('');

        report.typeHierarchies.forEach((typeHierarchy, typeName) => {
            if (!typeHierarchy || !typeHierarchy.root || !typeName) return;

            const typeNode = typeHierarchy.root;
            const graphData = dependencyGraph.get(typeName);
            const isRoot = graphData?.dependencies.length === 0;
            const isLeaf = graphData?.dependents.length === 0;

            lines.push(`### ${typeName}`);

            // Type metadata
            lines.push('**Metadata:**');
            lines.push(`- **File:** ${typeNode.file || 'Unknown'}`);
            lines.push(`- **Type:** ${typeNode.type}`);
            lines.push(`- **Role:** ${isRoot ? '🏛️ Root' : isLeaf ? '🍃 Leaf' : '🔄 Intermediate'}`);
            if (graphData) {
                lines.push(`- **Dependencies:** ${graphData.dependencies.length}`);
                lines.push(`- **Dependents:** ${graphData.dependents.length}`);
            }
            lines.push('');

            // Inheritance details from the root node
            if (typeNode.extends && typeNode.extends.length > 0) {
                lines.push('**Inheritance:**');
                typeNode.extends.forEach(ext => {
                    if (ext) {
                        const extData = dependencyGraph.get(ext);
                        const dependentCount = extData?.dependents.length || 0;
                        lines.push(`- ${ext} *(${dependentCount} dependents)*`);
                    }
                });
                lines.push('');
            }

            // Implementation details from the root node
            if (typeNode.implements && typeNode.implements.length > 0) {
                lines.push('**Implementation:**');
                typeNode.implements.forEach(impl => {
                    if (impl) {
                        const implData = dependencyGraph.get(impl);
                        const dependentCount = implData?.dependents.length || 0;
                        lines.push(`- ${impl} *(${dependentCount} implementations)*`);
                    }
                });
                lines.push('');
            }

            // Member analysis from the root node
            const totalMembers = (typeNode.methods?.length || 0) + (typeNode.properties?.length || 0);
            lines.push(`**Members (${totalMembers}):**`);

            if (typeNode.methods && typeNode.methods.length > 0) {
                lines.push(`- **Methods:** ${typeNode.methods.length}`);
                if (typeNode.methods.length <= 5) {
                    typeNode.methods.forEach(method => {
                        if (method) lines.push(`  - ${method}`);
                    });
                } else {
                    lines.push(`  - ${typeNode.methods.slice(0, 3).join(', ')}...`);
                }
            }

            if (typeNode.properties && typeNode.properties.length > 0) {
                lines.push(`- **Properties:** ${typeNode.properties.length}`);
                if (typeNode.properties.length <= 5) {
                    typeNode.properties.forEach(prop => {
                        if (prop) lines.push(`  - ${prop}`);
                    });
                } else {
                    lines.push(`  - ${typeNode.properties.slice(0, 3).join(', ')}...`);
                }
            }

            lines.push('---');
            lines.push('');
        });

        // SECTION 3: Architecture Insights
        lines.push('## 🏛️ Architecture Insights');
        lines.push('');

        const totalDependencies = Array.from(dependencyGraph.values())
            .reduce((sum, data) => sum + data.dependencies.length, 0);
        const avgDependencies = totalTypes > 0 ? (totalDependencies / totalTypes).toFixed(2) : '0';

        lines.push(`- **Total Type Relationships:** ${totalDependencies}`);
        lines.push(`- **Average Dependencies per Type:** ${avgDependencies}`);
        lines.push(`- **Most Dependent Type:** ${this.findMostDependentType(dependencyGraph)}`);
        lines.push(`- **Most Reused Type:** ${this.findMostReusedType(dependencyGraph)}`);
        lines.push('');

        // SECTION 4: Circular Dependencies & Issues
        if (report.circularDependencies && report.circularDependencies.length > 0) {
            lines.push('## ⚠️ Circular Dependencies');
            lines.push('');
            report.circularDependencies.forEach((type, index) => {
                if (type) lines.push(`${index + 1}. **${type}**`);
            });
            lines.push('');
        }

        // SECTION 5: Summary
        lines.push('## 📈 Summary');
        lines.push('');

        lines.push(`- **Total Types:** ${totalTypes}`);
        lines.push(`- **Root Types:** ${rootTypes.length}`);
        lines.push(`- **Leaf Types:** ${leafTypes.length}`);
        lines.push(`- **Intermediate Types:** ${totalTypes - rootTypes.length - leafTypes.length}`);
        lines.push(`- **Total Relationships:** ${totalDependencies}`);
        lines.push(`- **Architecture Complexity:** ${this.getComplexityLevel(totalTypes, totalDependencies)}`);

        return lines.join('\n');
    }


    // Helper methods
    private static findMostDependentType(graph: Map<string, { dependencies: string[], dependents: string[] }>): string {
        let maxDeps = 0;
        let mostDependent = 'None';

        graph.forEach((data, typeName) => {
            if (data.dependencies.length > maxDeps) {
                maxDeps = data.dependencies.length;
                mostDependent = `${typeName} (${maxDeps} deps)`;
            }
        });

        return mostDependent;
    }

    private static findMostReusedType(graph: Map<string, { dependencies: string[], dependents: string[] }>): string {
        let maxDependents = 0;
        let mostReused = 'None';

        graph.forEach((data, typeName) => {
            if (data.dependents.length > maxDependents) {
                maxDependents = data.dependents.length;
                mostReused = `${typeName} (${maxDependents} users)`;
            }
        });

        return mostReused;
    }

    private static getComplexityLevel(typeCount: number, relationshipCount: number): string {
        const ratio = relationshipCount / typeCount;
        if (ratio < 0.5) return '🟢 Simple';
        if (ratio < 1.5) return '🟡 Moderate';
        if (ratio < 3) return '🟠 Complex';
        return '🔴 Highly Complex';
    }

    private static printTypeHierarchy(hierarchy: TypeHierarchy, lines: string[], depth: number): void {
        // Add null checks at the start
        if (!hierarchy || !hierarchy.children || !Array.isArray(hierarchy.children)) return;

        const indent = '  '.repeat(depth);
        const bullet = depth === 1 ? '└──' : '├──';

        hierarchy.children.forEach((child, index) => {
            // Add null checks for child and child.root
            if (!child || !child.root) return;

            const isLast = index === hierarchy.children.length - 1;
            const connector = isLast ? '└──' : '├──';

            lines.push(`${indent}${connector} ${child.root.name} (${child.root.type})`);

            // Add null check for child.children before accessing length
            if (child.children && Array.isArray(child.children) && child.children.length > 0) {
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
                const fixText = this.getFixText(issue);
                lines.push(fixText);
            
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
                const fixText = this.getFixText(issue);
                lines.push(fixText);
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

    static generateMetroConfigReport(report: CorrectionReport): string {
        const metroIssues = report.corrections.filter(correction => {
            // Add null checks for all properties
            const file = correction.file || '';
            const message = correction.message || '';
            const category = correction.category || '';

            return file.includes('metro.config') ||
                (category === 'performance' && message.includes('Metro')) ||
                file.includes('.metro') ||
                message.includes('Metro');
        });

        const lines: string[] = [];
        lines.push('# 🚇 Metro Configuration Issues');
        lines.push(`**Generated:** ${report.timestamp}`);
        lines.push(`**Total Metro Issues:** ${metroIssues.length}`);
        lines.push('');
        lines.push('> ⚠️ Metro issues can affect React Native build performance and reliability');
        lines.push('');

        if (metroIssues.length === 0) {
            lines.push('✅ No Metro configuration issues found!');
            lines.push('');
            lines.push('Your Metro configuration appears to be properly set up.');
            return lines.join('\n');
        }

        // Group by severity
        const critical = metroIssues.filter(issue => issue.severity === 'critical');
        const high = metroIssues.filter(issue => issue.severity === 'high');
        const medium = metroIssues.filter(issue => issue.severity === 'medium');
        const low = metroIssues.filter(issue => issue.severity === 'low');

        if (critical.length > 0) {
            lines.push('## 🚨 Critical Issues');
            lines.push('');
            critical.forEach(issue => {
                lines.push(this.formatMetroIssue(issue));
            });
        }

        if (high.length > 0) {
            lines.push('## ⚠️ High Priority Issues');
            lines.push('');
            high.forEach(issue => {
                lines.push(this.formatMetroIssue(issue));
            });
        }

        if (medium.length > 0) {
            lines.push('## 🔧 Medium Priority Issues');
            lines.push('');
            medium.forEach(issue => {
                lines.push(this.formatMetroIssue(issue));
            });
        }

        if (low.length > 0) {
            lines.push('## 💡 Suggestions');
            lines.push('');
            low.forEach(issue => {
                lines.push(this.formatMetroIssue(issue));
            });
        }

        // Add Metro-specific recommendations
        lines.push('');
        lines.push('## 🛠️ Metro Configuration Tips');
        lines.push('');
        lines.push('### Common Metro Fixes:');
        lines.push('- **Reset cache**: `npx react-native start --reset-cache`');
        lines.push('- **Clear watchman**: `watchman watch-del-all`');
        lines.push('- **Reinstall dependencies**: `rm -rf node_modules && npm install`');
        lines.push('');
        lines.push('### Performance Optimization:');
        lines.push('- Configure `maxWorkers` for your CPU cores');
        lines.push('- Set up `cacheVersion` for better caching');
        lines.push('- Use `watchFolders` for monorepo setups');
        lines.push('');
        lines.push('### TypeScript Support:');
        lines.push('- Ensure `ts` and `tsx` are in `sourceExts`');
        lines.push('- Configure proper `assetExts` for your assets');

        return lines.join('\n');
    }


    private static getFixText(correction: Correction): string {
        if (typeof correction.fix === 'string') {
            return correction.fix;
        }

        // Handle ImportFix object
        if (correction.fix && typeof correction.fix === 'object' && 'newLine' in correction.fix) {
            return correction.fix.newLine;
        }

        // Handle other fix types
        if (correction.suggestedFix) {
            return correction.suggestedFix;
        }

        if (correction.complexFix) {
            return `[Complex ${correction.complexFix.type} fix]`;
        }

        return '// Manual fix implementation required';
    }

    // Helper method to check if it's an ImportFix
    private static isImportFix(fix: any): fix is ImportFix {
        return fix && typeof fix === 'object' && 'newLine' in fix && 'filePath' in fix;
    }

    private static formatMetroIssue(issue: Correction): string {
        const lines: string[] = [];

        lines.push(`### ${this.getSeverityIcon(issue.severity)} ${issue.title || issue.message}`);
        lines.push('');
        lines.push(`- **File**: \`${issue.file}\``);
        if (issue.line) {
            lines.push(`- **Line**: ${issue.line}`);
        }
        lines.push(`- **Severity**: ${issue.severity}`);
        lines.push(`- **Category**: ${issue.category}`);
        lines.push('');

        if (issue.message) {
            lines.push('**Description:**');
            lines.push(`${issue.message}`);
            lines.push('');
        }

        if (issue.code && issue.code.length > 0 && issue.code !== 'undefined') {
            lines.push('**Current Configuration:**');
            lines.push('```javascript');
            lines.push(issue.code);
            lines.push('```');
            lines.push('');
        }

        const fixText = this.getFixText(issue);
        if (issue.fix) {
            lines.push('**Recommended Fix:**');
            lines.push('```javascript');
            lines.push(fixText);
            lines.push('```');
            lines.push('');
        }

        if (issue.suggestion) {
            lines.push(`💡 **Suggestion**: ${issue.suggestion}`);
            lines.push('');
        }

        lines.push('---');
        lines.push('');

        return lines.join('\n');
    }

    private static getSeverityIcon(severity: string): string {
        const icons = {
            critical: '🚨',
            high: '⚠️',
            medium: '🔧',
            low: '💡'
        };
        return icons[severity as keyof typeof icons] || '📝';
    }

    private static formatCodeBlock(code: string | undefined, language: string = 'typescript'): string {
        if (!code || code.trim() === '' || code === 'undefined') {
            return `\`\`\`${language}\n// No code available - check the original file for context\n\`\`\``;
        }

        // Clean up the code - remove excessive whitespace but preserve structure
        const cleanedCode = code
            .trim()
            .replace(/\n\s*\n\s*\n/g, '\n\n') // Replace multiple blank lines with double
            .replace(/^\s+|\s+$/g, ''); // Trim start/end whitespace

        return `\`\`\`${language}\n${cleanedCode}\n\`\`\``;
    }
    private static getCodeContext(filePath: string, lineNumber?: number): string {
        if (!lineNumber) {
            return `// Check file: ${filePath}`;
        }
        return `// Check file: ${filePath} at line ${lineNumber}`;
    }
    private static generateProblemCodeSection(correction: Correction): string[] {
        const lines: string[] = [];

        lines.push('**Problem Code:**');

        const codeContent = typeof correction.code === 'string' ? correction.code : undefined;

        if (!codeContent || codeContent.trim() === '' || codeContent === 'undefined') {
            lines.push('```typescript');
            lines.push(this.getCodeContext(correction.file, correction.line));

            const clearerMessage = this.generateClearExtractionError(correction.file);
            lines.push(`// ${clearerMessage}`);

            lines.push('```');
        } else {
            lines.push(this.formatCodeBlock(codeContent));
        }

        lines.push('');
        return lines;
    }


    private static generateClearExtractionError(filePath: string): string {
        if (!fs.existsSync(filePath)) {
            return `File not found: ${filePath}`;
        }

        try {
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                return `Path is a directory, not a file: ${filePath}`;
            }
        } catch (error) {
            return `Cannot access path: ${filePath}`;
        }

        // Attempt to fix the file header
        const fixAttempted = FileHeaderManager.ensureFilenameComment(filePath);

        return `
    🔍 Analysis Issue: Unable to extract code from ${filePath}

    Possible causes:
    1. File may have syntax errors or unusual formatting
    2. Missing proper file header comment
    3. Encoding issues detected
    4. Very long lines or complex nested structures

    Auto-fix attempted: ${fixAttempted ? '✅ Added filename header' : '⚠️ Header already exists or fix failed'}

    Please check the file manually if issues persist.
        `.trim().split('\n').map(line => `// ${line}`).join('\n');
    }

    private static generateFixSection(correction: Correction): string[] {
        const lines: string[] = [];

        lines.push('**Fix:**');

        const fixContent = typeof correction.fix === 'string' ? correction.fix : undefined;

        if (!fixContent || fixContent.trim() === '' || fixContent === 'undefined') {
            lines.push('```typescript');
            lines.push('// Fix recommendation:');

            const suggestedFix = this.generateContextualFix(correction);
            lines.push(suggestedFix);
            lines.push('```');
        } else {
            lines.push(this.formatCodeBlock(fixContent));
        }

        lines.push('');
        return lines;
    }

    private static generateContextualFix(correction: Correction): string {
        const { type, category, message } = correction;

        // Generate fix suggestions based on error patterns
        if (message?.includes('undefined') || message?.includes('cannot find')) {
            return `// Import missing dependencies or check variable definitions
Verify the referenced item exists and is properly exported`; // ← Remove extra indentation
        }

        if (category === 'compilation') {
            return `// Fix compilation error:
1. Check imports and exports
2. Verify TypeScript types
3. Ensure all dependencies are installed`; // ← Remove extra indentation
        }

        if (category === 'runtime') {
            return `// Fix runtime error:
    // 1. Add null/undefined checks
    // 2. Handle error cases
    // 3. Validate data before use`;
        }

        if (type === 'type_error') {
            return `// Fix type error:
    // 1. Check TypeScript interface compatibility
    // 2. Add proper type annotations
    // 3. Use type guards where needed`;
        }

        if (category === 'security') {
            return `// Address security concern:
    // 1. Remove hardcoded secrets
    // 2. Use environment variables
    // 3. Implement proper data sanitization`;
        }

        return `// General fix required:
    // Review the error context and implement appropriate solution`;
    }


    private static generateStructuralIssueSection(lines: string[], issue: Correction, index: number): void {
        lines.push(`### ${index + 1}. ${issue.message}`);
        lines.push(`**Severity:** ${issue.severity.toUpperCase()}`);
        lines.push(`**Type:** ${issue.type}`);
        lines.push('');

        if (issue.line) {
            lines.push('**Location:**');
            lines.push(`\`${issue.file}:${issue.line}\``);
            lines.push('');
        }

        // Use improved code formatting
        lines.push(...this.generateProblemCodeSection(issue));
        lines.push(...this.generateFixSection(issue));

        lines.push('---');
        lines.push('');
    }
    static async generateFromExistingReports(): Promise<void> {
        console.log('📊 Generating enhanced reports from existing correction data...');

        try {
            // Read your existing numerical summary
            const numericalSummary = JSON.parse(
                await fs.promises.readFile('corrections/numerical-summary.json', 'utf8')
            );

            // Read your existing full report if available - ADD TYPE ANNOTATIONS
            let existingCorrections: Correction[] = [];
            let existingSecurityIssues: Correction[] = [];
            try {
                const fullReport = JSON.parse(
                    await fs.promises.readFile('corrections/full-report.json', 'utf8')
                );
                existingCorrections = fullReport.corrections || [];
                existingSecurityIssues = fullReport.securityIssues || [];
            } catch {
                console.log('ℹ️ No full-report.json found, using numerical summary only');
            }

            // Calculate byCategory from existing corrections
            const byCategory: Record<string, number> = {};
            existingCorrections.forEach((issue: Correction) => {
                byCategory[issue.category] = (byCategory[issue.category] || 0) + 1;
            });

            // Create comprehensive report with CORRECT summary properties
            const report: CorrectionReport = {
                timestamp: new Date().toISOString(),
                summary: {
                    totalErrors: numericalSummary.totalIssues || existingCorrections.length,
                    critical: numericalSummary.criticalIssues || existingCorrections.filter((c: Correction) => c.severity === 'critical').length,
                    high: numericalSummary.highIssues || existingCorrections.filter((c: Correction) => c.severity === 'high').length,
                    medium: numericalSummary.mediumIssues || existingCorrections.filter((c: Correction) => c.severity === 'medium').length,
                    low: numericalSummary.lowIssues || existingCorrections.filter((c: Correction) => c.severity === 'low').length,
                    byCategory: byCategory
                },
                corrections: existingCorrections,
                securityIssues: existingSecurityIssues,
                typeHierarchies: new Map(),
                fileAssociations: new Map(),
                circularDependencies: []
            };

            // Generate all report types
            const reports = {
                'comprehensive-enhanced.md': this.generateStructuralReport(report),
                'security-enhanced.md': this.generateSecurityReport(report),
                'critical-enhanced.md': this.generateCriticalErrorsReport(report),
                'types-enhanced.md': this.generateTypeRelationshipsReport(report)
            };

            // Save enhanced reports
            for (const [filename, content] of Object.entries(reports)) {
                await fs.promises.writeFile(`corrections/${filename}`, content);
            }

            console.log('✅ Enhanced reports generated!');

        } catch (error) {
            console.error('❌ Error generating from existing reports:', error);
        }
    }
    
    static async analyzeSpecificFolders(folderPaths: string[]): Promise<void> {
        console.log(`🔍 Analyzing specific folders: ${folderPaths.join(', ')}`);

        for (const folderPath of folderPaths) {
            const corrections: Correction[] = [
                {
                    id: `folder-${folderPath.replace(/\//g, '-')}`,
                    file: folderPath,
                    message: `Analysis of ${folderPath} folder`,
                    severity: 'low' as const,
                    category: 'structure' as const,
                    type: 'structural', 
                    code: `// Folder: ${folderPath}\n// Contains multiple files and components`,
                    fix: `// Review imports and exports in this folder`
                }
            ];

            const report: CorrectionReport = {
                timestamp: new Date().toISOString(),
                summary: this.createSummary(corrections),
                corrections: corrections,
                securityIssues: [],
                typeHierarchies: new Map(),
                fileAssociations: new Map(),
                circularDependencies: []
            };

            const folderName = folderPath.split('/').pop() || 'unknown';
            const reportContent = this.generateStructuralReport(report);

            await fs.promises.mkdir(`corrections/${folderName}`, { recursive: true });
            await fs.promises.writeFile(
                `corrections/${folderName}/folder-analysis.md`,
                reportContent
            );

            console.log(`✅ ${folderPath} analysis saved`);
        }
    }

    private static createSummary(corrections: Correction[]): {
        totalErrors: number;
        critical: number;
        high: number;
        medium: number;
        low: number;
        byCategory: Record<string, number>;
    } {
        const byCategory: Record<string, number> = {};
        corrections.forEach(issue => {
            byCategory[issue.category] = (byCategory[issue.category] || 0) + 1;
        });

        return {
            totalErrors: corrections.length,
            critical: corrections.filter(i => i.severity === 'critical').length,
            high: corrections.filter(i => i.severity === 'high').length,
            medium: corrections.filter(i => i.severity === 'medium').length,
            low: corrections.filter(i => i.severity === 'low').length,
            byCategory: byCategory
        };
    }
    
    private static extractFixText(correctable: Correction | SecurityIssue): string {
        // Handle Correction type
        if ('category' in correctable) {
            const correction = correctable as Correction;
            
            if (typeof correction.fix === 'string') {
                return correction.fix;
            }
            
            if (correction.fix && typeof correction.fix === 'object' && 'newLine' in correction.fix) {
                return (correction.fix as ImportFix).newLine;
            }
            
            if (correction.suggestedFix) {
                return correction.suggestedFix;
            }
            
            if (correction.complexFix) {
                return `[Complex ${correction.complexFix.type} fix]`;
            }
        }
        
        // Handle SecurityIssue type
        if (typeof correctable.fix === 'string') {
            return correctable.fix;
        }
        
        if (correctable.fix && typeof correctable.fix === 'object' && 'newLine' in correctable.fix) {
            return (correctable.fix as ImportFix).newLine;
        }
        
        // Fallback for both types
        if ('category' in correctable && correctable.category === 'security') {
            return '// Security fix required - review sensitive data handling';
        }
        
        return '// Manual fix implementation required';
    }

    private static generateIssueSection(issue: Correction | SecurityIssue, includeCode: boolean = true): string[] {
        const lines: string[] = [];
        
        lines.push(`### ${issue.message}`);
        lines.push(`**File:** ${issue.file}`);
        if (issue.line) lines.push(`**Line:** ${issue.line}`);
        
        if (includeCode && issue.code) {
            lines.push('**Problem Code:**');
            lines.push(this.formatCodeBlock(issue.code));
        }
        
        // Use the centralized fix rendering
        lines.push(...this.renderFixSection(issue));
        
        return lines;
    }

    // For report sections
    private static renderFixSection(issue: Correction | SecurityIssue): string[] {
        const lines: string[] = [];
        const fixText = this.extractFixText(issue);
        
        lines.push('**Fix:**');
        if (!fixText || fixText.trim() === '') {
            lines.push('```typescript');
            lines.push('// Fix recommendation required');
            lines.push('```');
        } else {
            lines.push(this.formatCodeBlock(fixText));
        }
        
        return lines;
    }
}