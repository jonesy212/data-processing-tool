// ReminderTemplate.ts
import { v4 as uuidv4 } from 'uuid';
import { Reminder, ReminderTrigger, ReminderType, CustomAction } from './ReminderTypes';
import type { 
  BaseEntityProperties, 
  SharedTimestamps, 
  SharedStatusFlags 
} from '@/core/types/RelatedProps';

// Template types
export type TemplateCategory = 
  | 'meeting' 
  | 'task' 
  | 'deadline' 
  | 'birthday' 
  | 'anniversary' 
  | 'payment' 
  | 'followup' 
  | 'health' 
  | 'crypto'
  | 'custom';

export interface ReminderTemplate extends BaseEntityProperties, SharedTimestamps, SharedStatusFlags {
  id: string;
  name: string;
  description?: string;
  category: TemplateCategory;
  trigger: ReminderTrigger;
  method: 'email' | 'push' | 'sms' | 'in-app' | 'desktop';
  reminderType: ReminderType;
  
  // Template-specific fields
  defaultMessage: string;
  variables?: string[]; // e.g., ['{eventName}', '{time}', '{location}']
  defaultMinutes?: number;
  defaultCustomActions?: CustomAction[];
  defaultPriority?: 'low' | 'medium' | 'high' | 'critical';
  
  // Usage tracking
  usageCount: number;
  lastUsed?: Date;
  isSystemDefault: boolean;
  tags: string[];
  
  // Recurrence defaults
  defaultRecurrence?: {
    pattern: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval?: number;
    endDate?: Date;
  };
}

// Template library
export class ReminderTemplateLibrary {
  private templates: Map<string, ReminderTemplate> = new Map();
  
  constructor() {
    this.initializeDefaultTemplates();
  }
  
  private initializeDefaultTemplates(): void {
    const defaultTemplates: ReminderTemplate[] = [
      // Meeting templates
      this.createMeetingTemplate(),
      this.createTaskDeadlineTemplate(),
      this.createBirthdayTemplate(),
      this.createPaymentReminderTemplate(),
      this.createFollowUpTemplate(),
      this.createHealthCheckupTemplate(),
      this.createCryptoAlertTemplate(),
    ];
    
    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }
  
  // Factory methods for each template type
  
  private createMeetingTemplate(): ReminderTemplate {
    return {
      id: uuidv4(),
      name: 'Meeting Reminder',
      description: 'Reminder for upcoming meetings',
      category: 'meeting',
      trigger: 'time-based',
      method: 'in-app',
      reminderType: 'notification',
      defaultMessage: 'Meeting "{eventName}" starts in {minutes} minutes at {location}',
      variables: ['{eventName}', '{minutes}', '{location}', '{participants}'],
      defaultMinutes: 15,
      defaultPriority: 'medium',
      usageCount: 0,
      isSystemDefault: true,
      tags: ['professional', 'calendar', 'appointment'],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      isFeatured: true,
      title: 'Meeting Reminder Template'
    };
  }
  
  private createTaskDeadlineTemplate(): ReminderTemplate {
    return {
      id: uuidv4(),
      name: 'Task Deadline',
      description: 'Reminder for task deadlines',
      category: 'task',
      trigger: 'time-based',
      method: 'push',
      reminderType: 'alarm',
      defaultMessage: 'Task "{taskName}" is due in {hours} hours',
      variables: ['{taskName}', '{hours}', '{project}'],
      defaultMinutes: 60, // 1 hour before
      defaultPriority: 'high',
      usageCount: 0,
      isSystemDefault: true,
      tags: ['work', 'productivity', 'deadline'],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      title: 'Task Deadline Template'
    };
  }
  
  private createBirthdayTemplate(): ReminderTemplate {
    return {
      id: uuidv4(),
      name: 'Birthday Reminder',
      description: 'Birthday reminder with annual recurrence',
      category: 'birthday',
      trigger: 'time-based',
      method: 'email',
      reminderType: 'notification',
      defaultMessage: "It's {personName}'s birthday tomorrow! 🎂",
      variables: ['{personName}', '{age}'],
      defaultMinutes: 1440, // 24 hours before
      defaultRecurrence: {
        pattern: 'yearly',
        interval: 1
      },
      defaultPriority: 'low',
      usageCount: 0,
      isSystemDefault: true,
      tags: ['personal', 'celebration', 'recurring'],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      title: 'Birthday Reminder Template'
    };
  }
  
  private createPaymentReminderTemplate(): ReminderTemplate {
    return {
      id: uuidv4(),
      name: 'Payment Due',
      description: 'Reminder for bill payments',
      category: 'payment',
      trigger: 'time-based',
      method: 'sms',
      reminderType: 'alarm',
      defaultMessage: 'Payment of {amount} for {billName} is due in {days} days',
      variables: ['{amount}', '{billName}', '{days}', '{dueDate}'],
      defaultMinutes: 2880, // 2 days before
      defaultPriority: 'critical',
      usageCount: 0,
      isSystemDefault: true,
      tags: ['financial', 'bills', 'important'],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      title: 'Payment Reminder Template'
    };
  }
  
  private createFollowUpTemplate(): ReminderTemplate {
    return {
      id: uuidv4(),
      name: 'Follow-up',
      description: 'Follow-up reminder after meetings or conversations',
      category: 'followup',
      trigger: 'event-based',
      method: 'email',
      reminderType: 'notification',
      defaultMessage: 'Follow up with {contactName} about {topic}',
      variables: ['{contactName}', '{topic}', '{meetingDate}'],
      defaultMinutes: 1440, // 24 hours after event
      defaultPriority: 'medium',
      usageCount: 0,
      isSystemDefault: true,
      tags: ['professional', 'networking', 'business'],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      title: 'Follow-up Reminder Template'
    };
  }
  
  private createHealthCheckupTemplate(): ReminderTemplate {
    return {
      id: uuidv4(),
      name: 'Health Checkup',
      description: 'Health-related reminders',
      category: 'health',
      trigger: 'time-based',
      method: 'push',
      reminderType: 'notification',
      defaultMessage: 'Time for your {checkupType} checkup',
      variables: ['{checkupType}', '{doctor}', '{location}'],
      defaultMinutes: 10080, // 7 days before
      defaultRecurrence: {
        pattern: 'monthly',
        interval: 3 // Every 3 months
      },
      defaultPriority: 'high',
      usageCount: 0,
      isSystemDefault: true,
      tags: ['health', 'wellness', 'medical'],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      title: 'Health Checkup Template'
    };
  }
  
  private createCryptoAlertTemplate(): ReminderTemplate {
    return {
      id: uuidv4(),
      name: 'Crypto Price Alert',
      description: 'Cryptocurrency price movement alerts',
      category: 'crypto',
      trigger: 'condition-based',
      method: 'in-app',
      reminderType: 'alarm',
      defaultMessage: '{crypto} price has {direction} by {percentage}% to ${price}',
      variables: ['{crypto}', '{direction}', '{percentage}', '{price}', '{threshold}'],
      defaultPriority: 'medium',
      usageCount: 0,
      isSystemDefault: true,
      tags: ['crypto', 'trading', 'alerts', 'finance'],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      title: 'Crypto Price Alert Template'
    };
  }
  
  // Public methods
  
  getAllTemplates(): ReminderTemplate[] {
    return Array.from(this.templates.values());
  }
  
  getTemplate(id: string): ReminderTemplate | undefined {
    return this.templates.get(id);
  }
  
  getTemplatesByCategory(category: TemplateCategory): ReminderTemplate[] {
    return this.getAllTemplates().filter(t => t.category === category);
  }
  
  createReminderFromTemplate(
    templateId: string, 
    variables: Record<string, string>,
    customizations?: Partial<Reminder>
  ): Reminder {
    const template = this.getTemplate(templateId);
    
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }
    
    // Apply template to create reminder
    const reminder: Reminder = {
      id: uuidv4(),
      trigger: template.trigger,
      method: template.method,
      reminderType: template.reminderType,
      customMessage: this.replaceVariables(template.defaultMessage, variables),
      isActive: true,
      sent: false,
      minutes: customizations?.minutes ?? template.defaultMinutes,
      customActions: customizations?.customActions ?? template.defaultCustomActions,
      ...customizations
    };
    
    // Apply template fields to reminder
    if (template.defaultPriority) {
      reminder.priority = template.defaultPriority;
    }
    
    if (template.defaultRecurrence) {
      reminder.recurrence = {
        ...template.defaultRecurrence,
        ...customizations?.recurrence
      };
    }
    
    // Apply shared properties
    reminder.title = variables.eventName || variables.taskName || template.name;
    reminder.category = template.category;
    reminder.tags = [...template.tags];
    
    // Increment usage count
    template.usageCount++;
    template.lastUsed = new Date();
    
    return reminder;
  }
  
  createCustomTemplate(
    name: string,
    category: TemplateCategory,
    config: Omit<Partial<ReminderTemplate>, 'id' | 'name' | 'category'>
  ): ReminderTemplate {
    const template: ReminderTemplate = {
      id: uuidv4(),
      name,
      category,
      trigger: 'time-based',
      method: 'in-app',
      reminderType: 'notification',
      defaultMessage: '',
      usageCount: 0,
      isSystemDefault: false,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      ...config
    };
    
    this.templates.set(template.id, template);
    return template;
  }
  
  updateTemplate(id: string, updates: Partial<ReminderTemplate>): ReminderTemplate | undefined {
    const template = this.getTemplate(id);
    
    if (template) {
      const updated = {
        ...template,
        ...updates,
        updatedAt: new Date()
      };
      
      this.templates.set(id, updated);
      return updated;
    }
    
    return undefined;
  }
  
  deleteTemplate(id: string): boolean {
    const template = this.getTemplate(id);
    
    if (template && !template.isSystemDefault) {
      return this.templates.delete(id);
    }
    
    return false;
  }
  
  searchTemplates(query: string): ReminderTemplate[] {
    const lowercaseQuery = query.toLowerCase();
    
    return this.getAllTemplates().filter(template => 
      template.name.toLowerCase().includes(lowercaseQuery) ||
      template.description?.toLowerCase().includes(lowercaseQuery) ||
      template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }
  
  getPopularTemplates(limit: number = 5): ReminderTemplate[] {
    return this.getAllTemplates()
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }
  
  // Utility method
  private replaceVariables(message: string, variables: Record<string, string>): string {
    let result = message;
    
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{${key}}`;
      result = result.replace(new RegExp(placeholder, 'g'), value);
    }
    
    return result;
  }
  
  // Export/Import functionality
  exportTemplate(id: string): string {
    const template = this.getTemplate(id);
    
    if (!template) {
      throw new Error(`Template not found: ${id}`);
    }
    
    return JSON.stringify(template, null, 2);
  }
  
  importTemplate(json: string): ReminderTemplate {
    const template = JSON.parse(json) as ReminderTemplate;
    
    // Generate new ID for imported template
    template.id = uuidv4();
    template.isSystemDefault = false;
    template.usageCount = 0;
    template.createdAt = new Date();
    template.updatedAt = new Date();
    
    this.templates.set(template.id, template);
    return template;
  }
}

// Singleton instance
export const reminderTemplateLibrary = new ReminderTemplateLibrary();

// Utility functions
export function createQuickReminder(
  title: string,
  minutes: number = 30,
  method: Reminder['method'] = 'in-app'
): Reminder {
  return {
    id: uuidv4(),
    trigger: 'time-based',
    method,
    reminderType: 'notification',
    customMessage: `Reminder: ${title}`,
    isActive: true,
    sent: false,
    minutes,
    title,
    createdAt: new Date(),
    isActive: true,
    priority: 'medium'
  };
}

export function validateReminderTemplate(template: Partial<ReminderTemplate>): string[] {
  const errors: string[] = [];
  
  if (!template.name?.trim()) {
    errors.push('Template name is required');
  }
  
  if (!template.defaultMessage?.trim()) {
    errors.push('Default message is required');
  }
  
  if (!template.trigger) {
    errors.push('Trigger type is required');
  }
  
  if (!template.method) {
    errors.push('Method is required');
  }
  
  if (!template.reminderType) {
    errors.push('Reminder type is required');
  }
  
  return errors;
}