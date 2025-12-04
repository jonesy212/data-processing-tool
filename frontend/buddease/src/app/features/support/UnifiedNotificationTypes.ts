// UnifiedNotificationTypes.ts
import { NOTIFICATION_TYPES } from '@/app/features/support/NotificationTypes';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { LogData } from '@/app/models/LogData';
import { NotificationChannels } from '@/app/notifications/NotificationChannels';
import { DocumentTypeEnum } from "@/app/typings/documentTypes";
import {
  ActivityActionEnum, ActivityTypeEnum, BookmarkStatus,
  BorderStyle, CalendarStatus, CalendarViewType,
  ChatType, CollaborationOptionType, ComponentStatus,
  DataStatus, DocumentPhaseEnum, DocumentSize,
  IncludeType, Layout, MeetingStatus,
  NotificationPosition, NotificationStatus,
  Orientation, OutcomeType, PriorityTypeEnum,
  PrivacySettingEnum, ProductStatus, ProjectStateEnum,
  SortingType, StatusType, SubscriberTypeEnum,
  SubscriptionTypeEnum, TaskStatus, TeamStatus,
  TodoStatus, ProjectPhaseTypeEnum
} from "@/app/models/data/StatusType";


export const NotificationTypeEnum = NOTIFICATION_TYPES;
export type NotificationType = keyof typeof NOTIFICATION_TYPES
  | DocumentTypeEnum
  | PriorityTypeEnum
  | "RandomDismiss";

export type MainNotificationType = NotificationType;


// DataTypeEnums.ts
export const DataTypeEnums = {
  Notification: NotificationTypeEnum,
  Document: DocumentTypeEnum,
  Priority: PriorityTypeEnum,
  ActivityAction: ActivityActionEnum,
  ActivityType: ActivityTypeEnum,
  Bookmark: BookmarkStatus,
  Border: BorderStyle,
  Calendar: {
    Status: CalendarStatus,
    View: CalendarViewType,
  },
  Chat: ChatType,
  Collaboration: CollaborationOptionType,
  Component: ComponentStatus,
  Data: DataStatus,
  DocumentPhase: DocumentPhaseEnum,
  DocumentSize: DocumentSize,
  Include: IncludeType,
  Layout: Layout,
  NotificationPosition: NotificationPosition,
  NotificationStatus: NotificationStatus,
  Orientation: Orientation,
  Outcome: OutcomeType,
  Privacy: PrivacySettingEnum,
  Product: ProductStatus,
  Project: {
    State: ProjectStateEnum,
    Phase: ProjectPhaseTypeEnum,
  },
  Sorting: SortingType,
  Status: StatusType,
  Subscriber: SubscriberTypeEnum,
  Subscription: SubscriptionTypeEnum,
  Task: TaskStatus,
  Team: TeamStatus,
  Todo: TodoStatus,
  Meeting: MeetingStatus,
  DEFAULT: "Default" as const,
} as const;



// Create a type for the entire structure
export type DataTypeEnums = typeof DataTypeEnums;

// Helper type to extract all possible values (optional)
export type AllEnumValues = {
  [K in keyof DataTypeEnums]: DataTypeEnums[K] extends object
  ? DataTypeEnums[K][keyof DataTypeEnums[K]]
  : DataTypeEnums[K];
}[keyof DataTypeEnums];


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
