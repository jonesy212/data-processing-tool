// src/core/models/reminders/ReminderTypes.ts

import type { Reminder, ReminderType } from '@/core/settings/Reminder';
import type {  } from '@/core/typings/ReminderTypes'
/**
 * Enum for different types of reminders - integrates with existing ReminderType interface
 */
export enum ReminderTypes {
  /** Standard reminder - normal priority */
  STANDARD = 'STANDARD',
  
  /** Urgent reminder - high priority, needs immediate attention */
  URGENT = 'URGENT',
  
  /** Follow-up reminder - for following up on previous items */
  FOLLOW_UP = 'FOLLOW_UP',
  
  /** Meeting reminder - for upcoming meetings */
  MEETING = 'MEETING',
  
  /** Task reminder - for task deadlines */
  TASK = 'TASK',
  
  /** Payment reminder - for billing/payments */
  PAYMENT = 'PAYMENT',
  
  /** Appointment reminder - for scheduled appointments */
  APPOINTMENT = 'APPOINTMENT',
  
  /** Birthday reminder - for birthdays/anniversaries */
  BIRTHDAY = 'BIRTHDAY',
  
  /** Alert reminder - critical notifications */
  ALERT = 'ALERT',
  
  /** Notification reminder - informational */
  NOTIFICATION = 'NOTIFICATION',
  
  /** Action reminder - requires user action */
  ACTION = 'ACTION',
  
  /** Custom reminder - user-defined type */
  CUSTOM = 'CUSTOM'
}

/**
 * Maps ReminderTypes to your existing ReminderType categories
 */
export function getReminderTypeCategory(type: ReminderTypes): 'reminder' | 'alert' | 'follow-up' | 'notification' | 'action' {
  const categoryMap: Record<ReminderTypes, 'reminder' | 'alert' | 'follow-up' | 'notification' | 'action'> = {
    [ReminderTypes.STANDARD]: 'reminder',
    [ReminderTypes.URGENT]: 'alert',
    [ReminderTypes.FOLLOW_UP]: 'follow-up',
    [ReminderTypes.MEETING]: 'reminder',
    [ReminderTypes.TASK]: 'reminder',
    [ReminderTypes.PAYMENT]: 'alert',
    [ReminderTypes.APPOINTMENT]: 'reminder',
    [ReminderTypes.BIRTHDAY]: 'notification',
    [ReminderTypes.ALERT]: 'alert',
    [ReminderTypes.NOTIFICATION]: 'notification',
    [ReminderTypes.ACTION]: 'action',
    [ReminderTypes.CUSTOM]: 'reminder'
  };
  
  return categoryMap[type] || 'reminder';
}

/**
 * Maps ReminderTypes to severity levels from your existing interface
 */
export function getReminderTypeSeverity(type: ReminderTypes): 'info' | 'warning' | 'error' | 'critical' {
  const severityMap: Record<ReminderTypes, 'info' | 'warning' | 'error' | 'critical'> = {
    [ReminderTypes.STANDARD]: 'info',
    [ReminderTypes.URGENT]: 'critical',
    [ReminderTypes.FOLLOW_UP]: 'warning',
    [ReminderTypes.MEETING]: 'info',
    [ReminderTypes.TASK]: 'warning',
    [ReminderTypes.PAYMENT]: 'error',
    [ReminderTypes.APPOINTMENT]: 'info',
    [ReminderTypes.BIRTHDAY]: 'info',
    [ReminderTypes.ALERT]: 'critical',
    [ReminderTypes.NOTIFICATION]: 'info',
    [ReminderTypes.ACTION]: 'warning',
    [ReminderTypes.CUSTOM]: 'info'
  };
  
  return severityMap[type] || 'info';
}

/**
 * Creates a ReminderType object from ReminderTypes enum
 */
export function createReminderTypeFromEnum(type: ReminderTypes, customId?: string): ReminderType {
  const defaultTemplate = (method: string, timing: number) => 
    `${getReminderTypeDisplayName(type)} in ${timing} minutes via ${method}`;
  
  return {
    id: customId || `${type.toLowerCase()}_type`,
    category: getReminderTypeCategory(type),
    severity: getReminderTypeSeverity(type),
    defaultSettings: {
      method: getDefaultReminderMethod(type),
      timing: getDefaultReminderTiming(type),
      template: defaultTemplate(getDefaultReminderMethod(type), getDefaultReminderTiming(type))
    }
  };
}

/**
 * Get display name for a reminder type
 */
export function getReminderTypeDisplayName(type: ReminderTypes): string {
  const displayNames: Record<ReminderTypes, string> = {
    [ReminderTypes.STANDARD]: 'Standard Reminder',
    [ReminderTypes.URGENT]: 'Urgent Reminder',
    [ReminderTypes.FOLLOW_UP]: 'Follow-up Reminder',
    [ReminderTypes.MEETING]: 'Meeting Reminder',
    [ReminderTypes.TASK]: 'Task Reminder',
    [ReminderTypes.PAYMENT]: 'Payment Reminder',
    [ReminderTypes.APPOINTMENT]: 'Appointment Reminder',
    [ReminderTypes.BIRTHDAY]: 'Birthday Reminder',
    [ReminderTypes.ALERT]: 'Alert',
    [ReminderTypes.NOTIFICATION]: 'Notification',
    [ReminderTypes.ACTION]: 'Action Required',
    [ReminderTypes.CUSTOM]: 'Custom Reminder'
  };
  
  return displayNames[type] || type;
}

/**
 * Get default reminder method based on type
 */
export function getDefaultReminderMethod(type: ReminderTypes): 'email' | 'push' | 'sms' | 'in-app' {
  const methodMap: Record<ReminderTypes, 'email' | 'push' | 'sms' | 'in-app'> = {
    [ReminderTypes.URGENT]: 'push',
    [ReminderTypes.PAYMENT]: 'sms',
    [ReminderTypes.ALERT]: 'push',
    [ReminderTypes.FOLLOW_UP]: 'email',
    [ReminderTypes.MEETING]: 'in-app',
    [ReminderTypes.TASK]: 'in-app',
    [ReminderTypes.APPOINTMENT]: 'in-app',
    [ReminderTypes.BIRTHDAY]: 'email',
    [ReminderTypes.STANDARD]: 'email',
    [ReminderTypes.NOTIFICATION]: 'in-app',
    [ReminderTypes.ACTION]: 'push',
    [ReminderTypes.CUSTOM]: 'email'
  };
  
  return methodMap[type] || 'email';
}

/**
 * Get default timing (minutes before) based on type
 */
export function getDefaultReminderTiming(type: ReminderTypes): number {
  const timingMap: Record<ReminderTypes, number> = {
    [ReminderTypes.URGENT]: 5,      // 5 minutes before
    [ReminderTypes.PAYMENT]: 1440,   // 24 hours before
    [ReminderTypes.ALERT]: 0,        // Immediate
    [ReminderTypes.MEETING]: 15,     // 15 minutes before
    [ReminderTypes.APPOINTMENT]: 30, // 30 minutes before
    [ReminderTypes.TASK]: 60,        // 1 hour before
    [ReminderTypes.FOLLOW_UP]: 1440, // 24 hours before
    [ReminderTypes.BIRTHDAY]: 10080, // 7 days before
    [ReminderTypes.STANDARD]: 60,    // 1 hour before
    [ReminderTypes.NOTIFICATION]: 0, // Immediate
    [ReminderTypes.ACTION]: 30,      // 30 minutes before
    [ReminderTypes.CUSTOM]: 60       // 1 hour before
  };
  
  return timingMap[type] || 60;
}

/**
 * Get priority level for escalation rules
 */
export function getReminderTypePriority(type: ReminderTypes): number {
  const priorities: Record<ReminderTypes, number> = {
    [ReminderTypes.URGENT]: 1,
    [ReminderTypes.ALERT]: 1,
    [ReminderTypes.PAYMENT]: 2,
    [ReminderTypes.ACTION]: 2,
    [ReminderTypes.FOLLOW_UP]: 3,
    [ReminderTypes.MEETING]: 2,
    [ReminderTypes.TASK]: 2,
    [ReminderTypes.APPOINTMENT]: 2,
    [ReminderTypes.BIRTHDAY]: 3,
    [ReminderTypes.STANDARD]: 3,
    [ReminderTypes.NOTIFICATION]: 3,
    [ReminderTypes.CUSTOM]: 2
  };
  
  return priorities[type] || 2;
}



// Helper to migrate existing reminders to use ReminderTypes
export function migrateReminderToEnum(legacyReminder: Reminder): Reminder {
  // If reminderType is already using enum format
  if (legacyReminder.reminderType && typeof legacyReminder.reminderType === 'object') {
    const typeId = legacyReminder.reminderType.id?.toUpperCase();
    
    if (typeId && isReminderType(typeId as ReminderTypes)) {
      // Already using enum format
      return legacyReminder;
    }
  }
  
  // Convert string type to enum
  let reminderTypeEnum = ReminderTypes.CUSTOM;
  if (typeof legacyReminder.reminderType === 'string') {
    reminderTypeEnum = toReminderType(legacyReminder.reminderType);
  }
  
  return {
    ...legacyReminder,
    reminderType: createReminderTypeFromEnum(reminderTypeEnum, legacyReminder.id)
  };
}

// Filter reminders by type
export function filterRemindersByType(
  reminders: Reminder[],
  type: ReminderTypes
): Reminder[] {
  return reminders.filter(reminder => {
    if (typeof reminder.reminderType === 'string') {
      return toReminderType(reminder.reminderType) === type;
    }
    return reminder.reminderType.id.toUpperCase() === type;
  });
}


/**
 * Check if reminder type requires acknowledgment
 */
export function requiresAcknowledgment(type: ReminderTypes): boolean {
  const requiresAck: ReminderTypes[] = [
    ReminderTypes.URGENT,
    ReminderTypes.ALERT,
    ReminderTypes.PAYMENT,
    ReminderTypes.ACTION
  ];
  
  return requiresAck.includes(type);
}

/**
 * Check if reminder type allows snooze
 */
export function allowsSnooze(type: ReminderTypes): boolean {
  const noSnooze: ReminderTypes[] = [
    ReminderTypes.URGENT,
    ReminderTypes.ALERT,
    ReminderTypes.PAYMENT
  ];
  
  return !noSnooze.includes(type);
}

/**
 * Type guard to check if a value is a valid ReminderTypes
 */
export function isReminderType(value: any): value is ReminderTypes {
  return Object.values(ReminderTypes).includes(value);
}

/**
 * Convert string to ReminderTypes (for API responses, etc.)
 */
export function toReminderType(value: string): ReminderTypes {
  const upperValue = value.toUpperCase();
  if (isReminderType(upperValue as ReminderTypes)) {
    return upperValue as ReminderTypes;
  }
  return ReminderTypes.CUSTOM;
}