// src/models/workflow/TransitionEvaluationContext.ts
import { ProgressTracker } from '@/core/error-analyzer/ProgressTracker';

export interface TransitionEvaluationContext {
    // Workflow instance information
    workflowInstance: {
        id: string;
        name: string;
        version: string;
        currentStepId: string;
        status: 'active' | 'paused' | 'completed' | 'failed';
        startTime: Date;
        lastUpdated: Date;
        metadata: Record<string, any>;
    };
    
    // User information
    user: {
        id: string;
        name: string;
        email?: string;
        roles: string[];
        permissions: string[];
        preferences?: {
            theme?: string;
            language?: string;
            notifications?: boolean;
        };
    };
    
    // Data context for the transition
    data: {
        input: Record<string, any>;
        output?: Record<string, any>;
        intermediate?: Record<string, any>;
        validationResults?: {
            passed: boolean;
            errors: string[];
            warnings: string[];
        };
    };
    
    // UI context (for UI-driven workflows)
    uiContext?: {
        currentComponent: string;
        currentAction: string;
        currentTheme: {
            colors: {
                primary: string;
                secondary: string;
                background: string;
                text: string;
            };
            mode: 'light' | 'dark';
        };
        userInteractions: Array<{
            type: 'click' | 'hover' | 'scroll' | 'input';
            timestamp: Date;
            elementId?: string;
            value?: any;
        }>;
        screenSize: {
            width: number;
            height: number;
            type: 'mobile' | 'tablet' | 'desktop';
        };
    };
    
    // System context
    system: {
        timestamp: Date;
        environment: 'development' | 'staging' | 'production';
        timezone: string;
        locale: string;
        availableMemory?: number;
        cpuUsage?: number;
        networkStatus: 'online' | 'offline' | 'slow';
    };
    
    // History and previous transitions
    history: {
        previousTransitions: Array<{
            transitionId: string;
            timestamp: Date;
            success: boolean;
            duration: number;
            input?: Record<string, any>;
            output?: Record<string, any>;
        }>;
        retryCount: number;
        maxRetries: number;
        totalTimeSpent: number;
    };

    progressContext?: {
        tracker?: ProgressTracker;
        currentProgress?: {
            percentage: number;
            completedSteps: number;
            totalSteps: number;
            lastUpdate: Date;
            estimatedCompletion?: Date;
        };
        requirements?: {
            minimumProgress?: number;
            requiredSteps?: string[];
            conditions?: Array<{
                type: string;
                description: string;
                check: (progress: any) => boolean;
            }>;
        };
        metrics?: {
            performance: {
                averageTimePerStep: number;
                fastestStep: number;
                slowestStep: number;
            };
            accuracy: {
                successRate: number;
                errorRate: number;
                retryRate: number;
            };
            completion: {
                onTimeRate: number;
                delayedRate: number;
                averageDelay: number;
            };
        };
    };
    
    // External dependencies status
    externalDependencies: {
        apiStatus: Record<string, 'healthy' | 'degraded' | 'down'>;
        databaseStatus: 'connected' | 'disconnected' | 'slow';
        cacheStatus: 'connected' | 'disconnected';
        fileSystemStatus: 'writable' | 'readonly' | 'unavailable';
    };
    
    // Business rules and constraints
    constraints: {
        timeConstraints?: {
            maxDuration: number; // in milliseconds
            startTime: Date;
            deadline?: Date;
        };
        costConstraints?: {
            maxCost: number;
            currency: string;
            spentSoFar: number;
        };
        qualityConstraints?: {
            minConfidence: number;
            maxErrorRate: number;
            requiredValidations: string[];
        };
        securityConstraints?: {
            requiredPermissions: string[];
            dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
            encryptionRequired: boolean;
        };
    };
    
    // Analytics and metrics
    analytics: {
        decisionPoints: Array<{
            id: string;
            type: 'condition' | 'validation' | 'action';
            result: boolean | any;
            duration: number;
        }>;
        performanceMetrics: {
            averageTransitionTime: number;
            successRate: number;
            errorRate: number;
            commonFailures: string[];
        };
        businessMetrics?: {
            kpis: Record<string, number>;
            goals: Record<string, { target: number; current: number }>;
            revenueImpact?: number;
            userImpact?: number;
        };
    };
    
    // Custom extensions
    customExtensions?: Record<string, any>;
}

// Helper function to create a context
export function createTransitionEvaluationContext(
    workflowId: string,
    userId: string,
    stepId: string,
    inputData: Record<string, any> = {}
): TransitionEvaluationContext {
    const now = new Date();
    
    return {
        workflowInstance: {
            id: workflowId,
            name: `workflow-${workflowId}`,
            version: '1.0.0',
            currentStepId: stepId,
            status: 'active',
            startTime: now,
            lastUpdated: now,
            metadata: {}
        },
        user: {
            id: userId,
            name: `User-${userId}`,
            roles: ['user'],
            permissions: ['read', 'write']
        },
        data: {
            input: inputData,
            validationResults: {
                passed: true,
                errors: [],
                warnings: []
            }
        },
        system: {
            timestamp: now,
            environment: process.env.NODE_ENV as 'development' | 'staging' | 'production' || 'development',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            locale: navigator.language || 'en-US',
            networkStatus: navigator.onLine ? 'online' : 'offline'
        },
        history: {
            previousTransitions: [],
            retryCount: 0,
            maxRetries: 3,
            totalTimeSpent: 0
        },
        externalDependencies: {
            apiStatus: {},
            databaseStatus: 'connected',
            cacheStatus: 'connected',
            fileSystemStatus: 'writable'
        },
        constraints: {
            qualityConstraints: {
                minConfidence: 80,
                maxErrorRate: 5,
                requiredValidations: []
            }
        },
        analytics: {
            decisionPoints: [],
            performanceMetrics: {
                averageTransitionTime: 0,
                successRate: 100,
                errorRate: 0,
                commonFailures: []
            }
        }
    };
}

// Helper function to update context after transition
export function updateContextAfterTransition(
    context: TransitionEvaluationContext,
    transitionResult: {
        success: boolean;
        output?: Record<string, any>;
        duration: number;
        transitionId: string;
    }
): TransitionEvaluationContext {
    const updatedContext = { ...context };
    const now = new Date();
    
    // Update workflow instance
    updatedContext.workflowInstance.lastUpdated = now;
    
    // Update data with output
    if (transitionResult.output) {
        updatedContext.data.output = transitionResult.output;
    }
    
    // Update history
    updatedContext.history.previousTransitions.push({
        transitionId: transitionResult.transitionId,
        timestamp: now,
        success: transitionResult.success,
        duration: transitionResult.duration,
        input: context.data.input,
        output: transitionResult.output
    });
    
    updatedContext.history.totalTimeSpent += transitionResult.duration;
    
    // Update analytics
    updatedContext.analytics.decisionPoints.push({
        id: `transition-${transitionResult.transitionId}`,
        type: 'action',
        result: transitionResult.success,
        duration: transitionResult.duration
    });
    
    // Update performance metrics
    const allTransitions = updatedContext.history.previousTransitions;
    const successfulTransitions = allTransitions.filter(t => t.success);
    const totalDuration = allTransitions.reduce((sum, t) => sum + t.duration, 0);
    
    updatedContext.analytics.performanceMetrics = {
        averageTransitionTime: allTransitions.length > 0 
            ? totalDuration / allTransitions.length 
            : 0,
        successRate: allTransitions.length > 0
            ? (successfulTransitions.length / allTransitions.length) * 100
            : 100,
        errorRate: allTransitions.length > 0
            ? ((allTransitions.length - successfulTransitions.length) / allTransitions.length) * 100
            : 0,
        commonFailures: allTransitions
            .filter(t => !t.success)
            .map(t => t.transitionId)
            .filter((id, index, array) => array.indexOf(id) === index) // Unique
    };
    
    return updatedContext;
}

// Helper function to check if context meets security requirements
export function validateSecurityConstraints(
    context: TransitionEvaluationContext
): { passed: boolean; violations: string[] } {
    const violations: string[] = [];
    
    // Check user permissions
    if (context.constraints.securityConstraints) {
        const { requiredPermissions, dataClassification, encryptionRequired } = 
            context.constraints.securityConstraints;
        
        // Check permissions
        for (const requiredPerm of requiredPermissions) {
            if (!context.user.permissions.includes(requiredPerm)) {
                violations.push(`Missing permission: ${requiredPerm}`);
            }
        }
        
        // Check data classification (simplified example)
        if (dataClassification === 'restricted' && 
            context.user.roles.includes('guest')) {
            violations.push('Guest cannot access restricted data');
        }
        
        // Check encryption (simplified example)
        if (encryptionRequired && context.system.environment === 'production') {
            // In real implementation, check if data is encrypted
            console.log('Encryption check would be performed here');
        }
    }
    
    return {
        passed: violations.length === 0,
        violations
    };
}

// Helper function to get context for UI display
export function getUIContextSummary(context: TransitionEvaluationContext): {
    workflow: string;
    step: string;
    user: string;
    progress: string;
    status: string;
} {
    const totalTransitions = context.history.previousTransitions.length;
    const successfulTransitions = context.history.previousTransitions.filter(t => t.success).length;
    const progress = totalTransitions > 0 
        ? Math.round((successfulTransitions / totalTransitions) * 100) 
        : 0;
    
    return {
        workflow: context.workflowInstance.name,
        step: context.workflowInstance.currentStepId,
        user: context.user.name,
        progress: `${progress}%`,
        status: context.workflowInstance.status
    };
}

// Type guards and utilities
export function hasUIContext(context: TransitionEvaluationContext): context is TransitionEvaluationContext & { uiContext: NonNullable<TransitionEvaluationContext['uiContext']> } {
    return context.uiContext !== undefined;
}

export function hasBusinessMetrics(context: TransitionEvaluationContext): context is TransitionEvaluationContext & { analytics: { businessMetrics: NonNullable<TransitionEvaluationContext['analytics']['businessMetrics']> } } {
    return context.analytics.businessMetrics !== undefined;
}
