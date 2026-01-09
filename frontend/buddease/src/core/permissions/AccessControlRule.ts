AccessControlRule.ts
import { AccessControlEntry } from '@/core/permissions/AccessControlEntry';

// Since AccessControlEntry is for specific user/group permissions,
// AccessControlRule is for defining rules that can be applied dynamically
export interface AccessControlRule {
  id: string;
  name: string;
  description?: string;
  
  // 🔒 Target specification
  targetType: 'entity' | 'property' | 'action' | 'api_endpoint';
  targetPath: string; // e.g., "User.email", "Project.create", "/api/users"
  
  // 📋 Conditions for when this rule applies
  conditions: AccessControlCondition[];
  
  // 👥 Who this rule applies to
  appliesTo: AccessControlEntry[];
  
  // ⚙️ Rule behavior
  priority: number; // Higher = more important
  effect: 'allow' | 'deny' | 'filter';
  
  // 📊 When the rule is active
  enabled: boolean;
  schedule?: RuleSchedule;
  
  // 🏷️ Additional metadata
  tags?: string[];
  createdBy?: string;
  createdAt: Date;
  updatedAt?: Date;
  version: number;
}

// Supporting types for AccessControlRule
export interface AccessControlCondition {
  type: 'user_property' | 'entity_state' | 'time_based' | 'custom_logic';
  property?: string; // Which property to check
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  logicalOperator?: 'and' | 'or'; // For combining multiple conditions
}

export interface RuleSchedule {
  startTime?: Date;
  endTime?: Date;
  daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
  timezone?: string;
  recurrence?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
}

// Utility function to check if an AccessControlEntry matches a rule
export function entryMatchesRule(
  entry: AccessControlEntry,
  rule: AccessControlRule,
  context: RuleEvaluationContext
): boolean {
  // Check if the entry's user/group is covered by the rule
  const isCovered = rule.appliesTo.some(ruleEntry => 
    (entry.userId && ruleEntry.userId === entry.userId) ||
    (entry.groupId && ruleEntry.groupId === entry.groupId)
  );
  
  if (!isCovered) return false;
  
  // Check all conditions
  return evaluateConditions(rule.conditions, context);
}

// Context for rule evaluation
export interface RuleEvaluationContext {
  user: {
    id: string;
    roles: string[];
    properties: Record<string, any>;
  };
  entity: {
    type: string;
    id?: string;
    state: Record<string, any>;
  };
  action: string;
  timestamp: Date;
  environment: Record<string, any>;
}

function evaluateConditions(
  conditions: AccessControlCondition[],
  context: RuleEvaluationContext
): boolean {
  if (conditions.length === 0) return true;
  
  let result = true;
  let lastLogicalOperator: 'and' | 'or' = 'and';
  
  for (const condition of conditions) {
    const conditionResult = evaluateCondition(condition, context);
    
    if (lastLogicalOperator === 'and') {
      result = result && conditionResult;
    } else {
      result = result || conditionResult;
    }
    
    lastLogicalOperator = condition.logicalOperator || 'and';
  }
  
  return result;
}

function evaluateCondition(
  condition: AccessControlCondition,
  context: RuleEvaluationContext
): boolean {
  switch (condition.type) {
    case 'user_property':
      return evaluateUserPropertyCondition(condition, context);
    case 'entity_state':
      return evaluateEntityStateCondition(condition, context);
    case 'time_based':
      return evaluateTimeBasedCondition(condition, context);
    case 'custom_logic':
      // Custom logic would need to be implemented per use case
      return true;
    default:
      return false;
  }
}

function evaluateUserPropertyCondition(
  condition: AccessControlCondition,
  context: RuleEvaluationContext
): boolean {
  if (!condition.property) return false;
  
  const value = context.user.properties[condition.property];
  return compareValues(value, condition.operator, condition.value);
}

function evaluateEntityStateCondition(
  condition: AccessControlCondition,
  context: RuleEvaluationContext
): boolean {
  if (!condition.property) return false;
  
  const value = context.entity.state[condition.property];
  return compareValues(value, condition.operator, condition.value);
}

function evaluateTimeBasedCondition(
  condition: AccessControlCondition,
  context: RuleEvaluationContext
): boolean {
  const now = context.timestamp;
  
  switch (condition.operator) {
    case 'greater_than':
      return now > new Date(condition.value);
    case 'less_than':
      return now < new Date(condition.value);
    case 'equals':
      return now.toDateString() === new Date(condition.value).toDateString();
    default:
      return false;
  }
}

function compareValues(actual: any, operator: string, expected: any): boolean {
  switch (operator) {
    case 'equals':
      return actual === expected;
    case 'not_equals':
      return actual !== expected;
    case 'contains':
      return String(actual).includes(String(expected));
    case 'greater_than':
      return actual > expected;
    case 'less_than':
      return actual < expected;
    case 'in':
      return Array.isArray(expected) && expected.includes(actual);
    case 'not_in':
      return Array.isArray(expected) && !expected.includes(actual);
    default:
      return false;
  }
}