// CustomAction.ts
import { ReminderCondition, condition } from '@/core/settings/ReminderCondition';

interface CustomAction {
  id: string;
  name: string;
  description?: string;
  
  // The type of action to perform
  actionType: 'api_call' | 'open_url' | 'run_script' | 'send_message' | 'update_status' | 'log_entry';
  
  // When this action should trigger
  triggerEvent: 'on_send' | 'on_dismiss' | 'on_complete' | 'on_expire' | 'manual';
  
  // Configuration for dynamic execution
  config?: {
    endpoint?: string; // For API calls
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: Record<string, any>;
    url?: string; // For open_url
    script?: string; // For custom script execution
    targetUserId?: string;
    messageTemplate?: string;
  };

  // Optional conditions for executing this action
  conditions?: ReminderCondition[];

  // Whether this action can be retried automatically if it fails
  retryPolicy?: {
    maxRetries: number;
    retryIntervalSeconds: number;
  };

  enabled: boolean;
}


// Example 2: Custom action execution  
const action: CustomAction = {
  id: "act-001",
  name: "Escalate to Manager",
  actionType: "send_message",
  triggerEvent: "on_expire",
  config: {
    targetUserId: "manager-123",
    messageTemplate: "Task {event.title} is overdue and requires attention"
  },
  conditions: [condition],
  retryPolicy: {
    maxRetries: 3,
    retryIntervalSeconds: 60
  },
  enabled: true
};

export type { CustomAction };
