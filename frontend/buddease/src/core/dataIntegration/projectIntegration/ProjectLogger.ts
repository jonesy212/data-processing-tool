// ProjectLogger.ts
import { Logger } from '@/core/dataIntegration/projectIntegration/activityLogger';
import { ProjectPhase } from '@/core/projects/projectManagement/ProjectManager';
import { createErrorNotificationContent, errorLogger } from '@/core/logging/Logger';

//  If you don't have this function, create a simple version

function createErrorNotificationContent(error: Error | any): any {
  return {
    name: error.name || 'UnknownError',
    message: error.message || 'Unknown error occurred',
    stack: error.stack || 'No stack trace available',
    timestamp: new Date().toISOString()
  };
}

export class ProjectLogger extends Logger {
  // Project Lifecycle Events



    static logWithOptions(type: string, message: string, uniqueID: string) {
    console.log(`[${type}] ${message} (ID: ${uniqueID})`);
  }

  static logSessionEvent(sessionID: string, event: string) {
    fetch('/api/logs/session', {
      method: "POST",
      body: JSON.stringify({ sessionID, event }),
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to log session event");
      }
    })
    .catch((error: any) => {
      console.error("Failed to log session event:", error);
    });
  }

  static logProjectPhase(phase: string, projectId: string) {
    this.logWithOptions("Project Phase", `${phase} (Project ID: ${projectId})`, projectId);
  }

  static logUserActivity(action: string, userId: string) {
    this.logWithOptions("User Activity", `${action} (User ID: ${userId})`, userId);
  }

  static logError(errorMessage: string, error?: Error | string | null, extraInfo?: any) {
    // Simplified version
    let user: string | null = null;
    let actualError: Error | undefined;
    
    if (typeof error === 'string' || error === null) {
      user = error as string | null;
    } else if (error instanceof Error) {
      actualError = error;
    }
    
    const logData: any = { errorMessage };
    
    if (user) logData.user = user;
    if (actualError) {
      logData.error = actualError;
      logData.stack = actualError.stack;
    }
    if (extraInfo) logData.context = extraInfo;
    
    console.error(`[ERROR] ${errorMessage}`, logData);
  }
  
  static logProjectCreation(
    projectId: string, 
    projectName: string, 
    initialPhase: ProjectPhase,
    createdBy: string,
    metadata?: any
  ) {
    this.logWithOptions(
      "PROJECT_CREATION",
      `Project created: ${projectName}`,
      projectId
    );
    
    this.logSessionEvent(projectId, `project_created:${projectName}`);
    
    if (metadata) {
      console.log("Project Creation Metadata:", {
        projectId,
        projectName,
        initialPhase,
        createdBy,
        timestamp: new Date().toISOString(),
        ...metadata
      });
    }
  }

  static logProjectDeletion(
    projectId: string,
    projectName: string,
    deletedBy: string,
    reason?: string
  ) {
    this.logWithOptions(
      "PROJECT_DELETION",
      `Project deleted: ${projectName}${reason ? ` - Reason: ${reason}` : ''}`,
      projectId
    );
    
    this.logSessionEvent(projectId, `project_deleted:${projectName}`);
  }

  // Phase Transition Logging
  static logPhaseTransition(
    projectId: string,
    projectName: string,
    fromPhase: ProjectPhase,
    toPhase: ProjectPhase,
    triggeredBy: string,
    transitionData?: {
      tasksCompleted?: number;
      tasksTotal?: number;
      durationInPreviousPhase?: number;
    }
  ) {
    this.logWithOptions(
      "PHASE_TRANSITION",
      `Phase transition: ${fromPhase} → ${toPhase}`,
      projectId
    );

    this.logProjectPhase(toPhase, projectId);

    // Enhanced logging with metrics
    if (transitionData) {
      console.log("Phase Transition Metrics:", {
        projectId,
        projectName,
        fromPhase,
        toPhase,
        triggeredBy,
        timestamp: new Date().toISOString(),
        ...transitionData
      });
    }
  }

  // Task Management Logging
  static logTaskCreation(
    projectId: string,
    taskId: string,
    taskDescription: string,
    assignedTo?: string,
    estimatedHours?: number
  ) {
    this.logWithOptions(
      "TASK_CREATION",
      `Task created: ${taskDescription}`,
      projectId
    );

    this.logTaskOperation(projectId, "CREATE", taskId, {
      description: taskDescription,
      assignedTo,
      estimatedHours
    });
  }

  static logTaskCompletion(
    projectId: string,
    taskId: string,
    taskDescription: string,
    completedBy: string,
    actualHours?: number,
    notes?: string
  ) {
    this.logWithOptions(
      "TASK_COMPLETION",
      `Task completed: ${taskDescription}`,
      projectId
    );

    this.logTaskOperation(projectId, "COMPLETE", taskId, {
      description: taskDescription,
      completedBy,
      actualHours,
      notes,
      completionTime: new Date().toISOString()
    });
  }

  static logTaskUpdate(
    projectId: string,
    taskId: string,
    updates: Record<string, any>,
    updatedBy: string
  ) {
    this.logWithOptions(
      "TASK_UPDATE",
      `Task updated: ${Object.keys(updates).join(', ')}`,
      projectId
    );

    this.logTaskOperation(projectId, "UPDATE", taskId, {
      updates,
      updatedBy,
      updateTime: new Date().toISOString()
    });
  }

  // Snapshot Integration Logging
  static logSnapshotConversion(
    projectId: string,
    snapshotId: string,
    conversionType: 'import' | 'export' | 'sync',
    success: boolean,
    details?: {
      snapshotType?: string;
      convertedTasks?: number;
      errors?: string[];
      warnings?: string[];
    }
  ) {
    const status = success ? 'SUCCESS' : 'FAILED';
    
    this.logWithOptions(
      "SNAPSHOT_CONVERSION",
      `Snapshot ${conversionType}: ${status} - Snapshot: ${snapshotId}`,
      projectId
    );

    if (details) {
      console.log("Snapshot Conversion Details:", {
        projectId,
        snapshotId,
        conversionType,
        success,
        timestamp: new Date().toISOString(),
        ...details
      });
    }

    if (!success && details?.errors) {
      this.logConversionErrors(projectId, snapshotId, details.errors);
    }
  }

  // Resource Management Logging
  static logResourceAllocation(
    projectId: string,
    resourceType: string,
    resourceId: string,
    allocatedBy: string,
    allocationDetails: {
      amount?: number;
      duration?: string;
      cost?: number;
    }
  ) {
    this.logWithOptions(
      "RESOURCE_ALLOCATION",
      `Resource allocated: ${resourceType} - ${resourceId}`,
      projectId
    );

    console.log("Resource Allocation Details:", {
      projectId,
      resourceType,
      resourceId,
      allocatedBy,
      timestamp: new Date().toISOString(),
      ...allocationDetails
    });
  }

  // Budget and Financial Logging
  static logBudgetUpdate(
    projectId: string,
    budgetCategory: string,
    oldAmount: number,
    newAmount: number,
    updatedBy: string,
    reason?: string
  ) {
    const change = newAmount - oldAmount;
    const changeType = change >= 0 ? 'increase' : 'decrease';
    
    this.logWithOptions(
      "BUDGET_UPDATE",
      `Budget ${changeType}: ${budgetCategory} - ${Math.abs(change).toFixed(2)}`,
      projectId
    );

    console.log("Budget Update Details:", {
      projectId,
      budgetCategory,
      oldAmount,
      newAmount,
      change,
      changeType,
      updatedBy,
      reason,
      timestamp: new Date().toISOString()
    });
  }

  // Risk Management Logging
  static logRiskIdentification(
    projectId: string,
    riskId: string,
    riskDescription: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    identifiedBy: string
  ) {
    this.logWithOptions(
      "RISK_IDENTIFIED",
      `Risk identified: ${riskDescription} (${severity})`,
      projectId
    );

    this.logSessionEvent(projectId, `risk_identified:${riskId}`);
  }

  static logRiskMitigation(
    projectId: string,
    riskId: string,
    mitigationAction: string,
    assignedTo: string,
    dueDate?: Date
  ) {
    this.logWithOptions(
      "RISK_MITIGATION",
      `Mitigation planned: ${mitigationAction}`,
      projectId
    );

    console.log("Risk Mitigation Details:", {
      projectId,
      riskId,
      mitigationAction,
      assignedTo,
      dueDate: dueDate?.toISOString(),
      timestamp: new Date().toISOString()
    });
  }

  // Team Collaboration Logging
  static logTeamMemberAction(
    projectId: string,
    userId: string,
    action: string,
    target?: string,
    details?: any
  ) {
    this.logWithOptions(
      "TEAM_ACTION",
      `Team action: ${action}${target ? ` on ${target}` : ''}`,
      projectId
    );

    this.logUserActivity(`${action} in project ${projectId}`, userId);

    if (details) {
      console.log("Team Action Details:", {
        projectId,
        userId,
        action,
        target,
        timestamp: new Date().toISOString(),
        ...details
      });
    }
  }

  // Performance and Metrics Logging
  static logProjectMetrics(
    projectId: string,
    metrics: {
      taskCompletionRate: number;
      phaseProgress: number;
      budgetUtilization: number;
      resourceUtilization: number;
      riskCount: number;
      teamSatisfaction?: number;
    },
    recordedBy: string
  ) {
    this.logWithOptions(
      "PROJECT_METRICS",
      `Metrics recorded - Completion: ${metrics.taskCompletionRate}%`,
      projectId
    );

    console.log("Project Metrics:", {
      projectId,
      recordedBy,
      timestamp: new Date().toISOString(),
      ...metrics
    });

    // Log to analytics endpoint if available
    this.logMetricsToAnalytics(projectId, metrics);
  }

  // Dependency and Integration Logging
  static logDependencyResolution(
    projectId: string,
    dependencyType: string,
    dependencyId: string,
    resolution: 'satisfied' | 'blocked' | 'in-progress',
    resolvedBy?: string
  ) {
    this.logWithOptions(
      "DEPENDENCY_RESOLUTION",
      `Dependency ${resolution}: ${dependencyType} - ${dependencyId}`,
      projectId
    );

    console.log("Dependency Resolution:", {
      projectId,
      dependencyType,
      dependencyId,
      resolution,
      resolvedBy,
      timestamp: new Date().toISOString()
    });
  }

  // Error and Exception Logging for Projects
  static logProjectError(
    projectId: string,
    errorType: string,
    errorMessage: string,
    context?: {
      phase?: ProjectPhase;
      taskId?: string;
      userId?: string;
      component?: string;
      stackTrace?: string;
    }
  ) {
    this.logWithOptions(
      "PROJECT_ERROR",
      `Error: ${errorType} - ${errorMessage}`,
      projectId
    );

    // Remove or fix the errorLogger reference
    this.logError(errorMessage, new Error(errorMessage));

    console.error("Project Error Details:", {
      projectId,
      errorType,
      errorMessage,
      timestamp: new Date().toISOString(),
      ...context
    });

    // Notify project stakeholders of critical errors
    if (errorType.includes('CRITICAL') || errorType.includes('BLOCKER')) {
      this.notifyCriticalError(projectId, errorType, errorMessage, context);
    }
  }

  // Audit Trail Logging
  static logProjectAudit(
    projectId: string,
    action: string,
    performedBy: string,
    changes: Record<string, { old: any; new: any }>,
    reason?: string
  ) {
    this.logWithOptions(
      "PROJECT_AUDIT",
      `Audit: ${action} by ${performedBy}`,
      projectId
    );

    console.log("Project Audit Trail:", {
      projectId,
      action,
      performedBy,
      timestamp: new Date().toISOString(),
      changes,
      reason
    });

    // Send to audit log endpoint
    this.sendAuditLog(projectId, action, performedBy, changes, reason);
  }

  // Private helper methods
  private static logTaskOperation(
    projectId: string, 
    operation: string, 
    taskId: string, 
    details: any
  ) {
    console.log("Task Operation:", {
      projectId,
      operation,
      taskId,
      timestamp: new Date().toISOString(),
      ...details
    });
  }

  private static logConversionErrors(
    projectId: string,
    snapshotId: string,
    errors: string[]
  ) {
    errors.forEach(error => {
      this.logProjectError(
        projectId,
        "CONVERSION_ERROR",
        error,
        { component: "SnapshotConverter" }
      );
    });
  }

  private static async logMetricsToAnalytics(
    projectId: string,
    metrics: any
  ) {
    try {
      // Implementation for sending metrics to analytics service
      const analyticsEndpoint = "/api/analytics/project-metrics";
      await fetch(analyticsEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, metrics, timestamp: new Date().toISOString() })
      });
    } catch (error) {
      console.warn("Failed to send metrics to analytics:", error);
    }
  }

  private static async sendAuditLog(
    projectId: string,
    action: string,
    performedBy: string,
    changes: Record<string, { old: any; new: any }>,
    reason?: string
  ) {
    try {
      const auditEndpoint = "/api/audit/project-events";
      await fetch(auditEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          action,
          performedBy,
          changes,
          reason,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.warn("Failed to send audit log:", error);
    }
  }

  private static notifyCriticalError(
    projectId: string,
    errorType: string,
    errorMessage: string,
    context?: any
  ) {
    // Implementation for critical error notifications
    // This could integrate with your notification system
    console.warn("CRITICAL ERROR NOTIFICATION:", {
      projectId,
      errorType,
      errorMessage,
      context,
      timestamp: new Date().toISOString()
    });
  }

  // Batch operations logging
  static logBatchOperation(
    operation: string,
    totalItems: number,
    successful: number,
    failed: number,
    initiatedBy: string,
    duration?: number
  ) {
    this.logWithOptions(
      "BATCH_OPERATION",
      `${operation} - Success: ${successful}/${totalItems}, Failed: ${failed}`,
      `batch-${Date.now()}`
    );

    console.log("Batch Operation Summary:", {
      operation,
      totalItems,
      successful,
      failed,
      successRate: (successful / totalItems) * 100,
      initiatedBy,
      duration: duration ? `${duration}ms` : undefined,
      timestamp: new Date().toISOString()
    });
  }
}

// Export enhanced logging methods
export const ProjectLog = {
  // Quick access methods for common project logging
  create: (projectId: string, projectName: string, createdBy: string) => 
    ProjectLogger.logProjectCreation(projectId, projectName, ProjectPhase.PHASE_1, createdBy),
  
  phase: (projectId: string, projectName: string, from: ProjectPhase, to: ProjectPhase, user: string) =>
    ProjectLogger.logPhaseTransition(projectId, projectName, from, to, user),
  
  task: {
    create: (projectId: string, taskId: string, description: string, assignedTo?: string) =>
      ProjectLogger.logTaskCreation(projectId, taskId, description, assignedTo),
    
    complete: (projectId: string, taskId: string, description: string, user: string) =>
      ProjectLogger.logTaskCompletion(projectId, taskId, description, user),
    
    update: (projectId: string, taskId: string, updates: Record<string, any>, user: string) =>
      ProjectLogger.logTaskUpdate(projectId, taskId, updates, user)
  },
  
  error: (projectId: string, errorType: string, message: string, context?: any) =>
    ProjectLogger.logProjectError(projectId, errorType, message, context),
  
  metrics: (projectId: string, metrics: any, user: string) =>
    ProjectLogger.logProjectMetrics(projectId, metrics, user)
};