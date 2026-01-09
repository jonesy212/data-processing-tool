// src/app/error-analyzer/ProgressTracker.ts
import type { FixPlan } from '@/core/error-analyzer/ErrorFixManager';
import type { TransitionEvaluationContext } from '@/core/error-analyzer/TransitionEvaluationContext';
import type { WorkflowProgressMetrics } from '@/core/error-analyzer/WorkflowProgressMetrics';
import type { WorkflowTransition } from '@/core/models/phases/WorkflowTransition';
import { ProgressPhase } from '@/core/models/tracker/ProgressBar';
import type { Progress } from '@/core/models/tracker/ProgressBar';
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




// Then update checkProgressConditions to use the correct method:
    function checkProgressConditions(
        transition: WorkflowTransition, 
        context: TransitionEvaluationContext
        ): { allowed: boolean; reason: string; blockTransition: boolean } {
        const tracker = context.progressContext?.tracker;
        if (!tracker) {
            return { allowed: true, reason: '', blockTransition: false };
        }
        
        // Use the method that accepts the full context
        const progress = tracker.getCurrentProgress(context); // ✅ Pass the full context, not just the ID
        
        const requiredProgress = transition.progressTracking?.requiredProgress || 0;
        
        if (progress.percentage < requiredProgress) {
            return {
            allowed: false,
            reason: `Requires ${requiredProgress}% completion (currently ${progress.percentage}%)`,
            blockTransition: true
            };
        }
        
        // Check other progress conditions
        const conditions = transition.progressTracking?.conditions || [];
        for (const condition of conditions) {
            if (!condition.check(progress, context)) {
            return {
                allowed: false,
                reason: condition.message || 'Progress condition not met',
                blockTransition: condition.blockTransition || false
            };
            }
        }
        
        return { allowed: true, reason: '', blockTransition: false };
    }

export class ProgressTracker {
    private historyFile: string;
    private metricsFile: string;
    private workflowMetricsFile: string; // NEW: Add workflow metrics file path
    private history: FixHistoryEntry[] = [];
    private metrics: ProgressMetrics[] = [];
    private workflowMetrics: WorkflowProgressMetrics[] = []; // NEW: Add workflow metrics storage
    private currentProgress: Progress | null = null;

    constructor(trackingDir: string = './error-tracking') {
        if (!fs.existsSync(trackingDir)) {
            fs.mkdirSync(trackingDir, { recursive: true });
        }

        this.historyFile = path.join(trackingDir, 'fix-history.json');
        this.metricsFile = path.join(trackingDir, 'progress-metrics.json');
        this.workflowMetricsFile = path.join(trackingDir, 'workflow-metrics.json'); // NEW

        this.loadHistory();
        this.loadMetrics();
        this.loadWorkflowMetrics(); // NEW
        this.initializeProgress();
    }

    // NEW: Method to load workflow metrics
    private loadWorkflowMetrics(): void {
        try {
            if (fs.existsSync(this.workflowMetricsFile)) {
                const data = fs.readFileSync(this.workflowMetricsFile, 'utf8');
                this.workflowMetrics = JSON.parse(data);
            }
        } catch (error) {
            console.warn('Could not load workflow metrics:', error);
            this.workflowMetrics = [];
        }
    }

    // NEW: Method to save workflow metrics
    private saveWorkflowMetrics(): void {
        try {
            fs.writeFileSync(
                this.workflowMetricsFile, 
                JSON.stringify(this.workflowMetrics, null, 2)
            );
        } catch (error) {
            console.warn('Could not save workflow metrics:', error);
        }
    }

    // Enhanced method to track workflow transitions - updated
    trackWorkflowTransition(
        transition: WorkflowTransition,
        context: TransitionEvaluationContext,
        success: boolean,
        timeTaken: number,
        metrics?: {
            conditionEvaluationTime: number;
            validationTime: number;
            actionExecutionTime: number;
            errors?: FixPlan[];
        }
    ): void {
        const timestamp = new Date().toISOString();
        
        // Calculate errors based on input or context
        const errorCount = metrics?.errors?.length || 
                          (context.data.validationResults?.errors?.length || 0);
        
        // Create workflow metrics
        const workflowMetric: WorkflowProgressMetrics = {
            timestamp,
            workflowId: context.workflowInstance.id,
            transitionId: transition.id,
            stepFrom: transition.fromStepId,
            stepTo: transition.toStepId,
            userId: context.user.id,
            totalErrors: errorCount,
            fixedErrors: success ? 1 : 0, // Simplified - adjust as needed
            remainingErrors: Math.max(0, errorCount - (success ? 1 : 0)),
            fixRate: this.calculateWorkflowFixRate(),
            confidenceTrend: 'stable', // You might want to calculate this
            topFiles: this.extractTopFilesFromErrors(metrics?.errors || []),
            byFixType: this.calculateFixTypeDistribution(metrics?.errors || []),
            byPriority: this.calculatePriorityDistribution(metrics?.errors || []),
            performance: metrics ? {
                conditionEvaluationTime: metrics.conditionEvaluationTime,
                validationTime: metrics.validationTime,
                actionExecutionTime: metrics.actionExecutionTime,
                totalTransitionTime: timeTaken
            } : undefined
        };

        // Add to workflow metrics
        this.workflowMetrics.push(workflowMetric);
        this.saveWorkflowMetrics();
        
        // Update UI metrics if tracking is enabled
        if (transition.progressTracking?.trackUIMetrics) {
            this.updateUIMetrics(transition, context, success, timeTaken);
        }

        // Log to history
        if (transition.progressTracking?.enabled) {
            const historyEntry: FixHistoryEntry = {
                timestamp,
                fixId: `workflow-${transition.id}-${Date.now()}`,
                file: `workflow:${context.workflowInstance.id}`,
                line: 0,
                errorCode: 'WORKFLOW_TRANSITION',
                fixType: transition.name,
                confidence: this.calculateTransitionConfidence(transition, context),
                success,
                timeTaken,
                notes: `Workflow transition from ${transition.fromStepId} to ${transition.toStepId}`
            };
            
            this.history.push(historyEntry);
            this.saveHistory();
        }

        // Update progress metrics
        this.updateMetricsAfterTransition(workflowMetric);
    }

    // NEW: Helper to extract top files from errors
    private extractTopFilesFromErrors(errors: FixPlan[]): Array<{ file: string; errorCount: number }> {
        const fileCounts = new Map<string, number>();
        
        for (const error of errors) {
            const file = error.error.resource;
            fileCounts.set(file, (fileCounts.get(file) || 0) + 1);
        }
        
        return Array.from(fileCounts.entries())
            .map(([file, errorCount]) => ({ file, errorCount }))
            .sort((a, b) => b.errorCount - a.errorCount)
            .slice(0, 10);
    }

    // NEW: Helper to calculate fix type distribution
    private calculateFixTypeDistribution(errors: FixPlan[]): Record<string, number> {
        const distribution: Record<string, number> = {};
        
        for (const error of errors) {
            distribution[error.fixType] = (distribution[error.fixType] || 0) + 1;
        }
        
        return distribution;
    }

    // NEW: Helper to calculate priority distribution
    private calculatePriorityDistribution(errors: FixPlan[]): Record<string, number> {
        const distribution: Record<string, number> = {};
        
        for (const error of errors) {
            distribution[error.priority] = (distribution[error.priority] || 0) + 1;
        }
        
        return distribution;
    }

    // Get workflow-specific metrics - already exists, keep as is
    getWorkflowMetrics(workflowId: string, days: number = 7): WorkflowProgressMetrics[] {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        return this.workflowMetrics.filter(metric =>
            metric.workflowId === workflowId && 
            new Date(metric.timestamp) >= cutoff
        );
    }

    // NEW: Get all workflow IDs in the system
    getAllWorkflowIds(): string[] {
        return Array.from(
            new Set(this.workflowMetrics.map(metric => metric.workflowId))
        );
    }

    // NEW: Get transitions for a specific workflow
    getWorkflowTransitions(workflowId: string): string[] {
        const transitions = this.workflowMetrics
            .filter(metric => metric.workflowId === workflowId)
            .map(metric => metric.transitionId)
            .filter((id): id is string => id !== undefined);
        
        return Array.from(new Set(transitions));
    }

    // NEW: Get workflow statistics
    getWorkflowStatistics(workflowId: string): {
        totalTransitions: number;
        successfulTransitions: number;
        successRate: number;
        averageTime: number;
        mostUsedTransition: string;
    } {
        const workflowData = this.workflowMetrics.filter(m => m.workflowId === workflowId);
        
        if (workflowData.length === 0) {
            return {
                totalTransitions: 0,
                successfulTransitions: 0,
                successRate: 0,
                averageTime: 0,
                mostUsedTransition: 'none'
            };
        }

        const successfulTransitions = workflowData.filter(m => m.fixedErrors > 0);
        const successRate = (successfulTransitions.length / workflowData.length) * 100;
        
        const avgTime = workflowData.reduce((sum, m) => {
            const time = m.performance?.totalTransitionTime || 0;
            return sum + time;
        }, 0) / workflowData.length;

        // Find most used transition
        const transitionCounts = new Map<string, number>();
        workflowData.forEach(m => {
            if (m.transitionId) {
                transitionCounts.set(m.transitionId, (transitionCounts.get(m.transitionId) || 0) + 1);
            }
        });

        const mostUsedTransition = Array.from(transitionCounts.entries())
            .sort((a, b) => b[1] - a[1])[0]?.[0] || 'none';

        return {
            totalTransitions: workflowData.length,
            successfulTransitions: successfulTransitions.length,
            successRate,
            averageTime: avgTime,
            mostUsedTransition
        };
    }

    // Reset method - update to include workflow metrics
    reset(): void {
        this.history = [];
        this.metrics = [];
        this.workflowMetrics = []; // NEW: Clear workflow metrics

        this.saveHistory();
        this.saveMetrics();
        this.saveWorkflowMetrics(); // NEW: Save cleared metrics

        console.log('Progress tracking reset');
    }

    // Original analysis tracking method
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


    // Enhanced fix tracking with workflow context
    trackFixApplied(
        fixId: string,
        plan: FixPlan,
        success: boolean,
        timeTaken: number,
        workflowContext?: {
            transitionId?: string;
            workflowId?: string;
            stepFrom?: string;
            stepTo?: string;
        },
        notes?: string
    ): void {
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
            notes: workflowContext 
                ? `${notes || ''} [Workflow: ${workflowContext.workflowId}, Transition: ${workflowContext.transitionId}]`
                : notes
        };

        this.history.push(entry);
        this.saveHistory();

        this.updateMetricsAfterFix(entry);
        this.updateProgressFromCurrentState();
    }

    // Get Progress object for UI with workflow context
    getProgressForUI(workflowContext?: {
        workflowId?: string;
        transitionId?: string;
    }): Progress {
        if (!this.currentProgress) {
            return this.createDefaultProgress(workflowContext);
        }

        const currentMetrics = this.getCurrentProgressMetrics();
        const percentage = currentMetrics.totalErrors > 0
            ? (currentMetrics.fixedErrors / currentMetrics.totalErrors) * 100
            : 0;

        // Determine if we're in workflow context
        const isWorkflowContext = !!workflowContext?.workflowId;
        
        if (isWorkflowContext) {
            // For workflow context, we might want different progress calculation
            // For example, based on workflow metrics instead of error metrics
            const workflowId = workflowContext.workflowId!; 
            
            const workflowStats = this.getWorkflowStatistics(workflowId);
            
            const workflowPercentage = workflowStats.totalTransitions > 0
                ? (workflowStats.successfulTransitions / workflowStats.totalTransitions) * 100
                : 0;
            
            const workflowName = workflowContext.transitionId 
                ? `Workflow: ${workflowId} (${workflowContext.transitionId})`
                : `Workflow: ${workflowId}`;
            
            return {
                id: `workflow-progress-${workflowId}`,
                name: workflowName,
                color: this.getProgressColor(workflowPercentage),
                description: this.generateWorkflowProgressDescription(workflowId, workflowContext),
                value: workflowPercentage,
                label: `${Math.round(workflowPercentage)}%`,
                current: workflowStats.successfulTransitions,
                min: 0,
                max: workflowStats.totalTransitions,
                percentage: workflowPercentage,
                done: workflowPercentage >= 100
            };
        }

        // Default TypeScript error progress
        const progress: Progress = {
            id: 'typescript-error-fix-progress',
            name: 'TypeScript Error Resolution',
            color: this.getProgressColor(percentage),
            description: this.generateProgressDescription(currentMetrics, workflowContext),
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


    private generateWorkflowProgressDescription(
        workflowId: string, 
        context?: { workflowId?: string; transitionId?: string }
    ): string {
        const stats = this.getWorkflowStatistics(workflowId);
        const metrics = this.getWorkflowMetrics(workflowId, 1); // Last day
        
        if (metrics.length === 0) {
            return context?.transitionId 
                ? `Starting transition: ${context.transitionId}`
                : `Workflow ${workflowId} - No recent activity`;
        }
        
        const lastMetric = metrics[metrics.length - 1];
        const descriptions = [
            `Transitions: ${stats.successfulTransitions}/${stats.totalTransitions} successful`,
            context?.transitionId ? `Current: ${context.transitionId}` : '',
            `Success rate: ${stats.successRate.toFixed(1)}%`,
            lastMetric.performance ? `Avg time: ${lastMetric.performance.totalTransitionTime}ms` : '',
            `${stats.totalTransitions - stats.successfulTransitions} remaining`
        ].filter(Boolean);
        
        return descriptions.join(' • ');
    }

    // Get current phase with workflow context
    getCurrentPhase(workflowContext?: {
        transition?: WorkflowTransition;
    }): { type: ProgressPhase; duration: number; value: number } {
        const currentMetrics = this.getCurrentProgressMetrics();
        const percentage = currentMetrics.totalErrors > 0
            ? (currentMetrics.fixedErrors / currentMetrics.totalErrors) * 100
            : 0;

        let phaseType: ProgressPhase;

        // Use transition-specific phase mapping if available
        if (workflowContext?.transition?.progressTracking) {
            phaseType = this.mapProgressToTransitionPhase(percentage, workflowContext.transition);
        } else {
            // Default phase mapping
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
        }

        const duration = this.calculatePhaseDuration(phaseType);
        const value = this.getPhaseProgressValue(phaseType, percentage);

        return { type: phaseType, duration, value };
    }









    // Generate workflow progress report
    generateWorkflowProgressReport(workflowId: string): string {
        const workflowMetrics = this.getWorkflowMetrics(workflowId, 30);
        const transitions = workflowMetrics.reduce((acc, metric) => {
            if (metric.transitionId && !acc.includes(metric.transitionId)) {
                acc.push(metric.transitionId);
            }
            return acc;
        }, [] as string[]);

        const lines: string[] = [];

        lines.push('# Workflow Transition Progress Report');
        lines.push(`**Workflow:** ${workflowId}`);
        lines.push(`**Generated:** ${new Date().toISOString()}`);
        lines.push('');

        lines.push('## 📊 Overall Progress');
        lines.push('');
        const overallProgress = this.getProgressForUI({ workflowId });
        lines.push(`**Progress:** ${overallProgress.label}`);
        lines.push(`**Current Phase:** ${this.getCurrentPhase().type}`);
        lines.push('');

        lines.push('## 🔄 Transition Statistics');
        lines.push('');
        lines.push('| Transition | Success Rate | Avg Time | Total Uses |');
        lines.push('|------------|--------------|----------|------------|');

        for (const transitionId of transitions) {
            const transitionMetrics = workflowMetrics.filter(m => m.transitionId === transitionId);
            const successCount = transitionMetrics.filter(m => m.fixedErrors > 0).length;
            const successRate = transitionMetrics.length > 0 
                ? (successCount / transitionMetrics.length) * 100 
                : 0;
            const avgTime = transitionMetrics.length > 0
                ? transitionMetrics.reduce((sum, m) => sum + (m.performance?.totalTransitionTime || 0), 0) / transitionMetrics.length
                : 0;
            
            lines.push(`| ${transitionId} | ${successRate.toFixed(1)}% | ${avgTime.toFixed(0)}ms | ${transitionMetrics.length} |`);
        }
        lines.push('');

        lines.push('## 📈 Performance Metrics');
        lines.push('');
        if (workflowMetrics.length > 0) {
            const lastMetric = workflowMetrics[workflowMetrics.length - 1];
            if (lastMetric.performance) {
                lines.push(`**Condition Evaluation:** ${lastMetric.performance.conditionEvaluationTime}ms`);
                lines.push(`**Validation:** ${lastMetric.performance.validationTime}ms`);
                lines.push(`**Action Execution:** ${lastMetric.performance.actionExecutionTime}ms`);
                lines.push(`**Total Transition Time:** ${lastMetric.performance.totalTransitionTime}ms`);
                lines.push('');
            }
        }

        lines.push('## 💡 Workflow Recommendations');
        lines.push('');
        
        const transitionSuccessRates = transitions.map(transitionId => {
            const metrics = workflowMetrics.filter(m => m.transitionId === transitionId);
            const successRate = metrics.length > 0 
                ? (metrics.filter(m => m.fixedErrors > 0).length / metrics.length) * 100 
                : 100;
            return { transitionId, successRate };
        });

        const problematicTransitions = transitionSuccessRates.filter(t => t.successRate < 80);
        if (problematicTransitions.length > 0) {
            lines.push('⚠️ **Problematic Transitions:**');
            for (const transition of problematicTransitions) {
                lines.push(`- **${transition.transitionId}**: ${transition.successRate.toFixed(1)}% success rate`);
            }
            lines.push('');
        }

        const slowTransitions = workflowMetrics
            .filter(m => m.performance && m.performance.totalTransitionTime > 1000)
            .map(m => ({ transitionId: m.transitionId, time: m.performance!.totalTransitionTime }))
            .reduce((acc, curr) => {
                if (!acc.some(item => item.transitionId === curr.transitionId)) {
                    acc.push(curr);
                }
                return acc;
            }, [] as Array<{ transitionId?: string, time: number }>);

        if (slowTransitions.length > 0) {
            lines.push('⚠️ **Slow Transitions:**');
            for (const transition of slowTransitions) {
                lines.push(`- **${transition.transitionId}**: ${transition.time}ms`);
            }
            lines.push('');
        }

        lines.push('**Optimization Suggestions:**');
        lines.push('1. Review conditions and validations for slow transitions');
        lines.push('2. Consider caching for frequently evaluated conditions');
        lines.push('3. Implement progress-aware scheduling for complex workflows');
        lines.push('4. Add retry logic for unreliable external dependencies');

        return lines.join('\n');
    }

    private mapProgressToTransitionPhase(percentage: number, transition: WorkflowTransition): ProgressPhase {
        // Custom phase mapping based on transition configuration
        if (transition.progressTracking?.enabled) {
            // Use transition-specific phase mapping
            if (percentage < 33) return ProgressPhase.Ideation;
            if (percentage < 66) return ProgressPhase.ProductDevelopment;
            return ProgressPhase.LaunchPreparation;
        }
        
        // Default mapping
        return this.getCurrentPhase().type;
    }

    private updateUIMetrics(
        transition: WorkflowTransition,
        context: TransitionEvaluationContext,
        success: boolean,
        timeTaken: number
    ): void {
        // Track UI interactions for this transition
        // This could be extended to track button clicks, hover times, etc.
        const uiMetrics = {
            buttonClicks: 1,
            successRate: success ? 100 : 0,
            averageResponseTime: timeTaken,
            themeChanges: context.uiContext?.currentTheme.colors?.primary !== 
                         transition.uiConfig?.colors?.button ? 1 : 0,
            animationUsage: transition.uiConfig?.animations ? {
                [transition.uiConfig.animations.transitionType || 'none']: 1
            } : {}
        };

        // Store UI metrics (implementation depends on your storage solution)
        console.log('UI Metrics recorded:', uiMetrics);
    }

    private calculateWorkflowFixRate(): number {
        const recentWorkflowMetrics = this.workflowMetrics.filter(m => {
            const metricTime = new Date(m.timestamp);
            const hoursAgo = (Date.now() - metricTime.getTime()) / (1000 * 60 * 60);
            return hoursAgo <= 24;
        });

        return recentWorkflowMetrics.length / 24;
    }

    private calculateTransitionConfidence(
        transition: WorkflowTransition,
        context: TransitionEvaluationContext
    ): number {
        // Calculate confidence based on transition history, conditions, and context
        let confidence = 100;

        // Reduce confidence based on complexity
        if (transition.conditions.length > 5) confidence *= 0.9;
        if (transition.validations && transition.validations.length > 3) confidence *= 0.9;
        if (transition.preTransitionActions && transition.preTransitionActions.length > 2) confidence *= 0.95;
        
        // Increase confidence based on user permissions
        const hasAllPermissions = transition.allowedRoles.every(role => 
            context.user.roles.includes(role)
        );
        if (hasAllPermissions) confidence *= 1.1;
        
        // Cap at 100
        return Math.min(confidence, 100);
    }

    private updateMetricsAfterTransition(metrics: WorkflowProgressMetrics): void {
        // Update the last metric or add new one
        if (this.metrics.length > 0) {
            const lastMetric = this.metrics[this.metrics.length - 1];
            lastMetric.totalErrors += metrics.totalErrors;
            lastMetric.fixedErrors += metrics.fixedErrors;
            lastMetric.remainingErrors = Math.max(0, lastMetric.remainingErrors - metrics.fixedErrors);
        } else {
            this.metrics.push({
                timestamp: metrics.timestamp,
                totalErrors: metrics.totalErrors,
                fixedErrors: metrics.fixedErrors,
                remainingErrors: Math.max(0, metrics.totalErrors - metrics.fixedErrors),
                fixRate: metrics.fixRate,
                confidenceTrend: 'stable',
                topFiles: [],
                byFixType: {},
                byPriority: {}
            });
        }
        
        this.saveMetrics();
        this.updateProgressFromCurrentState();
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

    private generateProgressDescription(metrics: ProgressMetrics, context?: any): string {
        const percentage = metrics.totalErrors > 0
            ? (metrics.fixedErrors / metrics.totalErrors) * 100
            : 0;

        if (percentage >= 100) {
            return context?.workflowId 
                ? `Workflow ${context.workflowId} completed!`
                : 'All TypeScript errors have been fixed!';
        }

        const descriptions = [
            `Fixed ${metrics.fixedErrors} of ${metrics.totalErrors} errors`,
            context?.transitionId ? `Transition: ${context.transitionId}` : '',
            `Fix rate: ${metrics.fixRate.toFixed(2)} errors/hour`,
            `Confidence trend: ${metrics.confidenceTrend}`,
            `${metrics.remainingErrors} errors remaining`
        ].filter(Boolean);

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

    private createDefaultProgress(workflowContext?: {
        workflowId?: string;
        transitionId?: string;
    }): Progress {
        if (workflowContext?.workflowId) {
            // Create workflow-specific progress
            const workflowName = workflowContext.transitionId 
                ? `Workflow: ${workflowContext.workflowId} (${workflowContext.transitionId})`
                : `Workflow: ${workflowContext.workflowId}`;
            
            return {
                id: `workflow-progress-${workflowContext.workflowId}`,
                name: workflowName,
                color: '#3B82F6', // Blue for workflows
                description: workflowContext.transitionId 
                    ? `Processing workflow transition: ${workflowContext.transitionId}`
                    : `Executing workflow: ${workflowContext.workflowId}`,
                value: 0,
                label: '0%',
                current: 0,
                min: 0,
                max: 100, // Default to 100 for workflow steps
                percentage: 0,
                done: false
            };
        }
        
        // Default TypeScript error fix progress
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

    // Option 1: Update getCurrentProgress to accept either a string or context
    getCurrentProgress(contextOrWorkflowId: string | TransitionEvaluationContext): Progress {
        // Extract workflow ID from either format
        let workflowId: string;
        
        if (typeof contextOrWorkflowId === 'string') {
            // If it's already a string (workflowId)
            workflowId = contextOrWorkflowId;
        } else {
            // If it's a TransitionEvaluationContext
            workflowId = contextOrWorkflowId.workflowInstance.id;
        }
        
        return this.getProgressForUI({
            workflowId: workflowId,
            transitionId: typeof contextOrWorkflowId === 'object' 
                ? (contextOrWorkflowId as TransitionEvaluationContext).transition?.id 
                : undefined
        });
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

}