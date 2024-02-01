// NotificationMessages.ts
const NOTIFICATION_MESSAGES = {

  Auth: {
    DEFAULT: "Authentication required",
    INVALID_CREDENTIALS: "Invalid username or password",
    ACCOUNT_DISABLED: "Your account has been disabled",
    ACCOUNT_NOT_FOUND: "No account found with provided credentials",
    PASSWORD_RESET: "Password reset email sent successfully",
    PASSWORD_RESET_FAILED: "Password reset failed, please try again later"
  },

  Brainstorming: {
    DEFAULT: "New idea generated",
    IDEA_ACCEPTED: "Idea accepted",
    IDEA_REJECTED: "Idea rejected",
    IDEA_EDITED: "Idea updated",
    SESSION_STARTED: "Brainstorming session started",
    SESSION_ENDED: "Brainstorming session ended"
  },


  // Data
  Data: {
    DEFAULT: "Loading data...",
    PAGE_LOADING: "Loading page...",
    ERROR_EXPORTING_DATA: "Error exporting data. Please try again.",
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
    ONBOARDING_ERROR: "Error in the onboarding process. Please try again.",

  },
  NO_NOTIFICATIONS: {
    DEFAULT: "NO NOTIFICATION WENT OFF..",
    NOTIFICATION_LOADING: "Loading notifications...",
  },
  
  // Success and Operation
  OperationSuccess: {
    DEFAULT: "Operation successful.",
    PAYMENT_RECEIVED: "Payment received successfully.",
    ONBOARDING_SUCCESS: "Onboarding process completed successfully.",

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
  Details: {
    DEFAULT: (errorType: string, details: string) =>
      `Error in Details Service (${errorType}): ${details}`,
    UPDATE_DETAILS_ITEM_ERROR: "Error updating details item. Please try again.",
    UPDATE_DETAILS_ITEM_SUCCESS: "Details item updated successfully.",
    FETCH_DETAILS_ITEMS_SUCCESS: "Details items fetched successfully.",
    FETCH_DETAILS_ITEMS_ERROR: "Error fetching details items. Please try again.",
    FETCH_DETAILS_ITEM_SUCCESS: "Details item fetched successfully.",
    FETCH_DETAILS_ITEM_ERROR: "Error fetching details item. Please try again.",

    UPDATE_DETAILS_ITEMS_SUCCESS: "Details items updated successfully.",
    UPDATE_DETAILS_ITEMS_ERROR: "Error updating details items. Please try again.",
    DELETE_DETAILS_ITEMS_SUCCESS: "Details items deleted successfully.",
    DELETE_DETAILS_ITEMS_ERROR: "Error deleting details items. Please try again.",
    INVALID_NAME: "Name contains invalid characters",
    TOO_LONG: "Name is too long",
    TAKEN: "Name is already taken",
    // other details messages
  },
   // Event-related
   EventReminder: {
    DEFAULT: "Event reminder.",
    EVENT_OCCURRED: "An event has occurred.",
    
    // Add more messages for the EventReminder type
  },
   
  Freelancer: {
    SUBMIT_PROPOSAL_ERROR: "Error submitting proposal.",
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
     ERROR: "An error occurred. Please try again later.",

    // Add more generic messages
  },
   
  Notifications: {
    DEFAULT: (errorType: string, details: string) =>
    `Error in Notifications (${errorType}): ${details}`,
    NOTIFICATION_SENT: "Notification sent successfully",
    NOTIFICATION_SEND_FAILED: "Failed to send notification. Please try again later."
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

  Onboarding: {
    DEFAULT: "Welcome to the onboarding process!",
    QUESTIONNAIRE_SUBMITTED: "Questionnaire submitted successfully.",
    PROFILE_SETUP_SUCCESS: "Profile setup completed successfully.",
    PROFILE_SETUP_ERROR: "Error in profile setup. Please try again later.",
    TRANSITION_TO_OFFER: "Transitioning to the offer phase.",
  },
 

  Persona: {
    DEFAULT: (errorType: string, details: string) =>
    `Error in Personas (${errorType}): ${details}`,
    WELCOME: "Welcome to the Persona Builder!",
    QUESTIONNAIRE_COMPLETE: "Thank you for completing the questionnaire!",
    // Add more personalized messages for the PersonMessages type
  },
  Phase: {
    FETCH_PHASE_ERROR: "Error fetching phases. Please try again.",
    UPDATE_PHASE_ERROR: "Error updating phase. Please try again.",
  },
  Prompts: {
    FETCH_PROMPTS_REQUEST: "Fetching prompts...",
    FETCH_PROMPTS_SUCCESS: "Prompts fetched successfully.",
    FETCH_PROMPTS_FAILURE: "Failed to fetch prompts. Please try again."
    
  },
  
  Snapshot: {
    DEFAULT: (errorType: string, details: string) =>
    `Error in Snapshots (${errorType}): ${details}`,
    FETCHING_SNAPSHOTS: "Fetching snapshots...",
    UPDATING_SNAPSHOT: "Updating snapshot...",
    FETCHING_SNAPSHOTS_ERROR: "Error fetching snapshots. Please try again.",
    UPDATING_SNAPSHOTS: "Updating snapshots...",
    CREATED: "Snapshot created successfully",
    Error: "Error creating snapshot. Please try again.",
  },
  StateGovCities: {
    DEFAULT: (errorType: string, details: string) =>
    `Error in "State/Government Cities (${errorType}): ${details}`,
    ERROR_FETCHING_CITIES: "Error fetching state/government cities. Please try again.",
    SUCCESS_FETCHING_CITIES: "State/government cities fetched successfully.",
    SUCCESS_REMOVING_CITY: "State/government city removed successfully.",
    SUCCESS_UPDATING_CITY: "State/government city updated successfully.",
    SUCCESS_ADDING_NEW_CITY: "New state/government city added successfully.",
    
    // Add more messages for the StateGovCities type
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


  Toolbar: {
    DEFAULT: "New item added to toolbar",
    ITEM_SELECTED: "Item selected in toolbar",
    ITEM_REMOVED: "Item removed from toolbar",
    ITEM_UPDATED: "Item updated in toolbar"
  },
  
  // Team-related
  Team: {
    DEFAULT: (errorType: string, details: string) =>
    `Error in Teams (${errorType}): ${details}`,

    //success
    ASSIGN_TEAM_MEMBER_FAILURE:
    "Failed to assign team member. Please try again.",
    
    //failure
    FETCH_TEAM_ERROR: "Error fetching team. Please try again.",
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

  Video: {
    DEFAULT: (errorType: string, details: string) => `Error in Videos (${errorType}): ${details}`,
    UPLOAD_STARTED: "Video upload started",
    UPLOAD_COMPLETED: "Video upload completed",
    UPLOAD_FAILED: "Video upload failed. Please try again.",
    PROCESSING_VIDEO: "Processing video...",
    PROCESSING_COMPLETE: "Video processed successfully",
    PROCESSING_FAILED: "Video processing failed. Please try again.",
    CREATE_VIDEO_SUCCESS: "Video created successfully",
    CREATE_VIDEO_ERROR: "Error creating video. Please try again.",
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
