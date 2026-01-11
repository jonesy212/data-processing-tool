import { ReminderTypes, createReminderTypeFromEnum } from '@/core/typings/ReminderTypes';
import type { Reminder } from './Reminder';

// Example 1: Simple usage with enum
const standardReminder: Reminder = {
  id: "rem-001",
  trigger: { type: "time_before_event", minutesBefore: 30 },
  method: "push",
  reminderType: createReminderTypeFromEnum(ReminderTypes.STANDARD),
  isActive: true,
  sent: false,
  title: "Team Meeting",
  description: "Weekly team sync meeting"
};

// Example 2: Urgent reminder
const urgentReminder: Reminder = {
  id: "rem-002",
  trigger: { type: "absolute", dateTime: new Date() },
  method: "sms",
  reminderType: createReminderTypeFromEnum(ReminderTypes.URGENT, "urgent_payment"),
  isActive: true,
  sent: false,
  customMessage: "URGENT: Payment due today!",
  priority: "critical"
};

// Example 3: Follow-up reminder with custom timing
const followUpReminder: Reminder = {
  id: "rem-003",
  trigger: { type: "relative", minutesBefore: 1440 }, // 24 hours
  method: "email",
  reminderType: {
    ...createReminderTypeFromEnum(ReminderTypes.FOLLOW_UP),
    defaultSettings: {
      ...createReminderTypeFromEnum(ReminderTypes.FOLLOW_UP).defaultSettings,
      timing: 1440, // Override default timing
      template: "Follow-up required for: {eventName}"
    }
  },
  isActive: true,
  sent: false
};

// Example 4: Using in a function
function createReminderByType(type: ReminderTypes, config: Partial<Reminder>): Reminder {
  const baseReminder: Reminder = {
    id: `rem_${Date.now()}`,
    trigger: { type: "time_before_event", minutesBefore: getDefaultReminderTiming(type) },
    method: getDefaultReminderMethod(type),
    reminderType: createReminderTypeFromEnum(type),
    isActive: true,
    sent: false,
    createdDate: new Date(),
    acknowledged: false
  };
  
  return { ...baseReminder, ...config };
}

// Usage
const meetingReminder = createReminderByType(ReminderTypes.MEETING, {
  title: "Client Presentation",
  description: "Quarterly review with ABC Corp"
});

const taskReminder = createReminderByType(ReminderTypes.TASK, {
  title: "Submit Report",
  description: "Monthly performance report due",
  priority: "high"
});