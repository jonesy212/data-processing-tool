// ReminderCondition.ts
import type { CustomAction } from '@/core/settings/CustomAction';
import CustomActionEngine from '@/core/settings/CustomActionEngine';
import ReminderConditionEngine from '@/core/settings/ReminderConditionEngine';

export interface ReminderCondition {
  id: string;
  name?: string;
  description?: string;
  conditionType:
    | 'time_based'
    | 'event_property'
    | 'user_property'
    | 'custom_expression'
    | 'location_based'
    | 'priority_based'
    | 'status_check';
  field?: string;
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
  expression?: string;
  validDuring?: {
    start?: string | Date;
    end?: string | Date;
    recurrence?: string;
  };
  subConditions?: ReminderCondition[];
  logicOperator?: 'AND' | 'OR';
  appliesTo?: {
    eventType?: string;
    userRole?: string;
    location?: string;
    priorityLevel?: 'low' | 'medium' | 'high';
  };
  active: boolean;
}


export const condition: ReminderCondition = {
  id: "cond-001",
  conditionType: "event_property",
  field: "event.priority",
  operator: "equals",
  value: "high",
  active: true,
  subConditions: [
    {
      id: "cond-002", 
      conditionType: "time_based",
      validDuring: {
        start: "2024-01-15T09:00:00",
        end: "2024-01-15T17:00:00"
      },
      active: true
    }
  ],
  logicOperator: "AND"
};

// Context example
export const context = {
  event: {
    id: "event-123",
    title: "Project Deadline",
    priority: "high",
    status: "overdue"
  },
  user: {
    id: "user-456",
    location: { lat: 40.7128, lon: -74.0060 }
  }
};

// Async function to handle the execution
export async function evaluateAndExecute(
  conditionEngine: ReminderConditionEngine,
  actionEngine: CustomActionEngine,
  action: CustomAction
): Promise<boolean> {
  const shouldExecute = conditionEngine.evaluateCondition(condition, context);
  
  if (shouldExecute) {
    return await actionEngine.executeAction(action, context);
  }
  
  return false;
}

// Usage example in another file:
import { evaluateAndExecute, condition, context } from '@/core/settings/ReminderCondition';
const result = await evaluateAndExecute(conditionEngine, actionEngine, action);