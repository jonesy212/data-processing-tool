// StatusType.ts
// Define the type for the status property

export type CustomNotificationType =
  | "custom_notification_type_1"
  | "custom_notification_type_2"
  | "custom_notification_type_3";

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
  | "confirmed";

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
  Status = "status",
  Urgent = "urgent",
  Emergency = "emergency",
  
}

// Define the DocumentSize enum
enum DocumentSize {
  A4 = "A4",
  Letter = "Letter",
  Legal = "Legal",
  Custom = "Custom",
  // Add more sizes as needed
}

// Define the Orientation enum
enum Orientation {
  Portrait = "Portrait",
  Landscape = "Landscape",
}

enum PrivacySettingEnum {
  Private = "Private",
  Public = "Public",
  Restricted = "Restricted",
  FriendsOnly = "friends_only",
}

enum Layout {
  SingleColumn = "SingleColumn",
  Dynamic = "Dynamic",
  MultipleColumns = "MultipleColumns",
  Default = "Default",
}

// Define the ChatType enum
enum ChatType {
  Public = "public",
  Private = "private",
  Group = "group",
}

// Define specific enums for different types of status
enum TaskStatus {
  Pending = StatusType.Pending,
  InProgress = StatusType.InProgress,
  Completed = StatusType.Completed,
  Tentative = StatusType.Tentative,
  Confirmed = StatusType.Confirmed,
  Cancelled = StatusType.Cancelled,
  Scheduled = StatusType.Scheduled,
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
  Processed = "processed",
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
  Approved = StatusType.Confirmed,

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


// Assuming PriorityStatus and StatusType enums are defined elsewhere
enum PriorityStatus {
  Low = "low",
  Medium = "medium",
  High = "high",
  PendingReview = "pendingReview",
}

enum ProductStatus {
  Planned = StatusType.Tentative,
  InDevelopment = StatusType.InProgress,
  Testing = StatusType.InProgress,
  ReadyForLaunch = StatusType.Confirmed,
  Launched = StatusType.Completed,
}

export enum PriorityTypeEnum {
  Low = "low",
  Medium = "medium",
  High = "high",
  Normal = "normal",
  PendingReview = "pendingReview",
  Urgent = "urgent",
  Emergency = "emergency",
}

export enum ProjectPhaseTypeEnum {
  Ideation = "ideation",
  Draft = "drafting",
  TeamFormation = "team_formation",
  ProductBrainstorming = "product_brainstorming",
  Launch = "launch",
  DataAnalysis = "data_analysis",
  Review = "review",
  Final = "final",
  Test = "test",
  CreatePhase = "create_Phase",
  Previous = "previous",
  Register = "register",
  Planning = "planning",
}

export enum DevelopmentPhaseEnum {
  PLANNING = "PLANNING",
  DESIGN = "DESIGN",
  DEVELOPMENT = "DEVELOPMENT",
  TESTING = "TESTING",
  DEPLOYMENT = "DEPLOYMENT",
  IDEA_CREATION = "DEV_IDEA_CREATION", // Add prefix to distinguish
  IDEA_SUBMISSION = "IDEA_SUBMISSION",
  CODING = "CODING",
  Deployment = "DEPLOYMENT",
}


export enum CommunicationMediaType {
  Audio = "audio",
  Video = "video",
  Text = "text",
}

// Define the IncludeType enum
enum IncludeType {
  Embed = "Embed",
  // Add other include options if needed
}

enum CalendarViewType {
  Day = 'day',
  Week = 'week',
  Month = 'month',
  Year = 'year',
  Agenda = 'agenda',
  Custom = 'custom',
  Default = 'default',
}

enum CollaborationOptionType {
  ScreenSharing = "screen_sharing",
  DocumentSharing = "document_sharing",
  Whiteboarding = "whiteboarding",
  // Add more options as needed
}

enum OutcomeType {
  ProjectCompletion = "project_completion",
  ProductLaunch = "product_launch",
  DataInsights = "data_insights",
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
  NONE = "none",
  SOLID = "solid",
  DASHED = "dashed",
  DOTTED = "dotted",
  DOUBLE = "double",
  GROOVE = "groove",
  RIDGE = "ridge",
  INSET = "inset",
  OUTSET = "outset",
  None = "none",
}
enum SubscriptionTypeEnum {
  PortfolioUpdates = "portfolioUpdates",
  TradeExecutions = "tradeExecutions",
  MarketUpdates = "marketUpdates",
  CommunityEngagement = "communityEngagement",
  Unsubscribe = "unsubscribe",
  ResearchInsights = "researchInsights",
  AdvancedCollaboration = "advancedCollaboration",
  CryptoAnalytics = "cryptoAnalytics",
  ExclusiveContent = "exclusiveContent",
  IntegrationHub = "integrationHub",
  Snapshot = "snapshot",
  Monthly = "monthly",
  FREE = "free",
  STANDARD = "standard",
  PREMIUM = "premium",
  ENTERPRISE = "enterprise",
  TRIAL = "trial",

}



enum SubscriberTypeEnum {
  FREE = "free",
  STANDARD = "standard",
  PREMIUM = "premium",
  ENTERPRISE = "enterprise",
  TRIAL = "trial",
  // Add more types as needed
}
export default BookmarkStatus;

export {
  BookmarkStatus,
  BorderStyle,
  CalendarStatus, CalendarViewType, ChatType,
  CollaborationOptionType,
  ComponentStatus,
  DataStatus,
  DocumentSize,
  IncludeType,
  Layout,
  NotificationStatus,
  Orientation,
  OutcomeType,
  PriorityStatus, PrivacySettingEnum, ProductStatus,
  SortingType,
  StatusType, SubscriberTypeEnum, SubscriptionTypeEnum, TaskStatus,
  TeamStatus,
  TodoStatus
};

