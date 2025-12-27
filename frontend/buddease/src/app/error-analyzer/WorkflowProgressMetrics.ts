// WorkflowTransition.ts
import { WorkflowStep } from '@/app/typings/entities/DocumentEntity';
import { ThemeSettings } from '@/app/branding/ThemeSettings';
import { DocumentAnimationOptions } from '@/app/documents/SharedDocumentProps';
import { ValidationResult } from '@/app/components/database/SchemaEvolutionManager';
import StorageService from '@/utils/storage/StoragService';
import { Progress, ProgressPhase } from '@/models/tracker/ProgressBar';
import { FixPlan } from '@/app/error-analyzer/types/ErrorAnalysisTypes';
import fs from 'fs';
import path from 'path';
import { ProgressMetrics, FixHistoryEntry } from '@/app/error-analyzer/ProgressTracker'
import { WorkflowTransition,
TransitionUIConfig,
TransitionAnimations,
TransitionCondition,
TransitionAction,
TransitionValidation,
TransitionSchedule,
RetryPolicy,
TransitionEvaluationContext,
TransitionUIState,
TransitionButtonProps
 } from '@/app/models/phases/WorkflowTransition'
// Create a storage service instance
export const storageService = new StorageService();

export interface WorkflowProgressMetrics extends ProgressMetrics {
    workflowId: string;
    transitionId?: string;
    stepFrom: string;
    stepTo: string;
    userId: string;
    performance?: {
        conditionEvaluationTime: number;
        validationTime: number;
        actionExecutionTime: number;
        totalTransitionTime: number;
    };
    uiMetrics?: {
        buttonClicks: number;
        successRate: number;
        averageResponseTime: number;
        themeChanges: number;
        animationUsage: Record<string, number>;
    };
}



function checkProgressConditions(
    transition: WorkflowTransition,
    context: TransitionEvaluationContext
): { allowed: boolean; reason?: string; blockTransition?: boolean } {
    const progress = context.workflowInstance.progress;
    const tracker = context.progressContext?.tracker;

    if (!progress || !tracker) {
        return { allowed: true };
    }

    // Check if progress tracking is too slow
    const recentMetrics = tracker.getWorkflowMetrics(context.workflowInstance.id, 1);
    if (recentMetrics.length > 0) {
        const avgTime = recentMetrics.reduce((sum, m) => 
            sum + (m.performance?.totalTransitionTime || 0), 0) / recentMetrics.length;
        
        if (avgTime > (transition.progressTracking?.timeoutWarning || 5000)) {
            return { 
                allowed: true, 
                reason: 'Transition is slower than expected',
                blockTransition: false
            };
        }
    }

    // Check success rate if available
    if (transition.progressTracking?.successThreshold) {
        const successRate = calculateSuccessRate(recentMetrics);
        if (successRate < transition.progressTracking.successThreshold) {
            return { 
                allowed: false, 
                reason: `Success rate (${successRate.toFixed(1)}%) below threshold`,
                blockTransition: true
            };
        }
    }

    return { allowed: true };
}

function calculateSuccessRate(metrics: WorkflowProgressMetrics[]): number {
    if (metrics.length === 0) return 100;
    
    const successCount = metrics.filter(m => m.fixedErrors > 0).length;
    return (successCount / metrics.length) * 100;
}

// Enhanced createTransitionButton with progress display
export async function createTransitionButton(
    transition: WorkflowTransition,
    context: TransitionEvaluationContext,
    onClick: () => void
): Promise<TransitionButtonProps> {
    const { canTrigger, reasons, uiState, progress } = await canTriggerTransition(transition, context);
    
    return {
        id: transition.id,
        label: uiState.buttonText,
        enabled: canTrigger && uiState.buttonEnabled,
        color: uiState.buttonColor,
        tooltip: uiState.tooltip || reasons.join(', '),
        icon: transition.uiConfig?.buttonIcon,
        animations: transition.uiConfig?.animations,
        onClick: canTrigger ? onClick : undefined,
        visualFeedback: uiState.visualFeedback,
        progress: progress,
        className: `transition-button ${!canTrigger ? 'disabled' : ''}`,
    };
}

export interface TransitionButtonProps {
    id: string;
    label: string;
    enabled: boolean;
    color?: string;
    tooltip: string;
    icon?: string;
    animations?: TransitionAnimations;
    onClick?: () => void;
    visualFeedback?: TransitionUIConfig['visualFeedback'];
    progress?: Progress;
    className?: string;
}

// UI State interface with progress support
export interface TransitionUIState {
    buttonEnabled: boolean;
    buttonColor?: string;
    buttonText: string;
    tooltip: string;
    visualFeedback?: TransitionUIConfig['visualFeedback'];
    animations?: TransitionAnimations;
    progress?: {
        value: number;
        label?: string;
        showAnimation?: boolean;
    };
}

// Helper function to execute transition with progress tracking
export async function executeTransitionWithTracking(
    transition: WorkflowTransition,
    context: TransitionEvaluationContext,
    onComplete?: (success: boolean, metrics?: any) => void
): Promise<boolean> {
    const startTime = Date.now();
    let conditionEvaluationTime = 0;
    let validationTime = 0;
    let actionExecutionTime = 0;
    let phaseExecutionTime = 0;
    let success = false;
    
    // Initialize backup system if not already present
    let backupSystem = context.progressContext?.backupSystem;
    if (!backupSystem && transition.progressTracking?.enabled) {
        backupSystem = new PhaseBackupSystem();
    }

    try {
        // Evaluate conditions
        const conditionStart = Date.now();
        const conditionResult = await evaluateTransitionConditions(transition.conditions, context);
        conditionEvaluationTime = Date.now() - conditionStart;

        if (!conditionResult.met) {
            throw new Error(`Conditions not met: ${conditionResult.uiHint}`);
        }

        // Run validations
        const validationStart = Date.now();
        const validationErrors = runTransitionValidations(transition.validations || [], context);
        validationTime = Date.now() - validationStart;

        if (validationErrors.length > 0) {
            throw new Error(`Validation failed: ${validationErrors.map(v => v.message).join(', ')}`);
        }

        // Execute pre-transition actions
        const actionStart = Date.now();
        await executeTransitionActions(transition.preTransitionActions || [], context);
        
        // Execute transition logic with PhaseManager integration
        const phaseExecutionStart = Date.now();
        success = await executePhaseTransition(transition, context, backupSystem);
        phaseExecutionTime = Date.now() - phaseExecutionStart;
        
        // Execute post-transition actions
        await executeTransitionActions(transition.postTransitionActions || [], context);
        actionExecutionTime = Date.now() - actionStart;

        success = true;
        
    } catch (error) {
        console.error('Transition failed:', error);
        success = false;
        
        // Attempt rollback if backup system exists
        if (backupSystem && transition.progressTracking?.autoRetry !== false) {
            console.log('Attempting rollback...');
            await attemptRollback(transition, context, backupSystem);
        }
    } finally {
        const totalTime = Date.now() - startTime;

        // Track progress if enabled
        if (transition.progressTracking?.enabled && context.progressContext?.tracker) {
            context.progressContext.tracker.trackWorkflowTransition(
                transition,
                context,
                success,
                totalTime,
                {
                    conditionEvaluationTime,
                    validationTime,
                    actionExecutionTime,
                    phaseExecutionTime
                }
            );
        }

        // Call completion callback
        if (onComplete) {
            onComplete(success, {
                conditionEvaluationTime,
                validationTime,
                actionExecutionTime,
                phaseExecutionTime,
                totalTransitionTime: totalTime
            });
        }
    }

    return success;
}



// Phase transition execution logic
async function executePhaseTransition(
    transition: WorkflowTransition,
    context: TransitionEvaluationContext,
    backupSystem?: PhaseBackupSystem
): Promise<boolean> {
    // Check if we have PhaseManager in context
    const phaseManager = context.workflowInstance.phases?.manager;
    if (!phaseManager) {
        console.log('No PhaseManager found in context, using basic transition');
        return await executeBasicTransition(transition, context);
    }

    // Check if transition has phase-specific configuration
    if (transition.phaseTransition?.enabled) {
        return await executePhaseManagerTransition(transition, context, phaseManager, backupSystem);
    }

    // Default: use PhaseManager's current phase
    return await executeCurrentPhaseTransition(transition, context, phaseManager, backupSystem);
}

// Execute transition using PhaseManager
async function executePhaseManagerTransition(
    transition: WorkflowTransition,
    context: TransitionEvaluationContext,
    phaseManager: PhaseManager<any>,
    backupSystem?: PhaseBackupSystem
): Promise<boolean> {
    const { phaseTransition } = transition;
    
    try {
        // Get current phase from manager
        const currentPhase = phaseManager.getCurrentPhase();
        if (!currentPhase) {
            throw new Error('No current phase available in PhaseManager');
        }

        console.log(`🔄 Executing phase transition: ${currentPhase.name}`);

        // Create backup if backup system is available
        if (backupSystem) {
            await backupSystem.executePhaseWithBackup(
                currentPhase,
                async (phase) => {
                    // Execute the phase using PhaseManager's executePhase method
                    return await phaseManager.executePhase(phase.id);
                },
                transition.progressTracking?.autoRetry || false
            );
        } else {
            // Execute without backup
            await phaseManager.executePhase(currentPhase.id);
        }

        // Handle phase dependencies
        if (currentPhase.dependencies && currentPhase.dependencies.length > 0) {
            console.log(`📋 Checking ${currentPhase.dependencies.length} dependencies`);
            
            for (const depId of currentPhase.dependencies) {
                const depPhase = await findPhaseById(depId, context);
                if (depPhase && !depPhase.isComplete) {
                    console.warn(`⚠️ Dependency ${depPhase.name} not complete`);
                    return false;
                }
            }
        }

        // Handle milestones
        if (currentPhase.milestones && currentPhase.milestones.length > 0) {
            const pendingMilestones = currentPhase.milestones.filter(m => !m.completed);
            console.log(`🎯 ${pendingMilestones.length} milestones pending`);
            
            // Auto-complete milestones if configured
            if (transition.phaseTransition?.autoCompleteMilestones) {
                for (const milestone of pendingMilestones) {
                    await phaseManager.executeMilestone(currentPhase.id, milestone.id);
                }
            }
        }

        // Move to next phase if configured
        if (phaseTransition?.autoAdvance) {
            await phaseManager.moveToNextPhase();
            
            // Get new current phase
            const newCurrentPhase = phaseManager.getCurrentPhase();
            if (newCurrentPhase) {
                console.log(`➡️ Advanced to phase: ${newCurrentPhase.name}`);
                
                // Update context
                context.workflowInstance.currentStep = {
                    ...context.workflowInstance.currentStep,
                    name: newCurrentPhase.name,
                    description: newCurrentPhase.description
                };
            }
        }

        // Update progress metrics
        const milestoneStats = phaseManager.getCurrentMilestoneStats();
        if (milestoneStats && context.progressContext?.tracker) {
            context.progressContext.tracker.trackAnalysis([], {
                totalErrors: milestoneStats.total,
                fixedErrors: milestoneStats.completed
            });
        }

        return true;

    } catch (error) {
        console.error('PhaseManager transition failed:', error);
        throw error;
    }
}

// Execute current phase transition
async function executeCurrentPhaseTransition(
    transition: WorkflowTransition,
    context: TransitionEvaluationContext,
    phaseManager: PhaseManager<any>,
    backupSystem?: PhaseBackupSystem
): Promise<boolean> {
    try {
        const currentPhase = phaseManager.getCurrentPhase();
        if (!currentPhase) {
            throw new Error('No current phase available');
        }

        console.log(`🎯 Executing transition in phase: ${currentPhase.name}`);

        // Use PhaseManager's hooks for transition
        if (currentPhase.hooks?.handleTransitionTo) {
            // Find next phase if specified
            let nextPhase = null;
            if (transition.toStepId) {
                nextPhase = await findPhaseById(transition.toStepId, context);
            }

            if (nextPhase && currentPhase.hooks.canTransitionTo) {
                const canTransition = currentPhase.hooks.canTransitionTo(nextPhase);
                if (!canTransition) {
                    throw new Error(`Cannot transition from ${currentPhase.name} to ${nextPhase.name}`);
                }
            }

            // Execute transition using phase hooks
            await currentPhase.hooks.handleTransitionTo(nextPhase || currentPhase);
            
            // Update phase manager state
            if (nextPhase) {
                await phaseManager.transitionToPhase(nextPhase, context);
            }
        } else {
            // Execute phase directly
            await phaseManager.executePhase(currentPhase.id);
        }

        return true;

    } catch (error) {
        console.error('Current phase transition failed:', error);
        throw error;
    }
}

// Basic transition without PhaseManager
async function executeBasicTransition(
    transition: WorkflowTransition,
    context: TransitionEvaluationContext
): Promise<boolean> {
    console.log(`🔧 Executing basic transition: ${transition.name}`);
    
    // Simple step update
    context.workflowInstance.currentStep = {
        ...context.workflowInstance.currentStep,
        id: transition.toStepId,
        name: transition.name,
        description: transition.description
    };

    // Update workflow data if specified
    if (transition.phaseTransition?.dataTransformation) {
        context.workflowInstance.data = transition.phaseTransition.dataTransformation(
            context.workflowInstance.data,
            context
        );
    }

    return true;
}

// Rollback attempt
async function attemptRollback(
    transition: WorkflowTransition,
    context: TransitionEvaluationContext,
    backupSystem: PhaseBackupSystem
): Promise<void> {
    try {
        // Find recent backups for this workflow
        const workflowId = context.workflowInstance.id;
        const backupStats = backupSystem.getBackupStats();
        
        // Get phase-specific backups
        const phaseBackups = Object.keys(backupStats.byPhase)
            .filter(phaseId => phaseId.includes(workflowId));
        
        if (phaseBackups.length === 0) {
            console.log('No backups available for rollback');
            return;
        }

        // Attempt to restore the most recent backup
        const mostRecentBackup = phaseBackups[0]; // Simplified - you'd sort by timestamp
        const restoreResult = await backupSystem.restorePhase(mostRecentBackup);
        
        if (restoreResult.success) {
            console.log(`✅ Rollback successful: ${mostRecentBackup}`);
            
            // Update context with restored phase
            if (restoreResult.phase) {
                context.workflowInstance.phases = {
                    ...context.workflowInstance.phases,
                    current: restoreResult.phase
                };
            }
        } else {
            console.error('❌ Rollback failed');
        }
        
    } catch (error) {
        console.error('Rollback attempt failed:', error);
    }
}

// Helper function to find phase by ID
async function findPhaseById(
    phaseId: string,
    context: TransitionEvaluationContext
): Promise<any | null> {
    // Check in PhaseManager
    if (context.workflowInstance.phases?.manager) {
        const phases = context.workflowInstance.phases.manager.getPhaseHistory();
        return phases.find(p => p.id === phaseId) || null;
    }
    
    // Check in context data
    if (context.workflowInstance.data?.phases) {
        return context.workflowInstance.data.phases.find((p: any) => p.id === phaseId) || null;
    }
    
    return null;
}

async function executeTransitionActions(
    actions: TransitionAction[],
    context: TransitionEvaluationContext
): Promise<void> {
    for (const action of actions) {
        try {
            // Execute action based on type
            // This is a simplified implementation
            if (action.type === 'track_progress' && context.progressContext?.tracker) {
                // Handle progress tracking actions
                if (action.progressActions?.recordMetrics) {
                    // Record metrics
                }
            }
            // ... handle other action types
        } catch (error) {
            console.error('Failed to execute action:', error);
            // Depending on your needs, you might want to continue or throw
        }
    }
}