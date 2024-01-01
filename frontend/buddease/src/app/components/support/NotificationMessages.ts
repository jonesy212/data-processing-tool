// NotificationMessages.ts
const NOTIFICATION_MESSAGES = {
    // Welcome and Account
    Welcome: {
      DEFAULT: (userName: string) => `Welcome, ${userName}!`,
      ACCOUNT_CREATED: 'Your account has been successfully created.',
      // Add more messages for the Welcome type
    },
  
    // Error and Authentication
    Error: {
      DEFAULT: (errorType: string) => `An ${errorType} occurred.`,
        INVALID_CREDENTIALS: 'Invalid credentials. Please try again.',
      ERROR_FETCHING_DATA: 'Error fetching data. Please try again later.',
      PROCESSING_BATCH: 'Processing batch of notifications...',
      NETWORK_ERROR: 'Error connecting to notification server. Please check your network connection and try again.',
      UI_THEME: 'User theme did no upate as expected',
      // Add more messages for the Error type
      BROWSER_CHECKER_ERROR: `There was an error connecting to the browser. Please check your network connection and try again.`
    },
  User_Error: {
    ASSIGN_USER_FAILURE: 'Failed to assign user. Please try again.'
  },
    // Team-related
    TeamLoading: {
      DEFAULT: 'Loading team data...',
      // Add more messages for the TeamLoading type
    },
  
    // Loading and Data
    DataLoading: {
      DEFAULT: 'Loading data...',
      PAGE_LOADING: 'Loading page...',
      // Add more messages for the DataLoading type
    },

    NO_NOTIFICATIONS: {
        DEFAULT: 'NO NOTIFICATION WENT OFF..',
        NOTIFICATION_LOADING: 'Loading notifications...'
    },
  
    // Success and Operation
    OperationSuccess: {
      DEFAULT: 'Operation successful.',
      PAYMENT_RECEIVED: 'Payment received successfully.',
      // Add more messages for the OperationSuccess type
    },
  
    // Warning and Informational
    LowDiskSpace: {
      DEFAULT: 'Low disk space warning.',
      DATA_LIMIT_APPROACHING: 'Data limit is approaching.',
      // Add more messages for the LowDiskSpace type
    },
  
    // Chat and User
    NewChatMessage: {
      DEFAULT: 'New chat message received.',
      CHAT_MENTION: 'You were mentioned in a chat.',
      // Add more messages for the NewChatMessage type
    },
  
    // Event-related
    EventReminder: {
      DEFAULT: 'Event reminder.',
      EVENT_OCCURRED: 'An event has occurred.',
      // Add more messages for the EventReminder type
    },

    NamingConventionsError: {
      DEFAULT: (errorType: string, details: string) => `Error in Define Naming Conventions (${errorType}): ${details}`,
      // Add more messages for the NamingConventionsError type
    },
  
    // Custom Notifications
    CustomNotification1: {
      DEFAULT: (customText: string) => customText,
      // Add more messages for the CustomNotification1 type
    },
    CustomNotification2: {
      DEFAULT: (customText: string) => customText,
      // Add more messages for the CustomNotification2 type
    },
  } as const;
  



export default NOTIFICATION_MESSAGES;