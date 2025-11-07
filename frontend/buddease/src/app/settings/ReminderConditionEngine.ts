

interface ReminderCondition {
  id: string;
  name?: string;
  description?: string;

  // Type of condition logic
  conditionType:
    | 'time_based'
    | 'event_property'
    | 'user_property'
    | 'custom_expression'
    | 'location_based'
    | 'priority_based'
    | 'status_check';

  // Core condition logic
  field?: string; // e.g., 'event.startTime', 'user.role', 'priority'
  operator?:
    | 'equals'
    | 'not_equals'
    | 'greater_than'
    | 'less_than'
    | 'includes'
    | 'excludes'
    | 'exists'
    | 'not_exists'
    | 'matches';
  value?: any;

  // Optional advanced logic
  expression?: string; // e.g., "event.priority === 'high' && user.isActive"

  // Time and recurrence filters
  validDuring?: {
    start?: string | Date;
    end?: string | Date;
    recurrence?: string; // iCal-style recurrence rule
  };

  // Nested subconditions
  subConditions?: ReminderCondition[];
  logicOperator?: 'AND' | 'OR'; // How to combine subconditions

  // Contextual conditions
  appliesTo?: {
    eventType?: string;
    userRole?: string;
    location?: string;
    priorityLevel?: 'low' | 'medium' | 'high';
  };

  active: boolean;
}


class ReminderConditionEngine {
  // Evaluate a single condition
  evaluateCondition(condition: ReminderCondition, context: any): boolean {
    if (!condition.active) return false;

    // Time-based conditions
    if (condition.conditionType === 'time_based') {
      return this.evaluateTimeCondition(condition, context);
    }

    // Property-based conditions
    if (condition.conditionType === 'event_property' || 
        condition.conditionType === 'user_property') {
      return this.evaluatePropertyCondition(condition, context);
    }

    // Custom expression conditions
    if (condition.conditionType === 'custom_expression') {
      return this.evaluateCustomExpression(condition, context);
    }

    // Location-based conditions
    if (condition.conditionType === 'location_based') {
      return this.evaluateLocationCondition(condition, context);
    }

    // Priority-based conditions
    if (condition.conditionType === 'priority_based') {
      return this.evaluatePriorityCondition(condition, context);
    }

    // Status check conditions
    if (condition.conditionType === 'status_check') {
      return this.evaluateStatusCondition(condition, context);
    }

    return false;
  }

  // Evaluate nested conditions with logic operators
  evaluateConditionGroup(conditions: ReminderCondition[], context: any): boolean {
    if (conditions.length === 0) return true;

    const operator = conditions[0].logicOperator || 'AND';
    
    if (operator === 'AND') {
      return conditions.every(condition => this.evaluateCondition(condition, context));
    } else { // OR
      return conditions.some(condition => this.evaluateCondition(condition, context));
    }
  }

  private evaluateTimeCondition(condition: ReminderCondition, context: any): boolean {
    const now = new Date();
    
    // Check valid during timeframe
    if (condition.validDuring) {
      const start = condition.validDuring.start ? new Date(condition.validDuring.start) : null;
      const end = condition.validDuring.end ? new Date(condition.validDuring.end) : null;
      
      if (start && now < start) return false;
      if (end && now > end) return false;
    }

    // Check recurrence rules (simplified)
    if (condition.validDuring?.recurrence) {
      return this.evaluateRecurrenceRule(condition.validDuring.recurrence, now);
    }

    return true;
  }

  private evaluatePropertyCondition(condition: ReminderCondition, context: any): boolean {
    if (!condition.field || condition.operator === undefined) return false;

    const fieldValue = this.getNestedProperty(context, condition.field);
    const conditionValue = condition.value;

    switch (condition.operator) {
      case 'equals':
        return fieldValue === conditionValue;
      case 'not_equals':
        return fieldValue !== conditionValue;
      case 'greater_than':
        return fieldValue > conditionValue;
      case 'less_than':
        return fieldValue < conditionValue;
      case 'includes':
        return Array.isArray(fieldValue) && fieldValue.includes(conditionValue);
      case 'excludes':
        return Array.isArray(fieldValue) && !fieldValue.includes(conditionValue);
      case 'exists':
        return fieldValue !== undefined && fieldValue !== null;
      case 'not_exists':
        return fieldValue === undefined || fieldValue === null;
      case 'matches':
        return new RegExp(conditionValue).test(fieldValue);
      default:
        return false;
    }
  }

  private evaluateCustomExpression(condition: ReminderCondition, context: any): boolean {
    if (!condition.expression) return false;
    
    try {
      // Create a safe evaluation context
      const evalContext = {
        ...context,
        now: new Date(),
        user: context.user,
        event: context.event
      };

      // Simple expression evaluation (in real app, use a proper expression evaluator)
      const result = this.safeExpressionEval(condition.expression, evalContext);
      return Boolean(result);
    } catch (error) {
      console.error('Error evaluating custom expression:', error);
      return false;
    }
  }

  private evaluateLocationCondition(condition: ReminderCondition, context: any): boolean {
    // Check if user is in specific location
    const userLocation = context.user?.location;
    const targetLocation = condition.value;

    if (!userLocation || !targetLocation) return false;

    // Simple distance calculation (in real app, use geolocation APIs)
    return this.calculateDistance(userLocation, targetLocation) < 1000; // Within 1km
  }

private evaluatePriorityCondition(condition: ReminderCondition, context: any): boolean {
  const eventPriority = context.event?.priority;
  const targetPriority = condition.value;

  const priorityWeights = { 
    low: 1, 
    medium: 2, 
    high: 3, 
    critical: 4 
  };

  // Type guard to ensure valid priority values
  const isValidPriority = (priority: any): priority is keyof typeof priorityWeights => {
    return priority in priorityWeights;
  };

  if (!eventPriority || !targetPriority || 
      !isValidPriority(eventPriority) || 
      !isValidPriority(targetPriority)) {
    return false;
  }

  switch (condition.operator) {
    case 'equals':
      return eventPriority === targetPriority;
    case 'greater_than':
      return priorityWeights[eventPriority] > priorityWeights[targetPriority];
    case 'less_than':
      return priorityWeights[eventPriority] < priorityWeights[targetPriority];
    default:
      return false;
  }
} 

  private evaluateStatusCondition(condition: ReminderCondition, context: any): boolean {
    const currentStatus = context.event?.status;
    const targetStatus = condition.value;

    if (!currentStatus || !targetStatus) return false;

    switch (condition.operator) {
      case 'equals':
        return currentStatus === targetStatus;
      case 'not_equals':
        return currentStatus !== targetStatus;
      default:
        return false;
    }
  }

  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private safeExpressionEval(expression: string, context: any): any {
    // In production, use a proper expression evaluator library
    // This is a simplified version for demonstration
    const sandbox = {
      ...context,
      Math: Math,
      Date: Date,
      JSON: JSON
    };

    try {
      // Very basic expression evaluation - replace with proper library
      const fn = new Function(...Object.keys(sandbox), `return ${expression}`);
      return fn(...Object.values(sandbox));
    } catch (error) {
      throw new Error(`Expression evaluation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private calculateDistance(loc1: any, loc2: any): number {
    // Simplified distance calculation
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(loc2.lat - loc1.lat);
    const dLon = this.deg2rad(loc2.lon - loc1.lon);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(loc1.lat)) * Math.cos(this.deg2rad(loc2.lat)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c * 1000; // Distance in meters
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  private evaluateRecurrenceRule(rule: string, date: Date): boolean {
    // Simplified recurrence evaluation
    // In production, use a proper recurrence library like rrule
    return true; // Placeholder
  }
}

export default ReminderConditionEngine
export type { ReminderCondition }