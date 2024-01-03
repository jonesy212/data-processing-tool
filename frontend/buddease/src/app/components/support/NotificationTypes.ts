// NotificationTypes.ts
export const NOTIFICATION_TYPES = {
    // Welcome and Account
    WELCOME: 'Welcome',
    ACCOUNT_CREATED: 'AccountCreated',
  
    // Error and Authentication
    ERROR: 'Error',
    INVALID_CREDENTIALS: 'InvalidCredentials',
  
    // Team-related
    TEAM_LOADING: 'TeamLoading',
    TEAM_JOIN_REQUEST: 'TeamJoinRequest',
    TEAM_JOIN_APPROVED: 'TeamJoinApproved',
  
    // Loading and Data
    DATA_LOADING: 'DataLoading',
    PAGE_LOADING: 'PageLoading',
  
    // Success and Operation
    OPERATION_SUCCESS: 'OperationSuccess',
    PAYMENT_RECEIVED: 'PaymentReceived',
  
    // Warning and Informational
    LOW_DISK_SPACE: 'LowDiskSpace',
    DATA_LIMIT_APPROACHING: 'DataLimitApproaching',
    NEW_FEATURE_AVAILABLE: 'NewFeatureAvailable',
    SYSTEM_UPDATE_IN_PROGRESS: 'SystemUpdateInProgress',
  
    // Chat and User
    NEW_CHAT_MESSAGE: 'NewChatMessage',
    CHAT_MENTION: 'ChatMention',
    PROFILE_UPDATED: 'ProfileUpdated',
    PASSWORD_CHANGED: 'PasswordChanged',
  
    // Event-related
    EVENT_REMINDER: 'EventReminder',
    EVENT_OCCURRED: 'EventOccurred',
  
    // Custom Notifications
    CUSTOM_NOTIFICATION_1: 'CustomNotification1',
    CUSTOM_NOTIFICATION_2: 'CustomNotification2',
  } as const;
  


export type NOTIFICATION_TYPES = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];