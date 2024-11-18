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
  Canceled = "canceled",
  Scheduled = "scheduled",
  Rescheduled = 'rescheduled',
  Completed = "completed",
  Upcoming = "upcoming",
  Status = "status",
  Urgent = "urgent",
  Emergency = "emergency",
  Active = "active",
  Inactive = "inactive", 
  Archived = "archived" ,
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
  Canceled = StatusType.Canceled,
  Scheduled = StatusType.Scheduled,
  Rescheduled = StatusType.Rescheduled
}

enum MeetingStatus {
  Pending = StatusType.Pending,
  InProgress = StatusType.InProgress,
  Completed = StatusType.Completed,
  Tentative = StatusType.Tentative,
  Confirmed = StatusType.Confirmed,
  Canceled = StatusType.Canceled,
  Scheduled = StatusType.Scheduled,
  Rescheduled = StatusType.Rescheduled
 }// General status for scheduling

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
  InactiveTeam = "inactiveTeam",
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


// Assuming PriorityTypeEnum and StatusType enums are defined elsewhere


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
  Development = "development",
  
}


enum ProjectStateEnum {
  Snapshots = "Snapshots",
  // Add other project states as needed
}

enum ActivityTypeEnum {
  Snapshot = "Snapshot",
  // Add other activity types as needed
}

enum ActivityActionEnum {
  Create = "Create",
  Update = "Update",
  Delete = "Delete",
  // Add other activity actions as needed
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
  // Basic = "basic"
}


enum DocumentPhaseEnum {
  Ideation = "ideation",             // Initial phase where ideas are generated
  Drafting = "drafting",             // Document is being drafted
  Review = "review",                 // Document is under review
  Approval = "approval",             // Awaiting approval
  Revision = "revision",             // Document is being revised
  Finalization = "finalization",     // Final touches are being added
  Publication = "publication",       // Document is published
  Distribution = "distribution",     // Document is being distributed
  Feedback = "feedback",             // Collecting feedback on the document
  Archiving = "archiving",           // Document is being archived
  Deletion = "deletion",             // Document is marked for deletion
  Suspension = "suspension",         // Document is temporarily suspended
  Restoration = "restoration",       // Document is being restored
  ConfidentialReview = "confidential_review", // Document is under confidential review
  PublicReview = "public_review",    // Document is under public review
  EmergencyUpdate = "emergency_update", // Document is being updated urgently
  HistoricalReview = "historical_review", // Historical document review phase
  Encryption = "encryption",         // Document is being encrypted
  Decryption = "decryption",         // Document is being decrypted
  Formatting = "formatting",         // Document formatting phase
  MetadataAssignment = "metadata_assignment", // Assigning metadata to the document
  Collaboration = "collaboration",   // Document is under collaborative editing
  Translation = "translation",       // Document is being translated
  LegalReview = "legal_review",      // Document is under legal review
  CommunityEngagement = "community_engagement", // Document is being shared for community engagement
  PodcastPreparation = "podcast_preparation", // Document is being prepared for a podcast
  CryptoAnalysis = "crypto_analysis", // Document is under crypto-related analysis
  MarketResearch = "market_research", // Document is being used for market research
  BusinessStrategy = "business_strategy", // Document is part of business strategy planning
  DataAnalysis = "data_analysis",    // Document is being analyzed for data insights
  Presentation = "presentation",     // Document is being prepared for presentation
  ReportGeneration = "report_generation", // Generating reports from the document
  TemplateCreation = "template_creation", // Creating templates from the document
  ImageProcessing = "image_processing", // Processing images within the document
  FileHandling = "file_handling",    // Handling file-specific tasks
  URLLinking = "url_linking",        // Linking URLs within the document
  Other = "other"                    // Any other custom phase
}



enum SubscriberTypeEnum {
  FREE = "free",
  STANDARD = "standard",
  PREMIUM = "premium",
  ENTERPRISE = "enterprise",
  TRIAL = "trial",
  PortfolioUpdates = "portfolioUpdates",
  Individual = "individual",
  // Add more types as needed
}


enum NotificationPosition {
  TopRight = "top-right",
  TopLeft = "top-left",
  BottomRight = "bottom-right",
  BottomLeft = "bottom-left",
}


enum BookmarkStatus {
  Saved = "saved",
  Pending = "pending",
  InProgress = "inProgress",
  Completed = "completed",
  Archived = "archived",
  Tagged = "tagged",
  Error = "error",
  PendingReview = "pendingReview",
  Confirmed = "confirmed",
  Cancelled = "cancelled",
  Scheduled = "scheduled",
  Upcoming = "upcoming",
  Tentative = "tentative",
  Ready = "ready",
  Loading = "loading",
  Idle = "idle",
}


export {
  ActivityActionEnum,
  ActivityTypeEnum, BookmarkStatus,
  BorderStyle,
  CalendarStatus, CalendarViewType, ChatType,
  CollaborationOptionType,
  ComponentStatus,
  DataStatus, DocumentPhaseEnum, DocumentSize,
  IncludeType,
  Layout, NotificationPosition, NotificationStatus,
  Orientation,
  OutcomeType,
  PrivacySettingEnum, ProductStatus, ProjectStateEnum, SortingType,
  StatusType, SubscriberTypeEnum, SubscriptionTypeEnum, TaskStatus, TeamStatus,
  TodoStatus, MeetingStatus
};

