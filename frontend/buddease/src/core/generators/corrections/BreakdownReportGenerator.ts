// BreakdownReportGenerator.ts
import { ComponentBreakdown, ComprehensiveBreakdown, InterfaceBreakdown, MethodBreakdown } from '@/core/generators/corrections/analyzers/ComprehensiveBreakdownAnalyzer';
import { CorrectionReport } from '@/core/generators/corrections/CorrectionGenerator';

export class BreakdownReportGenerator {
    private static processComponent(component: ComponentBreakdown): string {
        return `Component: ${component.name} - ${component.errors} errors`;
    }

    private static processMethod(method: MethodBreakdown): string {
        return `Method: ${method.component}.${method.method}()`;
    }

    private static processInterface(intf: InterfaceBreakdown): string {
        return `Interface: ${intf.name} - ${intf.implementations} impls`;
    }

    static generateComprehensiveReport(
        breakdown: ComprehensiveBreakdown, 
        originalReport: CorrectionReport
    ): string {
        const lines: string[] = [];

        lines.push('# 📊 Comprehensive Error Breakdown');
        lines.push(`**Generated:** ${originalReport.timestamp}`);
        lines.push('');

        // Executive Summary
        lines.push('## 🎯 Executive Summary');
        lines.push('');
        lines.push('### Impact Analysis');
        lines.push(`- **Affected Components:** ${breakdown.summary.affectedComponents}/${breakdown.summary.totalComponents}`);
        lines.push(`- **Affected Methods:** ${breakdown.summary.affectedMethods}/${breakdown.summary.totalMethods}`);
        lines.push(`- **Affected Interfaces:** ${breakdown.summary.affectedInterfaces}/${breakdown.summary.totalInterfaces}`);
        lines.push('');

        // Components Breakdown
        lines.push('## 🏗️ Components Breakdown');
        lines.push('');
        breakdown.components.forEach(component => {
            lines.push(`### ${component.name}`);
            lines.push(`**File:** ${component.file}`);
            lines.push(`**Total Issues:** ${component.corrections.length}`);
            lines.push(`**Critical:** ${component.critical} | **High:** ${component.high} | **Medium:** ${component.medium} | **Low:** ${component.low}`);
            lines.push('');
        });

        // Methods Breakdown
        lines.push('## ⚙️ Methods Breakdown');
        lines.push('');
        breakdown.methods.forEach(method => {
            lines.push(`### ${method.component}.${method.method}()`);
            lines.push(`**File:** ${method.file}:${method.line}`);
            lines.push(`**Issues:** ${method.errors}`);
            lines.push('');
        });

        // Interfaces Breakdown
        lines.push('## 📐 Interfaces Breakdown');
        lines.push('');
        breakdown.interfaces.forEach(intf => {
            lines.push(`### ${intf.name}`);
            lines.push(`**File:** ${intf.file}`);
            lines.push(`**Issues:** ${intf.errors}`);
            lines.push(`**Implementations:** ${intf.implementations}`);
            lines.push('');
        });

        // Categorical Analysis
        lines.push('## 📈 Categorical Analysis');
        lines.push('');
        
        lines.push('### By Component');
        Object.entries(breakdown.categories.byComponent)
            .sort(([,a], [,b]) => b - a)
            .forEach(([component, count]) => {
                lines.push(`- **${component}:** ${count} issues`);
            });
        lines.push('');

        lines.push('### By File Type');
        Object.entries(breakdown.categories.byFileType).forEach(([type, count]) => {
            lines.push(`- **${type}:** ${count} issues`);
        });
        lines.push('');

        lines.push('### By Complexity');
        lines.push(`- **Simple (Low):** ${breakdown.categories.byComplexity.simple} issues`);
        lines.push(`- **Moderate (Medium):** ${breakdown.categories.byComplexity.moderate} issues`);
        lines.push(`- **Complex (High/Critical):** ${breakdown.categories.byComplexity.complex} issues`);
        lines.push('');

        return lines.join('\n');
    }

    static generateNumericalSummary(breakdown: ComprehensiveBreakdown): Record<string, any> {
        return {
            components: {
                total: breakdown.summary.totalComponents,
                affected: breakdown.summary.affectedComponents,
                breakdown: breakdown.categories.byComponent
            },
            methods: {
                total: breakdown.summary.totalMethods,
                affected: breakdown.summary.affectedMethods,
                breakdown: breakdown.categories.byMethod
            },
            interfaces: {
                total: breakdown.summary.totalInterfaces,
                affected: breakdown.summary.affectedInterfaces,
                breakdown: breakdown.categories.byInterface
            },
            fileTypes: breakdown.categories.byFileType,
            complexity: breakdown.categories.byComplexity,
            riskAssessment: this.calculateRiskScore(breakdown)
        };
    }

    private static calculateRiskScore(breakdown: ComprehensiveBreakdown): number {
        const criticalWeight = 10;
        const highWeight = 5;
        const mediumWeight = 2;
        const lowWeight = 1;

        let totalScore = 0;
        
        breakdown.components.forEach(component => {
            totalScore += component.critical * criticalWeight;
            totalScore += component.high * highWeight;
            totalScore += component.medium * mediumWeight;
            totalScore += component.low * lowWeight;
        });

        // Normalize score (0-100)
        const maxPossibleScore = breakdown.components.length * 100; // Arbitrary max
        return Math.min(100, Math.round((totalScore / maxPossibleScore) * 100));
    }
}