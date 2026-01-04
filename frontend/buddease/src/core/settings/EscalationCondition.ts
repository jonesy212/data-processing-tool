EscalationCondition.ts
export interface EscalationCondition {
  id: string;
  type:
    | "timeSinceTrigger"
    | "priorityLevel"
    | "unacknowledged"
    | "unresolved"
    | "custom";
  threshold?: number; // e.g., minutes since trigger, priority level, etc.
  operator?: ">" | ">=" | "<" | "<=" | "==" | "!=";
  field?: string; // optional custom field name
  value?: string | number | boolean;
  description?: string;
}
