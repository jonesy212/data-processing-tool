// WorkflowTransition.ts
import { WorkflowStep } from '@/app/typings/entities/DocumentEntity';
import { ThemeSettings } from '@/app/branding/ThemeSettings';
import { DocumentAnimationOptions } from '@/app/documents/SharedDocumentProps';
import { ValidationResult } from '@/app/components/database/SchemaEvolutionManager'
import StorageService from '@/utils/storage/StoragService'

// Create a storage service instance
export const storageService = new StorageService();

export interface WorkflowTransition {
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
  createdBy?: string;
  createdAt: Date;
  updatedAt?: Date;
  version: number;
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
}

export interface TransitionAction {
  type: 'update_data' | 'send_notification' | 'call_webhook' | 'execute_script' | 'create_task' | 'log_audit' | 'ui_action' | 'theme_update';
  target?: string;
  payload?: any;
  delay?: number; // Delay in milliseconds before executing
  retryPolicy?: RetryPolicy;
  
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
}

// Enhanced context that includes UI/theme information
export interface TransitionEvaluationContext {
  workflowInstance: {
    id: string;
    currentStep: WorkflowStep;
    data: Record<string, any>;
    startedAt: Date;
    createdBy: string;
    uiState?: Record<string, any>; // Current UI state
  };
  user: {
    id: string;
    roles: string[];
    permissions: string[];
    themePreferences?: ThemeSettings; // User's theme preferences
  };
  uiContext: {
    currentTheme: ThemeSettings;
    colorPalette: string[]; // From your Palette component
    activeHighlights: Highlight[]; // From your Highlight interface
    animationsEnabled: boolean;
    deviceType: 'desktop' | 'tablet' | 'mobile';
    screenSize: { width: number; height: number };
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

// Enhanced utility function with UI awareness
// Make this function async and return Promise
export async function canTriggerTransition(
  transition: WorkflowTransition,
  context: TransitionEvaluationContext
): Promise<{ canTrigger: boolean; reasons: string[]; uiState: TransitionUIState }> {
  const reasons: string[] = [];
  const errors: ValidationResult[] = [];

  const uiState: TransitionUIState = {
    buttonEnabled: true,
    buttonColor: transition.uiConfig?.colors?.button,
    buttonText: transition.uiConfig?.buttonLabel || transition.name,
    tooltip: '',
    visualFeedback: transition.uiConfig?.visualFeedback,
  };
  
  // Check user permissions
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
  
  // Check if transition is enabled
  if (!transition.enabled) {
    reasons.push('Transition is disabled');
    uiState.buttonEnabled = false;
    uiState.buttonColor = context.uiContext.currentTheme.colors?.button.colorDisabled;
  }
  
  // Check schedule
  if (transition.schedule) {
    const scheduleCheck = isTransitionAvailable(transition.schedule, context);
    if (!scheduleCheck.available) {
      reasons.push(scheduleCheck.reason || 'Transition is not available at this time');
      if (!scheduleCheck.allowWithUiWarning) {
        uiState.buttonEnabled = false;
      }
    }
  }
  
  // Check conditions - ADD AWAIT HERE
  const conditionsResult = await evaluateTransitionConditions(transition.conditions, context);
  if (!conditionsResult.met) {
    reasons.push('Transition conditions not met');
    uiState.buttonEnabled = false;
    if (conditionsResult.uiHint) {
      uiState.tooltip = conditionsResult.uiHint;
    }
  }
  
  // Check validations
  const validationErrors = runTransitionValidations(transition.validations || [], context);
  if (validationErrors.length > 0) {
    reasons.push(...validationErrors.map(v => v.message));
    uiState.buttonEnabled = false;
    if (validationErrors.some(v => v.severity === 'error')) {
      uiState.buttonColor = context.uiContext.currentTheme.colors?.error;
    }
  }
  
  // Update UI state based on current theme
  updateUIStateForTheme(uiState, context.uiContext.currentTheme);
  
  return {
    canTrigger: reasons.length === 0,
    reasons,
    uiState
  };
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

// Utility to create a transition button component
export async function createTransitionButton(
  transition: WorkflowTransition,
  context: TransitionEvaluationContext,
  onClick: () => void
): Promise<TransitionButtonProps> {
  const { canTrigger, reasons, uiState } = await canTriggerTransition(transition, context);
  
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
  className?: string;
}



// ex:
// Where you use TransitionAnimations, you might need to handle the optional duration:

// typescript
// function getTransitionDuration(animations: TransitionAnimations, defaultDuration: number): number {
//   // Use transition duration if provided, otherwise use inherited duration
//   return animations.duration ?? defaultDuration;
// }