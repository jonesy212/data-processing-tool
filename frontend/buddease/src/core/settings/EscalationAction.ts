// EscalationAction.ts
export interface EscalationAction {
  id: string;
  type:
    | "notifyUser"
    | "notifyGroup"
    | "createTask"
    | "increasePriority"
    | "invokeWebhook"
    | "custom";
  targetId?: string; // user, group, or system ID
  messageTemplate?: string;
  delayMinutes?: number; // optional delay before performing action
  level?: number; // escalation level this applies to
  retryCount?: number;
  webhookUrl?: string;
  customActionHandler?: string; // optional handler for custom logic
  enabled?: boolean;
}
