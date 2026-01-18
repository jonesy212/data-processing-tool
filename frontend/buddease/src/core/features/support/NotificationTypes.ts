// NotificationTypes.ts

// Base types - System & Technical
export const BaseNotificationTypes = {
  ERROR: 'Error',
  WARNING: 'Warning',
  INFO: 'Info',
  SUCCESS: 'Success',
  DATA_LOADING: 'DataLoading',
  PAGE_LOADING: 'PageLoading',
  SYSTEM_UPDATE_IN_PROGRESS: 'SystemUpdateInProgress',
  LOW_DISK_SPACE: 'LowDiskSpace',
  DATA_LIMIT_APPROACHING: 'DataLimitApproaching',
  NEW_FEATURE_AVAILABLE: 'NewFeatureAvailable',
  SYSTEM: 'System',
  CONFIGURATION: 'Configuration',
  TEST: 'Test',
  DISMISS: 'Dismiss',
} as const;

Authentication & Account
export const AuthNotificationTypes = {
  WELCOME: 'Welcome',
  ACCOUNT_CREATED: 'AccountCreated',
  INVALID_CREDENTIALS: 'InvalidCredentials',
  PASSWORD_CHANGED: 'PasswordChanged',
  PROFILE_UPDATED: 'ProfileUpdated',
} as const;

Team & Collaboration
export const TeamNotificationTypes = {
  TEAM_JOIN_REQUEST: 'TeamJoinRequest',
  TEAM_JOIN_APPROVED: 'TeamJoinApproved',
  TEAM_LOADING: 'TeamLoading',
  TEAM_ID: 'TeamID',
  ADD_PARTICIPANT: 'ADD_PARTICIPANT',
} as const;

// Chat & Messaging
export const ChatNotificationTypes = {
  NEW_CHAT_MESSAGE: 'NewChatMessage',
  CHAT_MENTION: 'ChatMention',
  CHAT_ID: 'ChatID',
  CHAT_MESSAGE_ID: 'ChatMessageID',
  CHAT_THREAD_ID: 'ChatThreadID',
  DIRECT_MESSAGE: 'DirectMessage',
  MESSAGE_ID: 'Message'
} as const;

// Operations & System Actions
export const OperationNotificationTypes = {
  OPERATION_SUCCESS: 'OperationSuccess',
  OPERATION_ERROR: 'OperationError',
  OPERATION_START: 'OperationStart',
  OPERATION_UPDATE: 'OperationUpdate',
  OPERATION_INFO: 'OperationInfo',
  ASSIGNMENT_OPERATION: 'AssignmentOperation',
  ASSIGNMENT_OPERATION_SUCCESS: 'AssignmentOperationSuccess',
  CREATION_SUCCESS: 'CreationSuccess',
  GET_STORE_SUCCESS: 'GetStoreSuccess',
  DISPLAY_SUCCESS: 'DisplaySuccess',
} as const;

// Content & Media
export const ContentNotificationTypes = {
  CONTENT_ID: 'ContentID',
  CONTENT_ITEM: 'ContentItem',
  VIDEO_ID: 'VideoID',
  BLOG_POST_ID: 'BlogPostID',
  COMMENT_ID: 'CommentID',
  FILE_ID: 'FileID',
  ARTICLE_UPDATED: 'ArticleUpdated',
  PRODUCT_ID: 'ProductID',
  SURVEY_ID: 'SurveyID',
  SNAPSHOT: 'Snapshot',
  SNAPSHOT_ID: 'SnapshotID',
  SNAPSHOT_DETAILS: 'SnapshotDetails',
  SNAPSHOT_GENERATED: 'SnapshotGenerated'
} as const;


export const EventNotificationTypes = {
  EVENT: 'Event'
}

// Calendar & Events
export const CalendarNotificationTypes = {
  CALENDAR_EVENT: 'CalendarEvent',
  CALENDAR_ID: 'CalendarID',
  CALENDAR_NOTIFICATION: 'CalendarNotification',
  EVENT_ID: 'EventID',
  EVENT_OCCURRED: 'EventOccurred',
  EVENT_REMINDER: 'EventReminder',
  MEETING_ID: 'MeetingId',
} as const;

// Payments & Commerce
export const PaymentNotificationTypes = {
  PAYMENT_RECEIVED: 'PaymentReceived',
  COUPON_CODE: 'CouponCode',
} as const;

// App Development & Features
export const AppNotificationTypes = {
  APP_VERSION: 'AppVersion',
  APP_STRUCTURE_ID: 'AppStructureID',
  CUSTOM_ID: 'CustomID',
  GENERATED_ID: 'GeneratedID',
  LOCATION_ID: 'LocationID',
  PHASE_ID: 'PhaseID',
  PRESENTATION_ID: 'PresentationID',
  PROJECT_REVENUE_ID: 'ProjectRevenueID',
  VERSION_ID: 'VersionID',
  USER_ID: 'UserID',
  TASK_BOARD_ID: 'TaskBoardID',
  BRAINSTORMING_SESSION_ID: 'BrainstormingSessionID',
} as const;

// Analytics & Logging
export const AnalyticsNotificationTypes = {
  ANALYTICS_ID: 'AnalyticsID',
  LOGGING_ERROR: 'LoggingError',
  LOGGING_INFO: 'LoggingInfo',
  LOGGING_WARNING: 'LoggingWarning',
  BUTTON_CLICK: 'ButtonClick',
  TASK_LOGGED: 'TaskLogged',
} as const;

// Custom & Miscellaneous
export const CustomNotificationTypes = {
  CUSTOM_NOTIFICATION_1: 'CustomNotification1',
  CUSTOM_NOTIFICATION_2: 'CustomNotification2',
  ANNOUNCEMENT: 'Announcement',
  NEW_NOTIFICATION: 'NewNotification',
  PUSH_NOTIFICATION: 'PushNotification',
  UNSUBSCRIBED: 'Unsubscribed',
  MILESTONE: 'Milestone',
  CONTRIBUTION_ID: 'ContributionID',
  IDEATION_BRAINSTORMING: 'IdeationBrainstorming',
  DOCUMENT_EDIT_ID: 'DocumentEditID',
  API_CLIENT_ERROR: 'ApiClientError',
  __FILE_PATH__: 'filePath',
} as const;

// Onboarding & Setup (for your phases)
export const OnboardingNotificationTypes = {
  PROFILE_SETUP_START: 'ProfileSetupStart',
  PROFILE_SETUP_COMPLETE: 'ProfileSetupComplete',
  PROFILE_SETUP_SKIPPED: 'ProfileSetupSkipped',
  REGISTRATION_COMPLETE: 'RegistrationComplete',
  ONBOARDING_COMPLETE: 'OnboardingComplete',
  INITIAL_SETUP_COMPLETE: 'InitialSetupComplete',
  FEATURE_IMPLEMENTATION_COMPLETE: 'FeatureImplementationComplete',
  PLANNING_COMPLETE: 'PlanningComplete',
  BRANDING_COMPLETE: 'BrandingComplete',
  UXUI_COMPLETE: 'UXUIComplete',
  BRAINSTORMING_COMPLETE: 'BrainstormingComplete',
  TEAM_BUILDING_COMPLETE: 'TeamBuildingComplete',
  IDEATION_COMPLETE: 'IdeationComplete',
} as const;




// Phase & Progress Notifications
export const PhaseNotificationTypes = {
  // User Support Phases
  USER_SUPPORT_PLANNING_START: 'UserSupportPlanningStart',
  USER_SUPPORT_PLANNING_COMPLETE: 'UserSupportPlanningComplete',
  USER_SUPPORT_EXECUTION_START: 'UserSupportExecutionStart',
  USER_SUPPORT_EXECUTION_COMPLETE: 'UserSupportExecutionComplete',
  USER_SUPPORT_MONITORING_START: 'UserSupportMonitoringStart',
  USER_SUPPORT_MONITORING_COMPLETE: 'UserSupportMonitoringComplete',
  USER_SUPPORT_CLOSURE_START: 'UserSupportClosureStart',
  USER_SUPPORT_CLOSURE_COMPLETE: 'UserSupportClosureComplete',

  PROFILE_PHASE_START: 'ProfilePhaseStart', 
  PROFILE_PHASE_COMPLETE: 'ProfilePhaseComplete',
  // Progress Phases
  PROGRESS_IDEATION_START: 'ProgressIdeationStart',
  PROGRESS_IDEATION_COMPLETE: 'ProgressIdeationComplete',
  PROGRESS_TEAM_FORMATION_START: 'ProgressTeamFormationStart',
  PROGRESS_TEAM_FORMATION_COMPLETE: 'ProgressTeamFormationComplete',
  PROGRESS_PRODUCT_DEVELOPMENT_START: 'ProgressProductDevelopmentStart',
  PROGRESS_PRODUCT_DEVELOPMENT_COMPLETE: 'ProgressProductDevelopmentComplete',
  PROGRESS_LAUNCH_PREPARATION_START: 'ProgressLaunchPreparationStart',
  PROGRESS_LAUNCH_PREPARATION_COMPLETE: 'ProgressLaunchPreparationComplete',
  PROGRESS_DATA_ANALYSIS_START: 'ProgressDataAnalysisStart',
  PROGRESS_DATA_ANALYSIS_COMPLETE: 'ProgressDataAnalysisComplete',
  PROGRESS_DRAFT_START: 'ProgressDraftStart',
  PROGRESS_DRAFT_COMPLETE: 'ProgressDraftComplete',

  // App Development Phases
  APP_DEVELOPMENT_AUTHENTICATION_START: 'AppDevelopmentAuthenticationStart',
  APP_DEVELOPMENT_AUTHENTICATION_COMPLETE: 'AppDevelopmentAuthenticationComplete',
  APP_DEVELOPMENT_INITIAL_SETUP_START: 'AppDevelopmentInitialSetupStart',
  APP_DEVELOPMENT_INITIAL_SETUP_COMPLETE: 'AppDevelopmentInitialSetupComplete',
  APP_DEVELOPMENT_PLANNING_START: 'AppDevelopmentPlanningStart',
  APP_DEVELOPMENT_PLANNING_COMPLETE: 'AppDevelopmentPlanningComplete',
  APP_DEVELOPMENT_FEATURE_IMPLEMENTATION_START: 'AppDevelopmentFeatureImplementationStart',
  APP_DEVELOPMENT_FEATURE_IMPLEMENTATION_COMPLETE: 'AppDevelopmentFeatureImplementationComplete',

  // Course Development Phases
  COURSE_DEVELOPMENT_PLANNING_START: 'CourseDevelopmentPlanningStart',
  COURSE_DEVELOPMENT_PLANNING_COMPLETE: 'CourseDevelopmentPlanningComplete',
  COURSE_DEVELOPMENT_SETUP_START: 'CourseDevelopmentSetupStart',
  COURSE_DEVELOPMENT_SETUP_COMPLETE: 'CourseDevelopmentSetupComplete',
  COURSE_DEVELOPMENT_LEARNING_START: 'CourseDevelopmentLearningStart',
  COURSE_DEVELOPMENT_LEARNING_COMPLETE: 'CourseDevelopmentLearningComplete',

  // Data Analysis Sub-Phases
  DATA_ANALYSIS_DEFINE_OBJECTIVE_START: 'DataAnalysisDefineObjectiveStart',
  DATA_ANALYSIS_DEFINE_OBJECTIVE_COMPLETE: 'DataAnalysisDefineObjectiveComplete',
  DATA_ANALYSIS_DATA_COLLECTION_START: 'DataAnalysisDataCollectionStart',
  DATA_ANALYSIS_DATA_COLLECTION_COMPLETE: 'DataAnalysisDataCollectionComplete',
  DATA_ANALYSIS_CLEAN_DATA_START: 'DataAnalysisCleanDataStart',
  DATA_ANALYSIS_CLEAN_DATA_COMPLETE: 'DataAnalysisCleanDataComplete',
  DATA_ANALYSIS_DATA_ANALYSIS_START: 'DataAnalysisDataAnalysisStart',
  DATA_ANALYSIS_DATA_ANALYSIS_COMPLETE: 'DataAnalysisDataAnalysisComplete',
  DATA_ANALYSIS_DATA_VISUALIZATION_START: 'DataAnalysisDataVisualizationStart',
  DATA_ANALYSIS_DATA_VISUALIZATION_COMPLETE: 'DataAnalysisDataVisualizationComplete',
  DATA_ANALYSIS_TRANSFORM_INSIGHTS_START: 'DataAnalysisTransformInsightsStart',
  DATA_ANALYSIS_TRANSFORM_INSIGHTS_COMPLETE: 'DataAnalysisTransformInsightsComplete',

  // Idea Lifecycle Phases
  IDEA_LIFECYCLE_CONCEPT_DEVELOPMENT_START: 'IdeaLifecycleConceptDevelopmentStart',
  IDEA_LIFECYCLE_CONCEPT_DEVELOPMENT_COMPLETE: 'IdeaLifecycleConceptDevelopmentComplete',
  IDEA_LIFECYCLE_IDEA_VALIDATION_START: 'IdeaLifecycleIdeaValidationStart',
  IDEA_LIFECYCLE_IDEA_VALIDATION_COMPLETE: 'IdeaLifecycleIdeaValidationComplete',
  IDEA_LIFECYCLE_PROOF_OF_CONCEPT_START: 'IdeaLifecycleProofOfConceptStart',
  IDEA_LIFECYCLE_PROOF_OF_CONCEPT_COMPLETE: 'IdeaLifecycleProofOfConceptComplete',

  // Task Management Phases
  TASK_MANAGEMENT_LAUNCH_START: 'TaskManagementLaunchStart',
  TASK_MANAGEMENT_LAUNCH_COMPLETE: 'TaskManagementLaunchComplete',
  TASK_MANAGEMENT_DATA_ANALYSIS_START: 'TaskManagementDataAnalysisStart',
  TASK_MANAGEMENT_DATA_ANALYSIS_COMPLETE: 'TaskManagementDataAnalysisComplete',
  TASK_MANAGEMENT_PLANNING_START: 'TaskManagementPlanningStart',
  TASK_MANAGEMENT_PLANNING_COMPLETE: 'TaskManagementPlanningComplete',
  TASK_MANAGEMENT_EXECUTION_START: 'TaskManagementExecutionStart',
  TASK_MANAGEMENT_EXECUTION_COMPLETE: 'TaskManagementExecutionComplete',
  TASK_MANAGEMENT_TESTING_START: 'TaskManagementTestingStart',
  TASK_MANAGEMENT_TESTING_COMPLETE: 'TaskManagementTestingComplete',
  TASK_MANAGEMENT_COMPLETION_START: 'TaskManagementCompletionStart',
  TASK_MANAGEMENT_COMPLETION_COMPLETE: 'TaskManagementCompletionComplete',

  // Task Phases
  TASK_PLANNING_START: 'TaskPlanningStart',
  TASK_PLANNING_COMPLETE: 'TaskPlanningComplete',
  TASK_EXECUTION_START: 'TaskExecutionStart',
  TASK_EXECUTION_COMPLETE: 'TaskExecutionComplete',
  TASK_TESTING_START: 'TaskTestingStart',
  TASK_TESTING_COMPLETE: 'TaskTestingComplete',
  TASK_COMPLETION_START: 'TaskCompletionStart',
  TASK_COMPLETION_COMPLETE: 'TaskCompletionComplete',

  // Team Creation Phases
  TEAM_CREATION_BASIC_INFO_START: 'TeamCreationBasicInfoStart',
  TEAM_CREATION_BASIC_INFO_COMPLETE: 'TeamCreationBasicInfoComplete',
  TEAM_CREATION_MEMBERS_START: 'TeamCreationMembersStart',
  TEAM_CREATION_MEMBERS_COMPLETE: 'TeamCreationMembersComplete',
  TEAM_CREATION_PREFERENCES_START: 'TeamCreationPreferencesStart',
  TEAM_CREATION_PREFERENCES_COMPLETE: 'TeamCreationPreferencesComplete',
  TEAM_CREATION_REVIEW_START: 'TeamCreationReviewStart',
  TEAM_CREATION_REVIEW_COMPLETE: 'TeamCreationReviewComplete',
  TEAM_CREATION_QUESTIONNAIRE_START: 'TeamCreationQuestionnaireStart',
  TEAM_CREATION_QUESTIONNAIRE_COMPLETE: 'TeamCreationQuestionnaireComplete',
  TEAM_CREATION_SUMMARY_START: 'TeamCreationSummaryStart',
  TEAM_CREATION_SUMMARY_COMPLETE: 'TeamCreationSummaryComplete',
  TEAM_CREATION_CONFIRMATION_START: 'TeamCreationConfirmationStart',
  TEAM_CREATION_CONFIRMATION_COMPLETE: 'TeamCreationConfirmationComplete',

  // Trading Phases
  TRADING_VERIFICATION_START: 'TradingVerificationStart',
  TRADING_VERIFICATION_COMPLETE: 'TradingVerificationComplete',
  TRADING_RISK_ASSESSMENT_START: 'TradingRiskAssessmentStart',
  TRADING_RISK_ASSESSMENT_COMPLETE: 'TradingRiskAssessmentComplete',
  TRADING_TRADER_TYPE_SELECTION_START: 'TradingTraderTypeSelectionStart',
  TRADING_TRADER_TYPE_SELECTION_COMPLETE: 'TradingTraderTypeSelectionComplete',
  TRADING_PROFESSIONAL_TRADER_PROFILE_START: 'TradingProfessionalTraderProfileStart',
  TRADING_PROFESSIONAL_TRADER_PROFILE_COMPLETE: 'TradingProfessionalTraderProfileComplete',
  TRADING_PROFESSIONAL_TRADER_DASHBOARD_START: 'TradingProfessionalTraderDashboardStart',
  TRADING_PROFESSIONAL_TRADER_DASHBOARD_COMPLETE: 'TradingProfessionalTraderDashboardComplete',
  TRADING_PROFESSIONAL_TRADER_CALLS_START: 'TradingProfessionalTraderCallsStart',
  TRADING_PROFESSIONAL_TRADER_CALLS_COMPLETE: 'TradingProfessionalTraderCallsComplete',
  TRADING_PROFESSIONAL_TRADER_CONTENT_MANAGEMENT_START: 'TradingProfessionalTraderContentManagementStart',
  TRADING_PROFESSIONAL_TRADER_CONTENT_MANAGEMENT_COMPLETE: 'TradingProfessionalTraderContentManagementComplete',
  TRADING_BASIC_INFO_START: 'TradingBasicInfoStart',
  TRADING_BASIC_INFO_COMPLETE: 'TradingBasicInfoComplete',
  TRADING_ASSETS_START: 'TradingAssetsStart',
  TRADING_ASSETS_COMPLETE: 'TradingAssetsComplete',
  TRADING_PREFERENCES_START: 'TradingPreferencesStart',
  TRADING_PREFERENCES_COMPLETE: 'TradingPreferencesComplete',
  TRADING_REVIEW_START: 'TradingReviewStart',
  TRADING_REVIEW_COMPLETE: 'TradingReviewComplete',
  TRADING_SUMMARY_START: 'TradingSummaryStart',
  TRADING_SUMMARY_COMPLETE: 'TradingSummaryComplete',
  TRADING_CONFIRMATION_START: 'TradingConfirmationStart',
  TRADING_CONFIRMATION_COMPLETE: 'TradingConfirmationComplete',

  TRADING_ENTHUSIAST_PROFILE_START: 'TradingEnthusiastProfileStart',
  TRADING_ENTHUSIAST_PROFILE_COMPLETE: 'TradingEnthusiastProfileComplete',
  TRADING_FOLLOW_TRADERS_START: 'TradingFollowTradersStart',
  TRADING_FOLLOW_TRADERS_COMPLETE: 'TradingFollowTradersComplete',
  TRADING_DO_YOUR_OWN_RESEARCH_START: 'TradingDoYourOwnResearchStart',
  TRADING_DO_YOUR_OWN_RESEARCH_COMPLETE: 'TradingDoYourOwnResearchComplete',
  TRADING_PARTICIPATE_CALLS_CONFERENCES_START: 'TradingParticipateCallsConferencesStart',
  TRADING_PARTICIPATE_CALLS_CONFERENCES_COMPLETE: 'TradingParticipateCallsConferencesComplete',
  TRADING_ADD_CONTENT_START: 'TradingAddContentStart',
  TRADING_ADD_CONTENT_COMPLETE: 'TradingAddContentComplete',
  
  // Source Enum (for notification origins)
  NOTIFICATION_SOURCE_MANUAL: 'NotificationSourceManual',
  NOTIFICATION_SOURCE_AUTOMATIC: 'NotificationSourceAutomatic',
  NOTIFICATION_SOURCE_SYSTEM: 'NotificationSourceSystem',

  // Project Phases
  PROJECT_PHASE_1_START: 'ProjectPhase1Start',
  PROJECT_PHASE_1_COMPLETE: 'ProjectPhase1Complete',
  PROJECT_PHASE_2_START: 'ProjectPhase2Start',
  PROJECT_PHASE_2_COMPLETE: 'ProjectPhase2Complete',
  PROJECT_PHASE_3_START: 'ProjectPhase3Start',
  PROJECT_PHASE_3_COMPLETE: 'ProjectPhase3Complete',

  // Team Building Phases
  TEAM_BUILDING_REQUIREMENTS_GATHERING_START: 'TeamBuildingRequirementsGatheringStart',
  TEAM_BUILDING_REQUIREMENTS_GATHERING_COMPLETE: 'TeamBuildingRequirementsGatheringComplete',
  TEAM_BUILDING_CONCEPT_VALIDATION_START: 'TeamBuildingConceptValidationStart',
  TEAM_BUILDING_CONCEPT_VALIDATION_COMPLETE: 'TeamBuildingConceptValidationComplete',

  // Post Launch Activities Phases
  POST_LAUNCH_REFACTORING_REBRANDING_START: 'PostLaunchRefactoringRebrandingStart',
  POST_LAUNCH_REFACTORING_REBRANDING_COMPLETE: 'PostLaunchRefactoringRebrandingComplete',
  POST_LAUNCH_COLLABORATION_SETTINGS_START: 'PostLaunchCollaborationSettingsStart',
  POST_LAUNCH_COLLABORATION_SETTINGS_COMPLETE: 'PostLaunchCollaborationSettingsComplete',

} as const;

// Add this to your notification types
export const ApiNotificationTypes = {
  // API Status notifications
  API_SUCCESS: 'APISuccess',
  API_ERROR: 'APIError',
  API_WARNING: 'APIWarning',
  API_INFO: 'APIInfo',
  
  // HTTP Status notifications
  HTTP_200: 'HTTP200',
  HTTP_201: 'HTTP201',
  HTTP_204: 'HTTP204',
  HTTP_400: 'HTTP400',
  HTTP_401: 'HTTP401',
  HTTP_403: 'HTTP403',
  HTTP_404: 'HTTP404',
  HTTP_409: 'HTTP409',
  HTTP_500: 'HTTP500',
  HTTP_502: 'HTTP502',
  HTTP_503: 'HTTP503',
  
  // API Operation notifications
  API_REQUEST_START: 'APIRequestStart',
  API_REQUEST_COMPLETE: 'APIRequestComplete',
  API_REQUEST_FAILED: 'APIRequestFailed',
  API_RETRY: 'APIRetry',
  API_TIMEOUT: 'APITimeout',
  
  // API Data notifications
  DATA_FETCH_SUCCESS: 'DataFetchSuccess',
  DATA_FETCH_ERROR: 'DataFetchError',
  DATA_UPDATE_SUCCESS: 'DataUpdateSuccess',
  DATA_UPDATE_ERROR: 'DataUpdateError',
  DATA_DELETE_SUCCESS: 'DataDeleteSuccess',
  DATA_DELETE_ERROR: 'DataDeleteError',
  
  // API Validation notifications
  VALIDATION_ERROR: 'ValidationError',
  VALIDATION_SUCCESS: 'ValidationSuccess',
  VALIDATION_WARNING: 'ValidationWarning',
  
  // API Connection notifications
  CONNECTION_SUCCESS: 'ConnectionSuccess',
  CONNECTION_ERROR: 'ConnectionError',
  CONNECTION_LOST: 'ConnectionLost',
  CONNECTION_RESTORED: 'ConnectionRestored',
  
  // API Rate limiting
  RATE_LIMIT_WARNING: 'RateLimitWarning',
  RATE_LIMIT_EXCEEDED: 'RateLimitExceeded',
  
  // API Authentication/Authorization
  AUTH_SUCCESS: 'AuthSuccess',
  AUTH_ERROR: 'AuthError',
  TOKEN_EXPIRED: 'TokenExpired',
  TOKEN_REFRESHED: 'TokenRefreshed',
  PERMISSION_DENIED: 'PermissionDenied',
  
  // API Versioning
  API_VERSION_DEPRECATED: 'APIVersionDeprecated',
  API_VERSION_UPGRADE: 'APIVersionUpgrade',
  
  // API Documentation
  API_DOCS_UPDATED: 'APIDocsUpdated',
  API_SCHEMA_CHANGED: 'APISchemaChanged',
} as const;

// Combine all types
export const NOTIFICATION_TYPES = {
  ...BaseNotificationTypes,
  ...AuthNotificationTypes,
  ...TeamNotificationTypes,
  ...ChatNotificationTypes,
  ...OperationNotificationTypes,
  ...ContentNotificationTypes,
  ...CalendarNotificationTypes,
  ...PaymentNotificationTypes,
  ...AppNotificationTypes,
  ...AnalyticsNotificationTypes,
  ...CustomNotificationTypes,
  ...OnboardingNotificationTypes,
   ...PhaseNotificationTypes,
  ...EventNotificationTypes,
   ...ApiNotificationTypes, 
} as const;

