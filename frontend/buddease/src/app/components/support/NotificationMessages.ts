// NotificationMessages.ts
const NOTIFICATION_MESSAGES = {
  // Loading and Data
  DataLoading: {
    DEFAULT: "Loading data...",
    PAGE_LOADING: "Loading page...",
    // Add more messages for the DataLoading type
  },

  // Error and Authentication
  Error: {
    DEFAULT: (errorType: string) => `An ${errorType} occurred.`,
    INVALID_CREDENTIALS: "Invalid credentials. Please try again.",
    ERROR_UPDATING_DATA: "Error updating data. Please try again later.",
    ERROR_REMOVING_DATA: "Error removing data. Please try again",
    ERROR_FETCHING_DATA: "Error fetching data. Please try again later.",
    PROCESSING_BATCH: "Processing batch of notifications...",
    NETWORK_ERROR:
    "Error connecting to notification server. Please check your network connection and try again.",
    UI_THEME: "User theme did no upate as expected",
    // Add more messages for the Error type
    BROWSER_CHECKER_ERROR: `There was an error connecting to the browser. Please check your network connection and try again.`,
  },
  NO_NOTIFICATIONS: {
    DEFAULT: "NO NOTIFICATION WENT OFF..",
    NOTIFICATION_LOADING: "Loading notifications...",
  },
  
  // Success and Operation
  OperationSuccess: {
    DEFAULT: "Operation successful.",
    PAYMENT_RECEIVED: "Payment received successfully.",
    // Add more messages for the OperationSuccess type
  },

  // Warning and Informational
  LowDiskSpace: {
    DEFAULT: "Low disk space warning.",
    DATA_LIMIT_APPROACHING: "Data limit is approaching.",
    // Add more messages for the LowDiskSpace type
  },
  
  // Chat and User
  ChatMessage: {
    DEFAULT: "New chat message received.",
    CHAT_MENTION: "You were mentioned in a chat.",
    CHAT_ARCHIVED: "Chat archived successfully.",
    CHAT_PINNED: "Chat message pinned successfully.",
    CHAT_DELETED: "Chat message deleted successfully.",
    CHAT_EDITED: "Chat message edited successfully.",
    CHAT_FORWARD_SUCCESS: "Chat message forwarded successfully.",
    CHAT_UNDO_DELETE: "Chat message deletion undone successfully.",
    CHAT_REACTION_ADDED: "Reaction added to chat message.",
    CHAT_REACTION_REMOVED: "Reaction removed from chat message.",
    // Add more messages for the NewChatMessage type
  },
  
  // Event-related
  EventReminder: {
    DEFAULT: "Event reminder.",
    EVENT_OCCURRED: "An event has occurred.",
    
    // Add more messages for the EventReminder type
  },
  
  
  // Calendar Events
  CalendarEvents: {
    ADD_EVENT_SUCCESS: "Calendar event added successfully.",
    ADD_EVENT_ERROR: "Failed to add calendar event.",
    FETCH_EVENTS_SUCCESS: "Calendar events fetched successfully.",
    FETCH_EVENTS_ERROR: "Failed to fetch calendar events.",
    REMOVE_EVENT_SUCCESS: "Calendar event removed successfully.",
    REMOVE_EVENT_ERROR: "Failed to remove calendar event.",
    REASSIGN_EVENT_ERROR: 'Failed to reassign calendar event.',
    REASSIGN_EVENT_SUCCESS: 'Calendar event reassigned successfully.',
    COMPLETE_ALL_EVENTS_ERROR: 'Failed to complete all calendar events.',
    COMPLETE_ALL_EVENTS_SUCCESS: 'All calendar events completed successfully.',
  
    // Add more messages for other calendar events actions
  },
  
  
  // Backend Structure
  BackendStructure: {
    DEFAULT: "Backend structure operation completed.",
    ERROR_GETTING_STRUCTURE: "Error getting backend structure.",
    ERROR_TRAVERSING_DIRECTORY: "Error traversing the directory.",
    ERROR_FILTERING: "Error filtering structure data.",
    // Add more messages for the BackendStructure type
  },
  // Communication and Collaboration
  Communication: {
    START_SUCCESS: "Communication started successfully.",
    END_SUCCESS: "Communication ended successfully.",
    COLLABORATE_SUCCESS: "Collaboration successful.",
    // Add more messages for communication and collaboration
  },
  // Custom Notifications
  CustomNotification1: {
    DEFAULT: (customText: string) => typeof customText,
    // Add more messages for the CustomNotification1 type
  },
  CustomNotification2: {
    DEFAULT: (customText: string) => typeof customText,
    // Add more messages for the CustomNotification2 type
  },
  
  DataAnalysis: {
    DEFAULT: (errorType: string, details: string) =>
    `Error in Data Analysis (${errorType}): ${details}`,
    FETCH_ERROR: "Error fetching data analysis. Please try again.",
    UPLOAD_ERROR: "Error uploading data analysis. Please try again.",
    UPDATE_ERROR: "Error updating data analysis. Please try again.",
    REMOVE_ERROR: "Error removing data analysis. Please try again.",
    // Add more messages for the DataAnalysis type
    // You can customize the messages based on your application's needs
  },
  
  FrontendStructure: {
    DEFAULT: "Frontend structure operation completed.",
    ERROR_GETTING_STRUCTURE: "Error getting frontend structure.",
    ERROR_TRAVERSING_DIRECTORY: "Error traversing the directory.",
    // Add more messages for the BackendStructure type
  },

   // Generic Messages
   Generic: {
    DEFAULT: "Notification message...",
    // Add more generic messages
  },
  
  MessagingSystem: {
    DEFAULT: "New message received.", // Default message for the messaging system
    MESSAGE_SENT: "Your message has been sent successfully.",
    // Add more messages for the MessagingSystem type
  },
  
  NamingConventionsError: {
    DEFAULT: (errorType: string, details: string) =>
    `Error in Define Naming Conventions (${typeof errorType}): ${typeof details}`,
    
    // New Error Messages for Naming Conventions
    INVALID_NAME_FORMAT:
    "Invalid name format. Please follow the specified conventions.",
    DUPLICATE_NAME: "Duplicate name found. Choose a unique name.",
    // Add more messages for the NamingConventionsError type
  },

  Persona: {
    DEFAULT: (errorType: string, details: string) =>
    `Error in Tasks (${errorType}): ${details}`,
    WELCOME: "Welcome to the Persona Builder!",
    QUESTIONNAIRE_COMPLETE: "Thank you for completing the questionnaire!",
    // Add more personalized messages for the PersonMessages type
  },
  
  Snapshot: {
    FETCHING_SNAPSHOTS: "Fetching snapshots...",
    UPDATING_SNAPSHOT: "Updating snapshot...",
  },
  
  Tasks: {
    DEFAULT: (errorType: string, details: string) =>
    `Error in Tasks (${errorType}): ${details}`,
    TASK_ADDED: "Task added successfully",
    TASK_DELETED: "Task deleted successfully",
    TASK_UPDATED: "Task updated successfully",
    COMPLETED: "Task marked as complete successfully!",
    // New Error Messages for Tasks
    TASK_DUPLICATE_ERROR:
    "Duplicate task found. Please choose a different name.",
    TASK_ASSIGN_ERROR: "Error assigning task. Please try again.",
    
    TASK_ADD_ERROR: "Error adding task. Please try again.",
    TASK_UPDATE_ERROR: "Task did not update successfully, please try again",
    TASK_FETCH_ERROR: "Error fetching tasks. Please try again.",
    TASK_REMOVE_ERROR: "Error removing task. Please try again.",
    COMPLETE_ALL_TASKS_ERROR: "Error completing all tasks. Please try again.",
    TASK_TOGGLE_ERROR: "Error toggling task status. Please try again.",
    success: {
      userGenerated: 'User-generated task was successful.',
      systemGenerated: 'System-generated task was successful.',
    },
    failure: {
      userGenerated: 'Error in user-generated task.',
      systemGenerated: 'Error in system-generated task.',
    },
    // New Error Messages for Tasks
  },
  
  // Team-related
  Team: {
    DEFAULT: "Loading team data...",
    
    //success
    ASSIGN_TEAM_MEMBER_FAILURE:
    "Failed to assign team member. Please try again.",
    
    //failure
    
    // Add more messages for the TeamLoading type
  },

  Todos: {
    DEFAULT: (errorType: string, details: string) =>
    `Error in Tasks (${typeof errorType}): ${typeof details}`,
    TODO_ADDED: "Todo added successfully",
    TODO_DELETED: "Todo deleted successfully",
    TODO_UPDATED: "Todo updated successfully",
    
    TODO_DUPLICATE_ERROR:
    "Duplicate todo found. Please choose a different name.",
    TODO_ASSIGN_ERROR: "Error assigning todo. Please try again.",
    
    TODO_ADD_ERROR: "Error adding todo. Please try again.",
    TODO_UPDATE_ERROR: "Todo did not update successfully, please try again",
    TODO_FETCH_ERROR: "Error fetching todo. Please try again.",
    TODO_REMOVE_ERROR: "Error removing todo. Please try again.",
    COMPLETE_ALL_TODOS_ERROR: "Error completing all todo. Please try again.",
    TODO_TOGGLE_ERROR: "Error toggling todo status. Please try again.",
    BATCH_ASSIGN_ERROR: "Error assigning todos in batch. Please try again.",
  },
  
  
  User: {
    FETCH_USER_ERROR: "Error fetching user data. Please try again later.",
    ASSIGN_USER_FAILURE: "Failed to assign user. Please try again.",
    UPDATE_USER_ERROR: "Error updating user data. Please try again later.",
  },


  // User Profile
  UserProfile: {
    PROFILE_SAVING: "Saving user profile...",
    PROFILE_SAVED: "User profile saved successfully!",
    // Add more messages for the UserProfile type
  },

 
  // Welcome and Account
  Welcome: {
    DEFAULT: (userName: string) => `Welcome, ${userName}!`,
    ACCOUNT_CREATED: "Your account has been successfully created.",
    // Add more messages for the Welcome type
  },
  
  // Token-related
  TokenUtils: {
    DEFAULT: "Token operation completed.",
    TOKEN_STAKED: "Tokens successfully staked.",
    TOKEN_TRANSFERRED: "Tokens transferred successfully.",
    TOKEN_SUPPLY_CAPPED: "Token supply has reached its cap.",
    INSUFFICIENT_FUNDS: "Insufficient funds for the operation.",
    // Add more messages for the TokenUtils type
  },
} as const;

export default NOTIFICATION_MESSAGES;
