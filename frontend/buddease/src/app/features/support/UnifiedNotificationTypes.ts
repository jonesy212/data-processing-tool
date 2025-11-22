// UnifiedNotificationTypes.ts
import { NOTIFICATION_TYPES } from '@/app/features/support/NotificationTypes';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { LogData } from '@/app/models/LogData';
import { NotificationChannels } from '@/app/notifications/NotificationChannels';
import { NotificationPosition } from '@/app/models/data/StatusType';

// Export all types from a single source
// Centralized type definitions
export const NotificationTypeEnum = NOTIFICATION_TYPES;
export type NotificationType = keyof typeof NOTIFICATION_TYPES 
  | DocumentTypeEnum 
  | PriorityTypeEnum 
  | "RandomDismiss";

export type MainNotificationType = NotificationType;

export interface UnifiedNotificationOptions<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T
> {
  // Core properties
  id?: string;
  message?: string;
  data?: any;
  timestamp?: Date;
  type?: NotificationType;
  
  // Enhanced properties
  dataId?: string;
  error?: string;
  duration?: number;
  position?: NotificationPosition;
  onClose?: () => void;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  channels?: NotificationChannels;
  user?: string;
  metadata?: Record<string, any>;
  component?: string;
  level?: 'info' | 'success' | 'warning' | 'error';
  sendStatus?: 'pending' | 'sent' | 'delivered' | 'failed';
  topics?: string[];
  
  // Legacy properties for backward compatibility
  completionMessageLog?: LogData<any, any, any, any, any, any>;
  content?: any;
  date?: Date;
}
