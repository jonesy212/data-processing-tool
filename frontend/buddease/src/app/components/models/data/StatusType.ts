// StatusType.ts
// Define the type for the status property

export type CustomNotificationType = 
  | 'custom_notification_type_1'
  | 'custom_notification_type_2'
  | 'custom_notification_type_3';


export type MessageNotificationStatusType =
  | "sent"
  | "delivered"
  | "read"
  | "unread"
  | "archived"
  | "tagged"
  | "error"
  | "pending"
  | "canceled"
  | "success"
  | "confirmed"
  ;

enum StatusType {
  Pending = "pending",
  Tentative = "tentative",
  InProgress = "inProgress",
  Confirmed = "confirmed",
  Cancelled = "cancelled",
  Scheduled = "scheduled",
  Completed = "completed",
  Upcoming = "upcoming",
}




// Define the ChatType enum
enum ChatType {
  Public = 'public',
  Private = 'private',
  Group = 'group'
}


  


// Define specific enums for different types of status
enum TaskStatus {
  Pending = StatusType.Pending,
  InProgress = StatusType.InProgress,
  Completed = StatusType.Completed,
}

enum TodoStatus {
  Pending = StatusType.Pending,
  InProgress = StatusType.InProgress,
  Completed = StatusType.Completed,
}




enum TeamStatus {
  Pending = StatusType.Pending,
  InProgress = StatusType.InProgress,
  Completed = StatusType.Completed,
}

enum DataStatus {
  Pending = StatusType.Pending,
  InProgress = StatusType.InProgress,
  Completed = StatusType.Completed,
}

enum TeamStatus {
  Active = "active",
  Inactive = "inactive",
}
enum ComponentStatus {
  Tentative = StatusType.Tentative,
}

// Define the CalendarStatus enum
enum CalendarStatus {
  LOADING = "loading",
  READY = "ready",
  ERROR = "error",
  IMPORTING = "importing",
  IDLE = "idle",

  Pending = StatusType.Pending,
  InProgress = StatusType.InProgress,
  Completed = StatusType.Completed,
  Scheduled = StatusType.Scheduled,
  Tentative = StatusType.Tentative,


  // Add more status options as needed
}

enum NotificationStatus {
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read",
  ERROR = "error",
  // Add more status options as needed
  PENDING = "pending",
  TENTATIVE = "tentative",
  IN_PROGRESS = "inProgress",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
  SCHEDULED = "scheduled",
  COMPLETED = "completed",
}

enum PriorityStatus {
  Low = "low",
  Medium = "medium",
  High = "high",
  Normal = "normal",
}

enum ProductStatus {
  Planned = StatusType.Tentative,
  InDevelopment = StatusType.InProgress,
  Testing = StatusType.InProgress,
  ReadyForLaunch = StatusType.Confirmed,
  Launched = StatusType.Completed
}

export enum PriorityTypeEnum {
  Low = PriorityStatus.Low,
  Medium = PriorityStatus.Medium,
  High = PriorityStatus.High,
  Normal = PriorityStatus.Normal,
}


export enum ProjectPhaseTypeEnum {
  Ideation = 'ideation',
  TeamFormation = 'team_formation',
  ProductBrainstorming = 'product_brainstorming',
  Launch = 'launch',
  DataAnalysis = 'data_analysis',
}

export enum DevelopmentPhaseEnum{
  Planning,
  Design,
  Development,
  Testing,
  Deployment,
  IdeaCreation,
}


export enum CommunicationMediaType {
  Audio = 'audio',
  Video = 'video',
  Text = 'text',
}


enum CollaborationOptionType {
  ScreenSharing = 'screen_sharing',
  DocumentSharing = 'document_sharing',
  Whiteboarding = 'whiteboarding',
  // Add more options as needed
}


enum OutcomeType {
  ProjectCompletion = 'project_completion',
  ProductLaunch = 'product_launch',
  DataInsights = 'data_insights',
  // Add more outcomes as needed
}




export {
  CalendarStatus,
  ChatType,
  ComponentStatus,
  DataStatus,
  NotificationStatus,
  PriorityStatus, ProductStatus, StatusType,
  TaskStatus,
  TeamStatus,
  TodoStatus
};

