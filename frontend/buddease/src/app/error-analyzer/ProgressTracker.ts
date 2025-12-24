// src/app/error-analyzer/ProgressTracker.ts
import { FixPlan } from '@/app/error-analyzer/ErrorFixManager';
import { Progress, ProgressPhase } from '@/models/tracker/ProgressBar';
import fs from 'fs';
import path from 'path';


export interface ProgressMetrics {
    timestamp: string;
    totalErrors: number;
    fixedErrors: number;
    remainingErrors: number;
    fixRate: number;
    confidenceTrend: 'improving' | 'stable' | 'declining';
    topFiles: Array<{ file: string; errorCount: number }>;
    byFixType: Record<string, number>;
    byPriority: Record<string, number>;
}

export interface FixHistoryEntry {
    timestamp: string;
    fixId: string;
    file: string;
    line: number;
    errorCode: string;
    fixType: string;
    confidence: number;
    success: boolean;
    timeTaken: number;
    notes?: string;
}

export class ProgressTracker {
    private historyFile: string;
    private metricsFile: string;
    private history: FixHistoryEntry[] = [];
    private metrics: ProgressMetrics[] = [];
    private currentProgress: Progress | null = null;

    constructor(trackingDir: string = './error-tracking') {
        if (!fs.existsSync(trackingDir)) {
            fs.mkdirSync(trackingDir, { recursive: true });
        }

        this.historyFile = path.join(trackingDir, 'fix-history.json');
        this.metricsFile = path.join(trackingDir, 'progress-metrics.json');

        this.loadHistory();
        this.loadMetrics();
        this.initializeProgress();
    }

    trackAnalysis(fixPlans: FixPlan[], totalErrors?: number): void {
    const timestamp = new Date().toISOString();
    const metrics = this.calculateMetrics(fixPlans, timestamp);
    
    // If totalErrors is provided, use it instead of fixPlans.length
    if (totalErrors !== undefined) {
        metrics.totalErrors = totalErrors;
        metrics.remainingErrors = totalErrors - metrics.fixedErrors;
    }
    
    this.metrics.push(metrics);
    this.saveMetrics();
    this.updateProgressFromMetrics(metrics);
    
    console.log(this.generateProgressSummary(metrics));
    }

    trackFixApplied(fixId: string, plan: FixPlan, success: boolean, timeTaken: number, notes?: string): void {
        const entry: FixHistoryEntry = {
            timestamp: new Date().toISOString(),
            fixId,
            file: plan.error.resource,
            line: plan.error.startLineNumber,
            errorCode: plan.error.code,
            fixType: plan.fixType,
            confidence: plan.confidence,
            success,
            timeTaken,
            notes
        };

        this.history.push(entry);
        this.saveHistory();

        this.updateMetricsAfterFix(entry);
        this.updateProgressFromCurrentState();
    }

    // New method to get Progress object for ProgressBar component
    getProgressForUI(): Progress {
        if (!this.currentProgress) {
            return this.createDefaultProgress();
        }

        // Update the current progress with latest metrics
        const currentMetrics = this.getCurrentProgressMetrics();
        const percentage = currentMetrics.totalErrors > 0
            ? (currentMetrics.fixedErrors / currentMetrics.totalErrors) * 100
            : 0;

        const progress: Progress = {
            id: this.currentProgress.id,
            name: this.currentProgress.name,
            color: this.getProgressColor(percentage),
            description: this.generateProgressDescription(currentMetrics),
            value: percentage,
            label: `${Math.round(percentage)}%`,
            current: currentMetrics.fixedErrors,
            min: 0,
            max: currentMetrics.totalErrors,
            percentage,
            done: percentage >= 100
        };

        return progress;
    }

    // New method to get current phase
    getCurrentPhase(): { type: ProgressPhase; duration: number; value: number } {
        const currentMetrics = this.getCurrentProgressMetrics();
        const percentage = currentMetrics.totalErrors > 0
            ? (currentMetrics.fixedErrors / currentMetrics.totalErrors) * 100
            : 0;

        let phaseType: ProgressPhase;

        if (percentage < 20) {
            phaseType = ProgressPhase.Ideation;
        } else if (percentage < 40) {
            phaseType = ProgressPhase.TeamFormation;
        } else if (percentage < 60) {
            phaseType = ProgressPhase.ProductDevelopment;
        } else if (percentage < 80) {
            phaseType = ProgressPhase.LaunchPreparation;
        } else if (percentage < 100) {
            phaseType = ProgressPhase.DataAnalysis;
        } else {
            phaseType = ProgressPhase.Draft;
        }

        // Calculate phase duration based on historical data
        const duration = this.calculatePhaseDuration(phaseType);

        return {
            type: phaseType,
            duration,
            value: this.getPhaseProgressValue(phaseType, percentage)
        };
    }

    getCurrentProgressMetrics(): ProgressMetrics {
        if (this.metrics.length === 0) {
            return this.createEmptyMetrics();
        }

        return this.metrics[this.metrics.length - 1];
    }

    getProgressTrend(days: number = 7): ProgressMetrics[] {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        return this.metrics.filter(metric =>
            new Date(metric.timestamp) >= cutoff
        );
    }

    generateProgressReport(): string {
        const current = this.getCurrentProgressMetrics();
        const trend = this.getProgressTrend();
        const stats = this.getFixStatistics();

        const lines: string[] = [];

        lines.push('# TypeScript Error Fix Progress Report');
        lines.push(`**Generated:** ${new Date().toISOString()}`);
        lines.push('');

        // Current status with ProgressBar-compatible data
        lines.push('## 📊 Current Status');
        lines.push('');
        const progress = this.getProgressForUI();
        lines.push(`**Progress:** ${progress.label}`);
        lines.push(`**Phase:** ${this.getCurrentPhase().type}`);
        lines.push(`**Status:** ${progress.done ? '✅ Complete' : '🔄 In Progress'}`);
        lines.push('');
        lines.push(`**Total Errors:** ${progress.max}`);
        lines.push(`**Fixed Errors:** ${progress.current}`);
        lines.push(`**Remaining Errors:** ${progress.max - progress.current}`);
        lines.push(`**Fix Rate:** ${current.fixRate.toFixed(2)} errors/hour`);
        lines.push(`**Confidence Trend:** ${current.confidenceTrend}`);
        lines.push('');

        // Fix statistics
        lines.push('## 📈 Fix Statistics');
        lines.push('');
        lines.push(`**Total Fixes Applied:** ${stats.totalFixes}`);
        lines.push(`**Success Rate:** ${stats.successRate.toFixed(1)}%`);
        lines.push(`**Average Confidence:** ${stats.averageConfidence.toFixed(1)}%`);
        lines.push(`**Average Time Per Fix:** ${stats.averageTimePerFix.toFixed(1)}ms`);
        lines.push(`**Most Common Fix Type:** ${stats.mostCommonFixType}`);
        lines.push(`**Most Common Error Code:** ${stats.mostCommonErrorCode}`);
        lines.push('');

        // Progress over time
        if (trend.length > 1) {
            lines.push('## ⏳ Progress Over Time');
            lines.push('');
            lines.push('| Date | Total | Fixed | % Complete | Fix Rate |');
            lines.push('|------|-------|-------|------------|----------|');

            for (const metric of trend.slice(-5)) {
                const date = new Date(metric.timestamp).toLocaleDateString();
                const percentage = metric.totalErrors > 0
                    ? (metric.fixedErrors / metric.totalErrors) * 100
                    : 0;
                lines.push(`| ${date} | ${metric.totalErrors} | ${metric.fixedErrors} | ${percentage.toFixed(1)}% | ${metric.fixRate.toFixed(2)} |`);
            }
            lines.push('');
        }

        // Top files with errors
        if (current.topFiles.length > 0) {
            lines.push('## 📄 Top Files with Errors');
            lines.push('');
            for (const file of current.topFiles.slice(0, 5)) {
                lines.push(`- **${path.basename(file.file)}**: ${file.errorCount} errors`);
            }
            lines.push('');
        }

        // Fix type distribution
        lines.push('## 🔧 Fix Type Distribution');
        lines.push('');
        for (const [type, count] of Object.entries(current.byFixType)) {
            lines.push(`- **${type}**: ${count} fixes`);
        }
        lines.push('');

        // Priority distribution
        lines.push('## 🎯 Priority Distribution');
        lines.push('');
        for (const [priority, count] of Object.entries(current.byPriority)) {
            lines.push(`- **${priority}**: ${count} fixes`);
        }
        lines.push('');

        // Recent fixes
        const recentFixes = this.history.slice(-10).reverse();
        if (recentFixes.length > 0) {
            lines.push('## ✅ Recent Fixes Applied');
            lines.push('');
            for (const fix of recentFixes) {
                const successIcon = fix.success ? '✅' : '❌';
                const time = new Date(fix.timestamp).toLocaleTimeString();
                lines.push(`${successIcon} **${time}** - ${path.basename(fix.file)}:${fix.line} - ${fix.errorCode} (${fix.confidence}% confidence)`);
            }
            lines.push('');
        }

        // Recommendations
        lines.push('## 💡 Recommendations');
        lines.push('');

        if (progress.max - progress.current > 0) {
            const completionEstimate = this.calculateCompletionEstimate(current);
            lines.push(`**Estimated time to completion:** ${completionEstimate}`);
            lines.push('');
        }

        if (current.fixRate < 5) {
            lines.push('⚠️ **Low fix rate detected** - Consider focusing on simpler fixes first');
        }

        if (current.confidenceTrend === 'declining') {
            lines.push('⚠️ **Confidence declining** - Recent fixes may be more complex');
        }

        if (stats.successRate < 80) {
            lines.push('⚠️ **Low success rate** - Review failed fixes and adjust approach');
        }

        lines.push('');
        lines.push('**Next Steps:**');
        lines.push('1. Focus on high-priority, high-confidence fixes');
        lines.push('2. Work file by file for efficiency');
        lines.push('3. Test after each group of related fixes');
        lines.push('4. Update progress after each fix session');

        return lines.join('\n');
    }

    private initializeProgress(): void {
        this.currentProgress = {
            id: 'typescript-error-fix-progress',
            name: 'TypeScript Error Resolution',
            color: '#3B82F6', // Blue
            description: 'Fixing TypeScript compiler errors in the codebase',
            value: 0,
            label: '0%',
            current: 0,
            min: 0,
            max: 0,
            percentage: 0,
            done: false
        };
    }

    private updateProgressFromMetrics(metrics: ProgressMetrics): void {
        if (!this.currentProgress) return;

        const percentage = metrics.totalErrors > 0
            ? (metrics.fixedErrors / metrics.totalErrors) * 100
            : 0;

        this.currentProgress = {
            ...this.currentProgress,
            color: this.getProgressColor(percentage),
            description: this.generateProgressDescription(metrics),
            value: percentage,
            label: `${Math.round(percentage)}%`,
            current: metrics.fixedErrors,
            max: metrics.totalErrors,
            percentage,
            done: percentage >= 100
        };
    }

    private updateProgressFromCurrentState(): void {
        const metrics = this.getCurrentProgressMetrics();
        this.updateProgressFromMetrics(metrics);
    }

    private getProgressColor(percentage: number): string {
        if (percentage < 30) return '#EF4444'; // Red
        if (percentage < 60) return '#F59E0B'; // Amber
        if (percentage < 90) return '#3B82F6'; // Blue
        return '#10B981'; // Green
    }

    private generateProgressDescription(metrics: ProgressMetrics): string {
        const percentage = metrics.totalErrors > 0
            ? (metrics.fixedErrors / metrics.totalErrors) * 100
            : 0;

        if (percentage >= 100) {
            return 'All TypeScript errors have been fixed!';
        }

        const descriptions = [
            `Fixed ${metrics.fixedErrors} of ${metrics.totalErrors} errors`,
            `Fix rate: ${metrics.fixRate.toFixed(2)} errors/hour`,
            `Confidence trend: ${metrics.confidenceTrend}`,
            `${metrics.remainingErrors} errors remaining`
        ];

        return descriptions.join(' • ');
    }

    private calculatePhaseDuration(phase: ProgressPhase): number {
        // Calculate duration based on historical data
        // This is a simplified version - you might want to track phase changes over time
        const phaseHistory = this.history.filter(fix => {
            const fixTime = new Date(fix.timestamp);
            const hoursAgo = (Date.now() - fixTime.getTime()) / (1000 * 60 * 60);
            return hoursAgo <= 24;
        });

        // Return duration in milliseconds
        return phaseHistory.length > 0
            ? (phaseHistory.reduce((sum, fix) => sum + fix.timeTaken, 0) / phaseHistory.length) * 10
            : 1000; // Default 1 second
    }

    private getPhaseProgressValue(phase: ProgressPhase, percentage: number): number {
        // Map overall percentage to phase-specific value (0-100)
        const phaseRanges = {
            [ProgressPhase.Ideation]: [0, 20],
            [ProgressPhase.TeamFormation]: [20, 40],
            [ProgressPhase.ProductDevelopment]: [40, 60],
            [ProgressPhase.LaunchPreparation]: [60, 80],
            [ProgressPhase.DataAnalysis]: [80, 100],
            [ProgressPhase.Draft]: [100, 100]
        };

        const [phaseMin, phaseMax] = phaseRanges[phase];
        const phaseWidth = phaseMax - phaseMin;

        if (phaseWidth === 0) return 100;

        return ((percentage - phaseMin) / phaseWidth) * 100;
    }

    private createDefaultProgress(): Progress {
        return {
            id: 'typescript-error-fix-progress',
            name: 'TypeScript Error Resolution',
            color: '#3B82F6',
            description: 'Fixing TypeScript compiler errors in the codebase',
            value: 0,
            label: '0%',
            current: 0,
            min: 0,
            max: 0,
            percentage: 0,
            done: false
        };
    }

    private calculateMetrics(fixPlans: FixPlan[], timestamp: string): ProgressMetrics {
        const totalErrors = fixPlans.length;
        const fixedErrors = this.history.filter(h => h.success).length;
        const remainingErrors = totalErrors - fixedErrors;

        // Calculate fix rate (errors fixed per hour)
        const recentFixes = this.history.filter(h => {
            const fixTime = new Date(h.timestamp);
            const hoursAgo = (Date.now() - fixTime.getTime()) / (1000 * 60 * 60);
            return hoursAgo <= 24; // Last 24 hours
        });

        const fixRate = recentFixes.length / 24; // Per hour

        // Determine confidence trend
        const confidenceTrend = this.determineConfidenceTrend(fixPlans);

        // Group by file
        const files = new Map<string, number>();
        for (const plan of fixPlans) {
            const file = plan.error.resource;
            files.set(file, (files.get(file) || 0) + 1);
        }

        const topFiles = Array.from(files.entries())
            .map(([file, count]) => ({ file, errorCount: count }))
            .sort((a, b) => b.errorCount - a.errorCount)
            .slice(0, 10);

        // Group by fix type
        const byFixType: Record<string, number> = {};
        for (const plan of fixPlans) {
            byFixType[plan.fixType] = (byFixType[plan.fixType] || 0) + 1;
        }

        // Group by priority
        const byPriority: Record<string, number> = {};
        for (const plan of fixPlans) {
            byPriority[plan.priority] = (byPriority[plan.priority] || 0) + 1;
        }

        return {
            timestamp,
            totalErrors,
            fixedErrors,
            remainingErrors,
            fixRate,
            confidenceTrend,
            topFiles,
            byFixType,
            byPriority
        };
    }

    private determineConfidenceTrend(fixPlans: FixPlan[]): ProgressMetrics['confidenceTrend'] {
        if (this.metrics.length < 2) {
            return 'stable';
        }

        const recentMetrics = this.metrics.slice(-3);
        const recentConfidence = recentMetrics.flatMap(m =>
            Object.entries(m.byFixType).map(([type, count]) => ({ type, count }))
        );

        // Simple trend detection - in production, use more sophisticated analysis
        const avgConfidence = fixPlans.reduce((sum, p) => sum + p.confidence, 0) / fixPlans.length;
        const previousAvg = this.metrics[this.metrics.length - 2].byFixType
            ? Object.values(this.metrics[this.metrics.length - 2].byFixType).reduce((a, b) => a + b, 0)
            : 0;

        if (avgConfidence > previousAvg * 1.1) {
            return 'improving';
        } else if (avgConfidence < previousAvg * 0.9) {
            return 'declining';
        } else {
            return 'stable';
        }
    }

    getCurrentProgress(): Progress {
        return this.getProgressForUI();
    }

    private updateMetricsAfterFix(entry: FixHistoryEntry): void {
    // FIX: Use getCurrentProgressMetrics() instead of getCurrentProgress()
    const currentMetrics = this.getCurrentProgressMetrics();

    if (entry.success) {
        currentMetrics.fixedErrors++;
        currentMetrics.remainingErrors = Math.max(0, currentMetrics.remainingErrors - 1);
    }

    // Recalculate fix rate
    const recentFixes = this.history.filter(h => {
        const fixTime = new Date(h.timestamp);
        const hoursAgo = (Date.now() - fixTime.getTime()) / (1000 * 60 * 60);
        return hoursAgo <= 24;
    });

    currentMetrics.fixRate = recentFixes.length / 24;

    // Update metrics
    this.metrics[this.metrics.length - 1] = currentMetrics;
    this.saveMetrics();
    
    // Also update the Progress object
    this.updateProgressFromCurrentState();
    }

    private calculateCompletionEstimate(metrics: ProgressMetrics): string {
        if (metrics.fixRate <= 0) {
            return 'Unknown (no recent fixes)';
        }

        const hoursRemaining = metrics.remainingErrors / metrics.fixRate;

        if (hoursRemaining < 1) {
            return 'Less than 1 hour';
        } else if (hoursRemaining < 24) {
            return `${Math.ceil(hoursRemaining)} hours`;
        } else if (hoursRemaining < 168) { // 7 days
            return `${Math.ceil(hoursRemaining / 24)} days`;
        } else {
            return `${Math.ceil(hoursRemaining / 168)} weeks`;
        }
    }

    private generateProgressSummary(metrics: ProgressMetrics): string {
        const lines: string[] = [];

        lines.push('📊 Progress Update:');
        lines.push(`  Total Errors: ${metrics.totalErrors}`);
        lines.push(`  Fixed: ${metrics.fixedErrors} (${((metrics.fixedErrors / metrics.totalErrors) * 100).toFixed(1)}%)`);
        lines.push(`  Remaining: ${metrics.remainingErrors}`);
        lines.push(`  Fix Rate: ${metrics.fixRate.toFixed(2)}/hour`);

        if (metrics.remainingErrors > 0) {
            const estimate = this.calculateCompletionEstimate(metrics);
            lines.push(`  Estimated Completion: ${estimate}`);
        }

        return lines.join('\n');
    }

    private createEmptyMetrics(): ProgressMetrics {
        return {
            timestamp: new Date().toISOString(),
            totalErrors: 0,
            fixedErrors: 0,
            remainingErrors: 0,
            fixRate: 0,
            confidenceTrend: 'stable',
            topFiles: [],
            byFixType: {},
            byPriority: {}
        };
    }

    private loadHistory(): void {
        try {
            if (fs.existsSync(this.historyFile)) {
                const data = fs.readFileSync(this.historyFile, 'utf8');
                this.history = JSON.parse(data);
            }
        } catch (error) {
            console.warn('Could not load fix history:', error);
            this.history = [];
        }
    }

    private saveHistory(): void {
        try {
            fs.writeFileSync(this.historyFile, JSON.stringify(this.history, null, 2));
        } catch (error) {
            console.warn('Could not save fix history:', error);
        }
    }

    private loadMetrics(): void {
        try {
            if (fs.existsSync(this.metricsFile)) {
                const data = fs.readFileSync(this.metricsFile, 'utf8');
                this.metrics = JSON.parse(data);
            }
        } catch (error) {
            console.warn('Could not load progress metrics:', error);
            this.metrics = [];
        }
    }

    private saveMetrics(): void {
        try {
            fs.writeFileSync(this.metricsFile, JSON.stringify(this.metrics, null, 2));
        } catch (error) {
            console.warn('Could not save progress metrics:', error);
        }
    }

    getFixStatistics(): {
        totalFixes: number;
        successfulFixes: number;
        successRate: number;
        averageConfidence: number;
        averageTimePerFix: number;
        mostCommonFixType: string;
        mostCommonErrorCode: string;
    } {
        if (this.history.length === 0) {
            return {
                totalFixes: 0,
                successfulFixes: 0,
                successRate: 0,
                averageConfidence: 0,
                averageTimePerFix: 0,
                mostCommonFixType: 'none',
                mostCommonErrorCode: 'none'
            };
        }

        const successfulFixes = this.history.filter(h => h.success);
        const successRate = (successfulFixes.length / this.history.length) * 100;

        const averageConfidence = this.history.reduce((sum, h) => sum + h.confidence, 0) / this.history.length;
        const averageTimePerFix = this.history.reduce((sum, h) => sum + h.timeTaken, 0) / this.history.length;

        // Most common fix type
        const fixTypeCounts = new Map<string, number>();
        for (const fix of this.history) {
            fixTypeCounts.set(fix.fixType, (fixTypeCounts.get(fix.fixType) || 0) + 1);
        }
        const mostCommonFixType = Array.from(fixTypeCounts.entries())
            .sort((a, b) => b[1] - a[1])[0]?.[0] || 'none';

        // Most common error code
        const errorCodeCounts = new Map<string, number>();
        for (const fix of this.history) {
            errorCodeCounts.set(fix.errorCode, (errorCodeCounts.get(fix.errorCode) || 0) + 1);
        }
        const mostCommonErrorCode = Array.from(errorCodeCounts.entries())
            .sort((a, b) => b[1] - a[1])[0]?.[0] || 'none';

        return {
            totalFixes: this.history.length,
            successfulFixes: successfulFixes.length,
            successRate,
            averageConfidence,
            averageTimePerFix,
            mostCommonFixType,
            mostCommonErrorCode
        };
    }


    reset(): void {
        this.history = [];
        this.metrics = [];

        this.saveHistory();
        this.saveMetrics();

        console.log('Progress tracking reset');
    }
}