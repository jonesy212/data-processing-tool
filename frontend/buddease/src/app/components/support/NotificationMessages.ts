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
  User: {
    FETCH_USER_ERROR: 'Error fetching user data. Please try again later.',
    ASSIGN_USER_FAILURE: 'Failed to assign user. Please try again.',
    UPDATE_USER_ERROR: 'Error updating user data. Please try again later.',
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
    
  Tasks: {
    DEFAULT: (errorType: string, details: string) => `Error in Tasks (${errorType}): ${details}`,
    TASK_ADDED: 'Task added successfully',
    TASK_DELETED: 'Task deleted successfully',
    TASK_UPDATED: 'Task updated successfully',
    

    TASK_ADD_ERROR: 'Error adding task. Please try again.',
    TASK_UPDATE_ERROR: 'Task did not update successfully, please try again',
    TASK_FETCH_ERROR: 'Error fetching tasks. Please try again.',
    TASK_REMOVE_ERROR: 'Error removing task. Please try again.',
    COMPLETE_ALL_TASKS_ERROR: 'Error completing all tasks. Please try again.',
    TASK_TOGGLE_ERROR: 'Error toggling task status. Please try again.'
  },
  
  Todos: {
    DEFAULT: (errorType: string, details: string) => `Error in Tasks (${errorType}): ${details}`,
    TODO_ADDED: 'Todo added successfully',
    TODO_DELETED: 'Todo deleted successfully',
    TODO_UPDATED: 'Todo updated successfully',
    

    TODO_ADD_ERROR: 'Error adding todo. Please try again.',
    TODO_UPDATE_ERROR: 'Todo did not update successfully, please try again',
    TODO_FETCH_ERROR: 'Error fetching todo. Please try again.',
    TODO_REMOVE_ERROR: 'Error removing todo. Please try again.',
    COMPLETE_ALL_TODOS_ERROR: 'Error completing all todo. Please try again.',
    TODO_TOGGLE_ERROR: 'Error toggling todo status. Please try again.'
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