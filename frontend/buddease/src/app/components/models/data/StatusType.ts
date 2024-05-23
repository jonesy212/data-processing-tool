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


// Define an enum for sorting types
enum SortingType {
  ASCENDING = "ASCENDING",
  DESCENDING = "DESCENDING",
}


enum StatusType {
  Pending = "pending",
  Tentative = "tentative",
  InProgress = "inProgress",
  Confirmed = "confirmed",
  Cancelled = "cancelled",
  Scheduled = "scheduled",
  Completed = "completed",
  Upcoming = "upcoming",
  Status = "status"
}

// Define the DocumentSize enum
enum DocumentSize {
  A4 = 'A4',
  Letter = 'Letter',
  Legal = 'Legal',
  Custom = 'Custom'
  // Add more sizes as needed
}

// Define the Orientation enum
enum Orientation {
  Portrait = 'Portrait',
  Landscape = 'Landscape',
}



enum Visibility {
  Private = 'Private',
  Public = 'Public',
  Restricted = 'Restricted',
}

enum Layout {
  SingleColumn = 'SingleColumn',
  Dynamic = 'Dynamic',
  MultipleColumns = 'MultipleColumns',
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
  PendingReview = StatusType.Pending,
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
  PendingReview = StatusType.Pending,
}


export enum ProjectPhaseTypeEnum {
  Ideation = 'ideation',
  Draft = 'drafting',
  TeamFormation = 'team_formation',
  ProductBrainstorming = 'product_brainstorming',
  Launch = 'launch',
  DataAnalysis = 'data_analysis',
  Review = 'review',
  Final = 'final',
  Test = 'test',
  CreatePhase = 'createPhase'
}



export enum DevelopmentPhaseEnum{
  PLANNING,
  DESIGN,
  DEVELOPMENT,
  TESTING,
  DEPLOYMENT,
  IDEA_CREATION,
  IDEA_SUBMISSION,
  
}


export enum CommunicationMediaType {
  Audio = 'audio',
  Video = 'video',
  Text = 'text',
}


// Define the IncludeType enum
enum IncludeType {
  Embed = 'Embed',
  // Add other include options if needed
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


enum BookmarkStatus {
  Saved = "saved",
  Pending = StatusType.Pending,
  InProgress = StatusType.InProgress,
  Completed = StatusType.Completed,
  Archived = "archived",
  Tagged = "tagged",
  Error = "error",
  PendingReview = PriorityStatus.PendingReview,
  Confirmed = StatusType.Confirmed,
  Cancelled = StatusType.Cancelled,
  Scheduled = StatusType.Scheduled,
  Upcoming = StatusType.Upcoming,
  Tentative = ComponentStatus.Tentative,
  Ready = CalendarStatus.READY,
  Loading = CalendarStatus.LOADING,
  Idle = CalendarStatus.IDLE,
}


enum BorderStyle {
  NONE = 'none',
  SOLID = 'solid',
  DASHED = 'dashed',
  DOTTED = 'dotted',
  DOUBLE = 'double',
  GROOVE = 'groove',
  RIDGE = 'ridge',
  INSET = 'inset',
  OUTSET = 'outset',
  None = 'none',
}

export default BookmarkStatus;


export {
  BookmarkStatus, BorderStyle, CalendarStatus,
  ChatType, CollaborationOptionType, ComponentStatus,
  DataStatus,
  DocumentSize, IncludeType, Layout,
  NotificationStatus,
  Orientation, OutcomeType, PriorityStatus,
  ProductStatus, SortingType, StatusType,
  TaskStatus,
  TeamStatus,
  TodoStatus,
  Visibility
};

