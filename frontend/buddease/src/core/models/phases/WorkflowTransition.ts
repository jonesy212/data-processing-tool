// WorkflowTransition.ts
import type { ThemeSettings } from '@/core/branding/ThemeSettings';
import type { ValidationResult } from '@/core/components/database/SchemaEvolutionManager';
import type { SharedIdentifiers, SharedStatusFlags, SharedTimestamps } from '@/core/documents/RelatedProps';
import PhaseManager from '@/core/models/phases/PhaseManager';
import type { DocumentAnimationOptions } from '@/core/documents/SharedDocumentProps';
import type { FixPlan } from '@/core/error-analyzer/ErrorFixManager';
import type { FixHistoryEntry, ProgressMetrics, ProgressTracker } from '@/core/error-analyzer/ProgressTracker';
import type { Progress, ProgressPhase } from '@/core/models/tracker/ProgressBar';
import type { WorkflowStep } from '@/core/typings/entities/DocumentEntity';
import type { PhaseBackupSystem } from '@/core/error-analyzer/phases/PhaseBackupSystem';
import StorageService from '@/src/utils/storage/StorageService';

// Create a storage service instance
export const storageService = new StorageService();

export interface WorkflowTransition extends 
  SharedIdentifiers<any, any>, // Using 'any' since we don't have specific BaseDataEntity types here
  SharedTimestamps,
  SharedStatusFlags {
  id: string;
  name: string;
  description?: string;
  // 🔄 Transition specification
  fromStepId: string; // Source step ID
  toStepId: string;   // Destination step ID
  
  // ⚙️ Conditions for when this transition can occur
  conditions: TransitionCondition[];
  
  // 👤 Who can perform this transition
  allowedRoles: string[]; // User roles that can trigger this transition
  allowedUsers?: string[]; // Specific user IDs that can trigger
  
  // 🎯 Actions to perform during transition
  preTransitionActions?: TransitionAction[];
  postTransitionActions?: TransitionAction[];
  
  // 📋 Validation rules
  validations?: TransitionValidation[];
  
  // ⏱️ Timing and scheduling
  timeout?: number; // In milliseconds
  schedule?: TransitionSchedule;
  
  // 🎨 UI/UX configuration - INTEGRATED WITH YOUR ThemeSettings
  uiConfig?: TransitionUIConfig;
  
  // 📊 Metadata
  priority: number;
  enabled: boolean;
  tags?: string[];
  version: number;

  progressTracking?: {
    enabled: boolean;
    trackPerformance: boolean;
    trackUIMetrics: boolean;
    trackErrors: boolean;

    successThreshold?: number; // Minimum success rate to consider transition healthy
    timeoutWarning?: number; // Time in ms after which to warn about slow transitions
    autoRetry?: boolean; // Automatically retry failed transitions
    maxRetries?: number;
    progressTracker?: ProgressTracker; // Embedded progress tracker
    requiredProgress?: number; // Minimum required progress percentage (0-100)
    conditions?: ProgressCondition[]; // Additional progress conditions

  };

  phaseManagerConfig?: {
    usePhaseManager: boolean;
    phaseId?: string; // Specific phase to execute
    autoAdvance?: boolean; // Auto-advance to next phase
    autoCompleteMilestones?: boolean;
    executeDependencies?: boolean; // Check and execute dependencies
    backupEnabled?: boolean; // Use PhaseBackupSystem
    rollbackOnError?: boolean;
    maxRetries?: number;
    retryDelay?: number;
    
    // Phase-specific transition rules
    transitionRules?: {
        requireAllDependencies?: boolean;
        requireMilestoneCompletion?: boolean;
        validatePhaseState?: boolean;
        skipIfCompleted?: boolean;
    };
    
    // Notification configuration
    notifications?: {
        onPhaseStart?: boolean;
        onPhaseComplete?: boolean;
        onError?: boolean;
        onRollback?: boolean;
    };
  };
}


interface ProgressCondition {
  check: (progress: ProgressData,
  context: TransitionEvaluationContext) => boolean;
  message?: string;
  blockTransition?: boolean;
}

interface ProgressData {
  percentage: number;
  completedSteps: number;
  totalSteps: number;
  // ... any other progress properties
}

// Enhanced TransitionUIConfig that integrates with your ThemeSettings
export interface TransitionUIConfig {
  // Button/Link Configuration
  buttonLabel?: string;
  buttonIcon?: string;
  
  // Color Configuration (maps to your ThemeSettings.colors)
  colors?: {
    button?: string;                // Maps to ThemeSettings.colors.button.color
    buttonHover?: string;          // Maps to ThemeSettings.colors.button.colorHover
    buttonActive?: string;         // Maps to ThemeSettings.colors.button.colorActive
    buttonDisabled?: string;       // Maps to ThemeSettings.colors.button.colorDisabled
    text?: string;                 // Maps to ThemeSettings.colors.button.textColor
    textHover?: string;            // Maps to ThemeSettings.colors.button.textColorHover
    border?: string;               // Maps to ThemeSettings.colors.borderColor
    borderHover?: string;          // Maps to ThemeSettings.colors.borderColorHover
  };
  
  // Animation Configuration (integrates with DocumentAnimationOptions)
  animations?: TransitionAnimations;
  
  // Visual Feedback
  visualFeedback?: {
    showProgress?: boolean;
    progressColor?: string;
    successIcon?: string;
    errorIcon?: string;
    confirmationMessage?: string;
    confirmationRequired?: boolean;
    confirmButtonText?: string;
    cancelButtonText?: string;
  };

  // Progress display configuration
  progressDisplay?: {
    showProgressBar?: boolean;
    progressBarPosition?: 'above' | 'below' | 'inline';
    showPercentage?: boolean;
    showEstimatedTime?: boolean;
    successAnimation?: string;
    errorAnimation?: string;
  };
  
  // Responsive Configuration
  responsive?: {
    hideOnMobile?: boolean;
    mobileLabel?: string;
    mobileIcon?: string;
    tabletLayout?: 'icon' | 'text' | 'both';
  };
  
  // Accessibility
  accessibility?: {
    ariaLabel?: string;
    keyboardShortcut?: string;
    focusOrder?: number;
    screenReaderHint?: string;
  };
}

// Animation configuration that extends DocumentAnimationOptions
export interface TransitionAnimations extends Omit<DocumentAnimationOptions, 'duration'> {
  // Transition-specific animations
  transitionType?: 'fade' | 'slide' | 'scale' | 'flip' | 'custom';
  direction?: 'left' | 'right' | 'up' | 'down';
  duration?: number; // In milliseconds
  easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | string;
  
  // Button animations (from your Palette/ThemeSettings context)
  buttonHoverAnimation?: string;
  buttonClickAnimation?: string;
  
  // Progress/loading animations
  loadingAnimation?: {
    type: 'spinner' | 'progress' | 'dots' | 'pulse';
    color?: string;
    size?: string;
  };
  
  // Success/error animations
  feedbackAnimation?: {
    success?: string;
    error?: string;
    duration?: number;
  };

  // Progress animation
  progressAnimation?: {
    type: 'fill' | 'pulse' | 'wave' | 'scan';
    color?: string;
    speed?: number;
    direction?: 'left-to-right' | 'right-to-left' | 'top-to-bottom' | 'bottom-to-top';
  };
}

// Supporting types for WorkflowTransition
export interface TransitionCondition {
  type: 'data_condition' | 'user_permission' | 'time_based' | 'external_event' | 'custom' | 'ui_state';
  property?: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'exists' | 'regex' | 'in_range' | 'starts_with' | 'ends_with';
  value?: any;
  logicalOperator?: 'and' | 'or';
  customLogic?: string; // For custom condition types
  
  // UI-specific conditions (from your Palette/ThemeSettings context)
  uiCondition?: {
    elementVisible?: boolean;
    animationComplete?: boolean;
    colorMatch?: string; // Could check if current theme color matches condition
    paletteLoaded?: boolean;
    highlightActive?: boolean; // From your Highlight/ColorPalette context
  };

  // Progress-aware conditions
  progressCondition?: {
    minProgress?: number; // Minimum progress percentage required
    maxErrors?: number; // Maximum errors allowed
    fixRate?: number; // Minimum fix rate required
    confidenceTrend?: 'improving' | 'stable'; // Required confidence trend
  };
}

export interface TransitionAction {
  type: 'update_data' | 'send_notification' 
  | 'call_webhook' | 'execute_script' 
  | 'create_task' | 'log_audit' | 'ui_action' 
  | 'theme_update' | 'track_progress' | 'report_error';
  target?: string;
  payload?: any;
  delay?: number; // Delay in milliseconds before executing
  retryPolicy?: RetryPolicy;
  
  // Progress tracking actions
  progressActions?: {
    startTracking?: boolean;
    recordMetrics?: boolean;
    updateProgressBar?: boolean;
    sendProgressReport?: boolean;
    logPerformance?: boolean;
  };
    
  // UI-specific actions
  uiActions?: {
    showToast?: {
      message: string;
      type: 'success' | 'error' | 'warning' | 'info';
      duration?: number;
    };
    updateTheme?: Partial<ThemeSettings>;
    changeColor?: {
      elementId: string;
      color: string;
      animation?: string;
    };
    triggerAnimation?: string;
    updateHighlight?: {
      highlightId: number; // From your Highlight interface
      color?: string;
      enabled?: boolean;
    };
  };
}

export interface TransitionValidation {
  type: 'data_validation' | 'business_rule' | 'external_approval' | 'ui_validation';
  rule: string;
  errorMessage: ValidationResult;
  severity: 'warning' | 'error' | 'blocker';
  
  // UI-specific validations
  uiValidation?: {
    elementExists?: boolean;
    colorContrast?: boolean; // Check color contrast for accessibility
    animationComplete?: boolean;
    paletteValid?: boolean; // Validate color palette
  };
}

export interface TransitionSchedule {
  availableFrom?: Date;
  availableUntil?: Date;
  daysOfWeek?: number[];
  hoursOfDay?: number[]; // 0-23
  timezone?: string;
  
  // Theme-aware scheduling (e.g., different transitions in dark mode)
  themeAware?: {
    darkModeOnly?: boolean;
    lightModeOnly?: boolean;
    specificTheme?: string;
  };

  // Progress-aware scheduling
  progressAware?: {
    minProgressRequired?: number;
    maxErrorsAllowed?: number;
    onlyDuringActiveTracking?: boolean;
    pauseOnHighErrorRate?: boolean;
  };
}

export interface RetryPolicy {
  maxAttempts: number;
  delay: number;
  backoffMultiplier: number;
  
  // UI feedback for retries
  uiFeedback?: {
    showRetryCount?: boolean;
    retryMessage?: string;
    progressAnimation?: string;
  };
  
  // Progress tracking for retries
  progressTracking?: {
    trackRetryAttempts?: boolean;
    updateProgressOnRetry?: boolean;
    retryMetrics?: boolean;
  };
}

// Enhanced context that includes UI/theme information
export interface TransitionEvaluationContext {
    workflowInstance: {
        id: string;
        currentStep: WorkflowStep;
        data: Record<string, any>;
        startedAt: Date;
        createdBy: string;
        uiState?: Record<string, any>;
        progress?: {
            current: number;
            total: number;
            percentage: number;
            metrics?: ProgressMetrics;
        };
        // Phase Manager integration
        phases?: {
            current: any;
            manager: PhaseManager<any>;
            backupSystem?: PhaseBackupSystem;
            history?: any[];
        };
    };
    user: {
        id: string;
        roles: string[];
        permissions: string[];
        themePreferences?: ThemeSettings;
    };
    uiContext: {
        currentTheme: ThemeSettings;
        colorPalette: string[];
        activeHighlights: Highlight[];
        animationsEnabled: boolean;
        deviceType: 'desktop' | 'tablet' | 'mobile';
        screenSize: { width: number; height: number };
    };
    progressContext: {
        tracker?: ProgressTracker;
        currentProgress?: Progress;
        currentPhase?: ProgressPhase;
        metrics?: ProgressMetrics;
        history?: FixHistoryEntry[];
        fixPlans?: FixPlan[];
        backupSystem?: PhaseBackupSystem;
    };
    actionData?: Record<string, any>;
    timestamp: Date;
}



function evaluateCustomLogic(
  condition: TransitionCondition,
  context: TransitionEvaluationContext
): boolean {
  if (!condition.customLogic) return true;
  
  try {
    // WARNING: Using eval is dangerous in production!
    // In a real app, you'd use a safe expression evaluator or custom logic handlers
    const func = new Function('context', `return ${condition.customLogic}`);
    return func(context);
  } catch (error) {
    console.error('Error evaluating custom logic:', error);
    return false;
  }
}


async function checkExternalEvent(
  condition: TransitionCondition,
  context: TransitionEvaluationContext
): Promise<boolean> {
  // Check for specific external event types
  if (condition.type === 'external_event' && condition.customLogic) {
    return await checkStoredEvent(condition.customLogic, context);
  }
  
  return false;
}

async function checkStoredEvent(
  eventId: string,
  context: TransitionEvaluationContext
): Promise<boolean> {
  try {
    // Use your StorageService to check if event was recorded
    const eventData = await storageService.get(`external-events/${eventId}`);
    
    if (!eventData) return false;
    
    // Check if event occurred in relevant timeframe
    const eventTime = new Date(eventData.timestamp);
    const isRecent = context.timestamp.getTime() - eventTime.getTime() <= 
                    (eventData.timeout || 24 * 60 * 60 * 1000); // Default 24 hours
    
    // Check if event matches the current workflow/user context
    const matchesContext = !eventData.workflowId || 
                          eventData.workflowId === context.workflowInstance.id;
    
    return isRecent && matchesContext;
  } catch (error) {
    console.error('Error checking external event:', error);
    return false;
  }
}

// Function to record external events
export async function recordExternalEvent(
  eventId: string,
  data: {
    workflowId?: string;
    userId?: string;
    metadata?: any;
    timeout?: number; // How long this event is valid (ms)
  } = {}
): Promise<void> {
  const eventData = {
    id: eventId,
    timestamp: new Date().toISOString(),
    ...data
  };
  
  await storageService.set(`external-events/${eventId}`, eventData);
}

async function evaluateTransitionCondition(
  condition: TransitionCondition,
  context: TransitionEvaluationContext
): Promise<{ met: boolean; uiHint?: string }> {
  // Special handling for UI conditions
  if (condition.type === 'ui_state' && condition.uiCondition) {
    return evaluateUICondition(condition.uiCondition, context);
  }
  
  let result = false;
  let uiHint: string | undefined;
  
  switch (condition.type) {
    case 'data_condition':
      result = evaluateDataCondition(condition, context);
      if (!result) {
        uiHint = `Data condition not met for property: ${condition.property}`;
      }
      break;
      
    case 'time_based':
      result = evaluateTimeCondition(condition, context);
      if (!result) {
        uiHint = `Time condition not met`;
      }
      break;
      
    case 'user_permission':
      result = evaluateUserPermissionCondition(condition, context);
      if (!result) {
        uiHint = `User lacks required permission: ${condition.property}`;
      }
      break;
      
    case 'external_event':
      // For external events, we need to check if they've occurred
      result = await checkExternalEvent(condition, context); // Add await
      if (!result) {
        uiHint = `Waiting for external event: ${condition.customLogic}`;
      }
      break;
      
    case 'custom':
      // Evaluate custom logic if provided
      result = evaluateCustomLogic(condition, context);
      if (!result && condition.customLogic) {
        uiHint = `Custom condition not met: ${condition.customLogic.substring(0, 50)}...`;
      }
      break;
      
    default:
      // For unknown types, assume true but log a warning
      result = true;
      uiHint = `Unknown condition type: ${condition.type}, assuming true`;
  }
  
  return { met: result, uiHint };
}


function evaluateDataCondition(
  condition: TransitionCondition,
  context: TransitionEvaluationContext
): boolean {
  if (!condition.property) return false;
  
  // Navigate to property in workflow data
  const value = getNestedProperty(context.workflowInstance.data, condition.property);
  
  switch (condition.operator) {
    case 'equals':
      return value === condition.value;
    case 'not_equals':
      return value !== condition.value;
    case 'greater_than':
      return value > condition.value;
    case 'less_than':
      return value < condition.value;
    case 'contains':
      return String(value).includes(String(condition.value));
    case 'exists':
      return value !== undefined && value !== null;
    case 'regex':
      if (typeof value !== 'string' || typeof condition.value !== 'string') return false;
      return new RegExp(condition.value).test(value);
    case 'in_range':
      if (!Array.isArray(condition.value) || condition.value.length !== 2) return false;
      return value >= condition.value[0] && value <= condition.value[1];
    case 'starts_with':
      return String(value).startsWith(String(condition.value));
    case 'ends_with':
      return String(value).endsWith(String(condition.value));
    default:
      return false;
  }
}


function evaluateTimeCondition(
  condition: TransitionCondition,
  context: TransitionEvaluationContext
): boolean {
  const now = context.timestamp;
  const workflowStart = context.workflowInstance.startedAt;
  
  switch (condition.operator) {
    case 'greater_than':
      return now > new Date(condition.value);
    case 'less_than':
      return now < new Date(condition.value);
    case 'equals':
      // Compare dates (ignoring time)
      return now.toDateString() === new Date(condition.value).toDateString();
    case 'in_range':
      if (!Array.isArray(condition.value) || condition.value.length !== 2) return false;
      const start = new Date(condition.value[0]);
      const end = new Date(condition.value[1]);
      return now >= start && now <= end;
    default:
      return false;
  }
}

function evaluateUserPermissionCondition(
  condition: TransitionCondition,
  context: TransitionEvaluationContext
): boolean {
  if (!condition.property) return false;
  
  // Check if user has the specified permission
  return context.user.permissions.includes(condition.property);
}

function getNestedProperty(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

function runTransitionValidations(
  validations: TransitionValidation[],
  context: TransitionEvaluationContext
): ValidationResult[] {
  const errors: ValidationResult[] = [];
  
  for (const validation of validations) {
    if (!validateTransition(validation, context)) {
      errors.push(validation.errorMessage);
    }
  }
  
  return errors;
}

function validateTransition(
  validation: TransitionValidation,
  context: TransitionEvaluationContext
): boolean {
  // Implement validation logic based on type
  // This is a simplified example
  return true;
}

// Enhanced canTriggerTransition with progress tracking and UI awareness
export async function canTriggerTransition(
  transition: WorkflowTransition,
  context: TransitionEvaluationContext
): Promise<{ canTrigger: boolean; reasons: string[]; uiState: TransitionUIState; progress?: Progress }> {
  const reasons: string[] = [];
  const errors: ValidationResult[] = [];

  // Initialize UI state with transition configuration
  const uiState: TransitionUIState = {
    buttonEnabled: true,
    buttonColor: transition.uiConfig?.colors?.button,
    buttonText: transition.uiConfig?.buttonLabel || transition.name,
    tooltip: '',
    visualFeedback: transition.uiConfig?.visualFeedback,
    // Add progress display if enabled
    progress: transition.uiConfig?.progressDisplay?.showProgressBar ? {
      value: context.workflowInstance.progress?.percentage || 0,
      label: `${Math.round(context.workflowInstance.progress?.percentage || 0)}%`,
      showAnimation: true
    } : undefined
  };

  // === 1. Check user permissions ===
  const hasRolePermission = context.user.roles.some(role => 
    transition.allowedRoles.includes(role)
  );
  
  const hasUserPermission = transition.allowedUsers?.includes(context.user.id) || false;
  
  if (!hasRolePermission && !hasUserPermission) {
    reasons.push('User does not have permission to trigger this transition');
    uiState.buttonEnabled = false;
    uiState.tooltip = 'Permission required';
    uiState.buttonColor = context.uiContext.currentTheme.colors?.button.colorDisabled;
  }
  
  // === 2. Check if transition is enabled ===
  if (!transition.enabled) {
    reasons.push('Transition is disabled');
    uiState.buttonEnabled = false;
    uiState.buttonColor = context.uiContext.currentTheme.colors?.button.colorDisabled;
  }
  
  // === 3. Check schedule availability ===
  if (transition.schedule) {
    const scheduleCheck = isTransitionAvailable(transition.schedule, context);
    if (!scheduleCheck.available) {
      reasons.push(scheduleCheck.reason || 'Transition is not available at this time');
      if (!scheduleCheck.allowWithUiWarning) {
        uiState.buttonEnabled = false;
      }
    }
  }
  
  // === 4. Check progress conditions if enabled ===
  if (transition.progressTracking?.enabled && context.progressContext?.tracker) {
    const progressCheck = checkProgressConditions(transition, context);
    if (!progressCheck.allowed) {
      reasons.push(progressCheck.reason);
      if (progressCheck.blockTransition) {
        uiState.buttonEnabled = false;
        uiState.buttonColor = context.uiContext.currentTheme.colors?.button.colorDisabled;
      }
    }
  }
  
  // === 5. Check conditions with async evaluation ===
  const conditionsResult = await evaluateTransitionConditions(transition.conditions, context);
  if (!conditionsResult.met) {
    reasons.push('Transition conditions not met');
    uiState.buttonEnabled = false;
    if (conditionsResult.uiHint) {
      uiState.tooltip = conditionsResult.uiHint;
    }
  }
  
  // === 6. Check validations ===
  const validationErrors = runTransitionValidations(transition.validations || [], context);
  if (validationErrors.length > 0) {
    reasons.push(...validationErrors.map(v => v.message));
    uiState.buttonEnabled = false;
    if (validationErrors.some(v => v.severity === 'error')) {
      uiState.buttonColor = context.uiContext.currentTheme.colors?.error;
    }
  }
  
  // === 7. Get progress data for UI if tracking is enabled ===
  let progress: Progress | undefined;
  if (transition.progressTracking?.enabled && context.progressContext?.tracker) {
    progress = context.progressContext.tracker.getProgressForUI({
      workflowId: context.workflowInstance.id,
      transitionId: transition.id
    });
    
    // Update UI state with current progress
    if (progress) {
      uiState.progress = {
        value: progress.percentage,
        label: `${Math.round(progress.percentage)}%`,
        showAnimation: true
      };
    }
  }
  
  // === 8. Update UI state based on current theme ===
  updateUIStateForTheme(uiState, context.uiContext.currentTheme);
  
  return {
    canTrigger: reasons.length === 0,
    reasons,
    uiState,
    progress
  };
}

// Helper function for progress conditions
function checkProgressConditions(
  transition: WorkflowTransition, 
  context: TransitionEvaluationContext
): { allowed: boolean; reason: string; blockTransition: boolean } {
  const tracker = context.progressContext?.tracker;
  if (!tracker) {
    return { allowed: true, reason: '', blockTransition: false };
  }
  
  const progress = tracker.getCurrentProgress(context.workflowInstance.id);
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

// Enhanced schedule check with theme awareness
function isTransitionAvailable(
  schedule: TransitionSchedule,
  context: TransitionEvaluationContext
): { available: boolean; reason?: string; allowWithUiWarning?: boolean } {
  const now = context.timestamp;
  
  // Check date range
  if (schedule.availableFrom && now < schedule.availableFrom) {
    return { 
      available: false, 
      reason: `Available from ${schedule.availableFrom.toLocaleDateString()}`,
      allowWithUiWarning: true
    };
  }
  if (schedule.availableUntil && now > schedule.availableUntil) {
    return { 
      available: false, 
      reason: `Expired on ${schedule.availableUntil.toLocaleDateString()}` 
    };
  }
  
  // Check day of week
  if (schedule.daysOfWeek && schedule.daysOfWeek.length > 0) {
    const dayOfWeek = now.getDay();
    if (!schedule.daysOfWeek.includes(dayOfWeek)) {
      return { 
        available: false, 
        reason: 'Not available on this day',
        allowWithUiWarning: true
      };
    }
  }
  
  // Check hour of day
  if (schedule.hoursOfDay && schedule.hoursOfDay.length > 0) {
    const hourOfDay = now.getHours();
    if (!schedule.hoursOfDay.includes(hourOfDay)) {
      return { 
        available: false, 
        reason: 'Not available at this hour',
        allowWithUiWarning: true
      };
    }
  }
  
  // Check theme-aware restrictions
  if (schedule.themeAware) {
    const currentTheme = context.uiContext.currentTheme;
    const isDarkMode = currentTheme.colors?.darkModeBackground !== undefined;
    
    if (schedule.themeAware.darkModeOnly && !isDarkMode) {
      return { 
        available: false, 
        reason: 'Available in dark mode only',
        allowWithUiWarning: true
      };
    }
    
    if (schedule.themeAware.lightModeOnly && isDarkMode) {
      return { 
        available: false, 
        reason: 'Available in light mode only',
        allowWithUiWarning: true
      };
    }
    
    if (schedule.themeAware.specificTheme && 
        schedule.themeAware.specificTheme !== currentTheme.colors?.primary) {
      return { 
        available: false, 
        reason: `Requires ${schedule.themeAware.specificTheme} theme`,
        allowWithUiWarning: true
      };
    }
  }
  
  return { available: true };
}

// Enhanced condition evaluation with UI hints
// Make this async to handle the async evaluateTransitionCondition
async function evaluateTransitionConditions(
  conditions: TransitionCondition[],
  context: TransitionEvaluationContext
): Promise<{ met: boolean; uiHint?: string }> {
  if (conditions.length === 0) return { met: true };
  
  let result = true;
  let lastLogicalOperator: 'and' | 'or' = 'and';
  let uiHint: string | undefined;
  
  for (const condition of conditions) {
    // Add await here since evaluateTransitionCondition is now async
    const conditionResult = await evaluateTransitionCondition(condition, context);
    
    if (lastLogicalOperator === 'and') {
      result = result && conditionResult.met;
    } else {
      result = result || conditionResult.met;
    }
    
    if (!conditionResult.met && conditionResult.uiHint) {
      uiHint = conditionResult.uiHint;
    }
    
    lastLogicalOperator = condition.logicalOperator || 'and';
  }
  
  return { met: result, uiHint };
}

function evaluateUICondition(
  uiCondition: any,
  context: TransitionEvaluationContext
): { met: boolean; uiHint?: string } {
  if (uiCondition.highlightActive) {
    const hasActiveHighlights = context.uiContext.activeHighlights.length > 0;
    return { 
      met: hasActiveHighlights,
      uiHint: hasActiveHighlights ? undefined : 'No active highlights'
    };
  }
  
  if (uiCondition.colorMatch) {
    const currentColor = context.uiContext.currentTheme.colors?.primary;
    const matches = currentColor === uiCondition.colorMatch;
    return { 
      met: matches,
      uiHint: matches ? undefined : `Requires ${uiCondition.colorMatch} theme`
    };
  }
  
  return { met: true };
}

// UI State interface for transition buttons/components
export interface TransitionUIState {
  buttonEnabled: boolean;
  buttonColor?: string;
  buttonText: string;
  tooltip: string;
  visualFeedback?: TransitionUIConfig['visualFeedback'];
  animations?: TransitionAnimations;
}

function updateUIStateForTheme(
  uiState: TransitionUIState,
  theme: ThemeSettings
): void {
  // Apply theme-specific overrides
  if (!uiState.buttonColor) {
    uiState.buttonColor = theme.colors?.button?.color;
  }
  
  // Ensure sufficient contrast for accessibility
  if (uiState.buttonColor && theme.colors?.button?.textColor) {
    // You could add contrast checking logic here
  }
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
  className?: string;
}


export const phaseWorkflowTransition: WorkflowTransition = {
    id: 'phase-execution-transition',
    name: 'Execute Current Phase',
    description: 'Executes the current phase using PhaseManager',
    
    fromStepId: 'planning',
    toStepId: 'execution',
    allowedRoles: [],
    conditions: [
        {
            type: 'data_condition',
            property: 'workflowInstance.phases.current',
            operator: 'exists',
            value: true
        }
    ],
    
    phaseManagerConfig: {
        usePhaseManager: true,
        autoAdvance: true,
        autoCompleteMilestones: true,
        backupEnabled: true,
        rollbackOnError: true,
        maxRetries: 3,
        
        transitionRules: {
            requireAllDependencies: true,
            requireMilestoneCompletion: false,
            validatePhaseState: true,
            skipIfCompleted: true
        },
        
        notifications: {
            onPhaseStart: true,
            onPhaseComplete: true,
            onError: true,
            onRollback: true
        }
    },
    
    progressTracking: {
      enabled: true,
      trackPerformance: true,
      trackUIMetrics: true,
      successThreshold: 85,
      timeoutWarning: 10000,
      trackErrors: true

    },
    
    priority: 1,
    enabled: true,
    createdAt: new Date(),
    version: 1
};

// ex:
// Where you use TransitionAnimations, you might need to handle the optional duration:

// typescript
function getTransitionDuration(animations: TransitionAnimations, defaultDuration: number): number {
  // Use transition duration if provided, otherwise use inherited duration
  return animations.duration ?? defaultDuration;
}