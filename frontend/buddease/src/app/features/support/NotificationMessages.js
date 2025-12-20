"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Helper function to handle dynamic notification message
const handleDynamicNotificationMessage = function (message, errorType, details) {
    if (typeof message === "string") {
        return message;
    }
    else if (typeof message === "function") {
        return message(errorType || "errorType", details || "details");
    }
    return "Unknown error occurred";
};

// Wrapper function to set dynamic notification message
var setDynamicNotificationMessageWrapper = function (message, errorType, details) {
    var dynamicMessage;
    if (typeof message === "string") {
        dynamicMessage = message;
    }
    else {
        dynamicMessage = message(errorType, details);
    }
    // Your implementation of setDynamicNotificationMessage
    console.log(dynamicMessage); // For demonstration purposes, replace with your implementation
};


const NOTIFICATION_MESSAGES = {
    Fetch_Notification_Defaults: {
        success: "Notifications fetched successfully",
    },
    Audio: {
        AudioCommunicationFailure: "Failed to enable{ audio communication",
    },
    Auth: {
        DEFAULT: "Authentication required",
        INVALID_CREDENTIALS: "Invalid username or password",
        ACCOUNT_DISABLED: "Your account has been disabled",
        ACCOUNT_NOT_FOUND: "No account found with provided credentials",
        PASSWORD_RESET: "Password reset email sent successfully",
        PASSWORD_RESET_FAILED: "Password reset failed, please try again later",
    },
    // Backend Structure
    BackendStructure: {
        DEFAULT: "Backend structure operation completed",
        ERROR_GETTING_STRUCTURE: "Error getting backend structure",
        ERROR_TRAVERSING_DIRECTORY: "Error traversing the directory",
        ERROR_FILTERING: "Error filtering structure data",
        // Add more messages for the BackendStructure type
    },
    BaseAssignment: {
        DEFAULT: "BaseAssignment operation completed",
        ASSIGN_ITEM_SUCCESS: "Item assigned successfully",
    },
    Brainstorming: {
        DEFAULT: "New idea generated",
        IDEA_ACCEPTED: "Idea accepted",
        IDEA_REJECTED: "Idea rejected",
        IDEA_EDITED: "Idea updated",
        SESSION_STARTED: "Brainstorming session started",
        SESSION_ENDED: "Brainstorming session ended",
        DEFAULT_IdeationPhase_SUCCESS: "Ideation phase set successfully",
        DEFAULT_IdeationPhase_FAILURE: "Error setting ideation phase",
        SET_BRAINSTORMING_PHASE_SUCCESS: "Brainstorming phase set successfully",
        SET_BRAINSTORMING_PHASE_ERROR: "Error setting brainstorming phase",
    },
    Blog: {
        BLOG_CONTENT_UPDATED: "Updated your blog content",
    },
    Component: {
        DEFAULT: "Component operation completed",
        DEFAULT_ERROR: "Error occurred while performing component operation",
        CREATE_COMPONENT_SUCCESS: "Component created successfully",
        CREATE_COMPONENT_FAILURE: "Error creating component. Please try again",
        UPDATE_COMPONENT_SUCCESS: "Component updated successfully",
        UPDATE_COMPONENT_FAILURE: "Error updating component. Please try again",
        DELETE_COMPONENT_SUCCESS: "Component deleted successfully",
        DELETE_COMPONENT_FAILURE: "Error deleting component. Please try again",
        FETCH_COMPONENT_SUCCESS: "Component fetched successfully",
        FETCH_COMPONENT_FAILURE: "Error fetching component. Please try again",
        FETCH_COMPONENTS_SUCCESS: "Components fetched successfully",
        FETCH_COMPONENTS_FAILURE: "Error fetching components. Please try again",
        ADD_COMPONENT_SUCCESS: "Component added successfully",
    },
    Config: {
        CONFIG_UPDATED: "API configuration updated successfully",
        CONFIG_ROLLEDBACK: "API configuration rolled back to default.",
    },
    Cache: {
        ERROR_WRITING_TO_CACHE: "Error writing to cache"
    },
    Client: {
        GENERIC_POST_ERROR: "POST request failed",
        GENERIC_PUT_ERROR: "PUT request failed",
        GENERIC_DELETE_ERROR: "DELETE request failed",
        GENERIC_GET_ERROR: "Failed to complete GET request",
        FETCH_CLIENT_DETAILS_SUCCESS: "Client updated successfully",
        FETCH_CLIENT_DETAILS_ERROR: "Client failed to update client",
        CONNECT_WITH_TENANT_ERROR: "Client failed to connect",
        CREATE_TASK_ERROR: "Task creation error",
        LIST_TASKS_ERROR: "Task list error",
        SUBMIT_PROJECT_PROPOSAL_ERROR: "Project requested to submit project proposal failed",
        UPDATE_CLIENT_DETAILS_SUCCESS: "Client updated successfully",
        UPDATE_CLIENT_DETAILS_ERROR: "Update client details failed",
        REMOVE_CALENDAR_EVENT_ERROR: "Remove event failed",
        SEND_MESSAGE_TO_TENANT_ERROR: "Send message to tenant",
        LIST_CONNECTED_TENANTS_ERROR: "List available tenant",
        LIST_MESSAGES_ERROR: "List messages to tenant",
        LIST_REWARDS_ERROR: "List rewards not sent to tenant, review issue",
        PARTICIPATE_IN_COMMUNITY_CHALLENGES_ERROR: "List components that are currently associated with a cluster",
        LIST_FILES_ERROR: 'List files that are currently associated with a cluster.',
        GET_FILE_CONTENT_: 'Get file content',
        START_COLLABORATIVE_EDIT_ERROR: 'Start coll Anonymous editor',
        CREATE_FILE_VERSION_ERROR: 'Create file version',
        RECEIVE_FILE_UPDATE_ERROR: 'Receive file update',
        FETCH_FILE_VERSIONS_ERROR: 'Fetch file versions',
        SHARE_FILE_ERROR: 'Share file contents from another cluster',
        REQUEST_ACCESS_TO_FILE_ERROR: 'Request access to file error',
        EXPORT_FILE_ERROR: 'Exports file error from another cluster',
        ARCHIVE_FILE_ERROR: 'Archive file error from another cluster',
        DETERMINE_FILE_TYPE_ERROR: 'Determining file type is causing an error',
        IMPORT_FILE_ERROR: 'Import file error'
    },
    Crypto: {
        DEFAULT: "Error reading crypto configuration file",
        FETCH_CRYPTO_SUCCESS: "Crypto fetched successfully",
        
        FETCH_CRYPTOS_SUCCESS: 'Fetching cryptos...',
        FETCH_CRYPTO_FAILURE: "Error fetching crypto. Please try again",
        FETCH_CRYPTO_REQUEST: "Fetching crypto..",
        UPDATE_CRYPTO_SUCCESS: "Crypto updated successfully",
        UPDATE_CRYPTO_FAILURE: "Error updating crypto. Please try again",
        UPDATE_CRYPTO_REQUEST: "Updating crypto..",
        CREATE_CRYPTO_SUCCESS: "Crypto created successfully",
        CREATE_CRYPTO_FAILURE: "Error creating crypto. Please try again",
        CREATE_CRYPTO_REQUEST: "Creating crypto..",
        DELETE_CRYPTO_SUCCESS: "Crypto deleted successfully",
        DELETE_CRYPTO_FAILURE: "Error deleting crypto. Please try again",
    },
    // Chat and User
    ChatMessage: {
        DEFAULT: "New chat message received",
        CHAT_MENTION: "You were mentioned in a chat",
        CHAT_ARCHIVED: "Chat archived successfully",
        CHAT_PINNED: "Chat message pinned successfully",
        CHAT_DELETED: "Chat message deleted successfully",
        CHAT_EDITED: "Chat message edited successfully",
        CHAT_FORWARD_SUCCESS: "Chat message forwarded successfully",
        CHAT_UNDO_DELETE: "Chat message deletion undone successfully",
        CHAT_REACTION_ADDED: "Reaction added to chat message",
        CHAT_REACTION_REMOVED: "Reaction removed from chat message",
        // Add more messages for the NewChatMessage type
    },
    // Calendar Events
    CalendarEvents: {
        DEFAULT: "Error in Calendar Events",
        EVENTS_UPDATE_SUCCESS: "Updated Calendar Events",
        MILESTONES_UPDATE_SUCCESS: "Successfully updated milestone",
        ADD_EVENT_SUCCESS: "Calendar event added successfully",
        ADD_EVENT_ERROR: "Failed to add calendar event",
        FETCH_EVENTS_SUCCESS: "Calendar events fetched successfully",
        FETCH_EVENTS_ERROR: "Failed to fetch calendar events",
        REMOVE_EVENT_SUCCESS: "Calendar event removed successfully",
        REMOVE_EVENT_ERROR: "Failed to remove calendar event",
        REASSIGN_EVENT_ERROR: "Failed to reassign calendar event",
        REASSIGN_EVENT_SUCCESS: "Calendar event reassigned successfully",
        COMPLETE_ALL_EVENTS_ERROR: "Failed to complete all calendar events",
        COMPLETE_ALL_EVENTS_SUCCESS: "All calendar events completed successfully",
        EVENT_REMINDER_SUCCESS: "Calendar event was successfully",
        EVENT_REMOVED_SUCCESS: '"Calendar event was removed successfully"',
        UPDATE_EVENT_SUCCESS: "Calendar event updated successfully",
        UPDATE_EVENT_TITLE_SUCCESS: "Updated event title",
        UPDATE_EVENT_ERROR: "Failed to update calendar event",
        SHARE_EVENT_ERROR: "Failed to share calendar event",
        // Add more messages for other calendar events actions
    },
    // Communication and Collaboration
    Communication: {
        START_SUCCESS: "Communication started successfully",
        END_SUCCESS: "Communication ended successfully",
        COLLABORATE_SUCCESS: "Collaboration successful",
        // Add more messages for communication and collaboration
    },
    // Custom Notifications
    CustomNotification1: {
        DEFAULT: "Notification message: CustomNotification1",
        // Add more messages for the CustomNotification1 type
    },
    CustomNotification2: {
        DEFAULT: "Notification message: CustomNotification2",
        // Add more messages for the CustomNotification2 type
    },
    // Data
    Data: {
        DEFAULT: "Loading data..",
        PAGE_LOADING: "Loading page..",
        ERROR_EXPORTING_DATA: "Error exporting data. Please try again",
        UPLOAD_DATA_SUCCESS: 'Uploadiing data successful'
        // Add more messages for the DataLoading type
    },
    Database: {
        DEFAULT: "Database loading...",
        CONNECTED: "Connected to database",
        CONNECTING_SUCCESS: "Connected to database",
        DISCONNECTED: "Disconnected from database",
        ERROR_CONNECTING: "Error connecting to database",
        ERROR_DISCONNECTING: "Error disconnecting from database",
        QUERY_SUCCESS: "Database query succeeded",
        QUERY_ERROR: "Error executing database query",
    },
    DataAnalysis: {
        DEFAULT: "Error in Data Analysis ",
        FETCH_ERROR: "Error fetching data analysis. Please try again",
        UPLOAD_ERROR: "Error uploading data analysis. Please try again",
        UPDATE_ERROR: "Error updating data analysis. Please try again",
        REMOVE_ERROR: "Error removing data analysis. Please try again",
        SET_DATA_ANALYSIS_PHASE_SUCCESS: "Data analysis phase set successfully",
        SET_DATA_ANALYSIS_PHASE_ERROR: "Error setting data analysis phase. Please try again",
        SET_DATA_ANALYSIS_PHASE_ERROR_INVALID_PHASE: "Invalid data analysis phase. Please try again",
        ANALYZE_DATA_SUCCESS: "Success analyzing data",
        ANALYZE_DATA_ERROR: "Error tryiing to analyze data",
        FETCH_ANALYSIS_RESULTS_ERROR: "Error fetching data analysis results", 
        // Add more messages for the DataAnalysis type
        // You can customize the messages based on your application's needs
    },
    Details: {
        DEFAULT: "Error in Details Service",
        ERROR: "Error fetching details. Please try again",
        UPDATE_DETAILS_ITEM_ERROR: "Error updating details item. Please try again",
        UPDATE_DETAILS_ITEM_SUCCESS: "Details item updated successfully",
        FETCH_DETAILS_ITEMS_SUCCESS: "Details items fetched successfully",
        FETCH_DETAILS_ITEMS_ERROR: "Error fetching details items. Please try again",
        FETCH_DETAILS_ITEM_SUCCESS: "Details item fetched successfully",
        FETCH_DETAILS_ITEM_ERROR: "Error fetching details item. Please try again",
        UPDATE_DETAILS_ITEMS_SUCCESS: "Details items updated successfully",
        UPDATE_DETAILS_ITEMS_ERROR: "Error updating details items. Please try again",
        DELETE_DETAILS_ITEMS_SUCCESS: "Details items deleted successfully",
        DELETE_DETAILS_ITEMS_ERROR: "Error deleting details items. Please try again",
        INVALID_NAME: "Name contains invalid characters",
        TOO_LONG: "Name is too long",
        TAKEN: "Name is already taken",
        // other details messages
    },
    DEX: {
        FETCH_DEX_DATA_ERROR: "Error fetching dex data",
        FETCH_EXCHANGE_DATA_ERROR: "Error fetching exchange data",
    },
    Document: {
        HANDLE_DOCUMENT_ERROR: "Failed to perform action",
        UPDATE_DOCUMENT_SUCCESS: "Document successfully updated",
        UPDATE_DOCUMENT_ERROR: "Error updating document",
        SORT_DOCUMENT_SUCCESS: "Documents have been sorted",
        SHARE_DOCUMENT_SUCCESS: "Documents have been sorted",
        SORT_DOCUMENT_ERROR: "Documents have not been sorted, please try again",
        DELETE_DOCUMENT_SUCCESS: "Document deleted successfully",
        DELETE_DOCUMENT_ERROR: "Document could not be deleted",
        DOCUMENT_NOT_FOUND: "Document not found",
        SHARE_DOCUMENT_ERROR: "Share document could not be found",
        ADD_DOCUMENT_SUCCESS: "Document has been added",
        FILTER_DOCUMENTS_SUCCESS: "Documents have been filtered",
        FILTER_DOCUMENTS_ERROR: "Documents have not been filtered, please try again",
        RESTORE_DOCUMENT_SUCCESS: "Documents have been restored",
        RESTORE_DOCUMENT_ERROR: "Restore document could not be found",
        ARCHIVE_DOCUMENT_ERROR: "Archive document could not be found",
        DOWNLOAD_DOCUMENT_SUCCESS: "Download document success",
        DOWNLOAD_DOCUMENT_ERROR: "Download document error",
        FETCH_DOCUMENT_FROM_ARCHIVE_SUCCESS: 'Fetched document from archive is successfully',
        FETCH_DOCUMENT_FROM_ARCHIVE_ERROR: 'Error fetching document from archive',
        FETCH_FROM_ARCHIVE_ERROR: 'Error fetching from the archive',
        EXPORT_DOCUMENTS_SUCCESS: "Exported documents have been successfully downloaded",
        EXPORT_DOCUMENTS_ERROR: "Error exporting documents. Please try again",
        EXPORT_DOCUMENT_ERROR: "Error exporting document. Please try again",
        IMPORT_DOCUMENTS_SUCCESS: "Imported documents have been successfully imported",
        IMPORT_DOCUMENTS_ERROR: "Error importing documents. Please try again",
        ARCHIVE_DOCUMENT_SUCCESS: "Archive document has been successfully downloaded",
    },
    Entities: {
        SET_SUCCESS: "Set entity success",
    },
    // Error and Authentication
    Error: {
        DEFAULT: "\"Error marking task as complete\"",
        INVALID_CREDENTIALS: "Invalid credentials. Please try again",
        ERROR_UPDATING_DATA: "Error updating data. Please try again later",
        ERROR_REMOVING_DATA: "Error removing data. Please try again",
        ERROR_FETCHING_DATA: "Error fetching data. Please try again later",
        PROCESSING_BATCH: "Processing batch of notifications..",
        NETWORK_ERROR: "Error connecting to notification server. Please check your network connection and try again",
        UI_THEME: "User theme did no upate as expected",
        // Add more messages for the Error type
        BROWSER_CHECKER_ERROR: "There was an error connecting to the browser. Please check your network connection and try again.",
        ONBOARDING_ERROR: "Error in the onboarding process. Please try again",
        ERROR_FETCHING_TASK: "Error fetching task. Please try again",
        TASK_NOT_FOUND: "Task not found",
        FETCH_HIGHLIGHTS_ERROR: "Error fetching highlighting",
        DATA_NOT_FOUND: 'Data not found'
    },
    // Event-related
    Event: {
        DEFAULT: "Event reminder",
        EVENT_OCCURRED: "An event has occurred",
        FETCH_EVENT_DETAILS_SUCCESS: "Event details have been fetched successfully",
        FETCH_EVENT_DETAILS_ERROR: "Error fetching vent details",
        CREATE_EVENT_SUCCESS: "Event created successfully",
        CREATE_EVENT_ERROR: "Error creating event",
        FETCH_EVENT_DATA_ERROR_ID: "Event data error",
        CREATE_EVENT_DATA_ERROR_ID: "Error creating event data"
        // Add more messages for the EventReminder type
    },
    FeatureToggle: {
        DEFAULT: "Feature toggle updated",
        FEATURE_ENABLED: "Feature enabled",
        FEATURE_DISABLED: "Feature disabled",
        FEATURE_DELETED: "Feature deleted",
        FEATURE_CREATED: "Feature created",
        FEATURE_UPDATED: "Feature updated",
        FEATURE_IMPORT_SUCCESS: "Feature import successful",
        FEATURE_IMPORT_FAILURE: "Feature import failed",
        FEATURE_EXPORT_SUCCESS: "Feature import successful",
        FEATURE_EXPORT_FAILURE: "Feature export failed",
        FEATURE_EXPORT_DOWNLOAD_SUCCESS: "Feature export download successful",
        FEATURE_EXPORT_DOWNLOAD_FAILURE: "Feature export download failed",
        FEATURE_EXPORT_DOWNLOAD_STARTED: "Feature export download started",
        FEATURE_EXPORT_DOWNLOAD_PROGRESS: "Feature export download progress",
        FEATURE_EXPORT_DOWNLOAD_COMPLETE: "Feature export download complete",
        FEATURE_EXPORT_DOWNLOAD_CANCELLED: "Feature export download cancelled",
        FEATURE_EXPORT_DOWNLOAD_ERROR: "Feature export download error",
        FEATURE_EXPORT_DOWNLOAD_ABORTED: "Feature export download aborted",
        FEATURE_EXPORT_DOWNLOAD_TIMEOUT: "Feature export download timeout",
        FEATURE_EXPORT_DOWNLOAD_REJECTED: "Feature export download rejected",
        FEATURE_EXPORT_DOWNLOAD_RESOLVED: "Feature export download resolved",
        ENABLE_SUCCESS: "Feature enabled successfully",
        DISABLE_SUCCESS: "Feature disabled successfully",
    },
    Freelancer: {
        SUBMIT_PROPOSAL_ERROR: "Error submitting proposal",
        JOIN_PROJECT_ERROR: "Error joining project",
    },
    FrontendStructure: {
        DEFAULT: "Frontend structure operation completed",
        ERROR_GETTING_STRUCTURE: "Error getting frontend structure",
        ERROR_TRAVERSING_DIRECTORY: "Error traversing the directory",
        // Add more messages for the BackendStructure type
    },
    Generators: {
        TASK_ID_GENERATED: "Generated Task ID",
        TODO_ID_GENERATED: "Generated Todo ID",
        GENERATE_UNIQUE_ID: "Generated Unique ID",
        GENERATE_PROJECT_ID: "Generated Project ID",
        GENERATE_USER_ID: "Generated User ID",
        GENERATE_TEAM_ID: "Generated Team ID",
        GENERATE_ELEMENT_ID: "Generated Element ID",
        GENERATE_COMPONENT_ID: "Generated Component ID",
        GENERATE_FUNCTIONALITY_ID: "Generated Functionality ID",
        GENERATE_CARD_ID: "Generated Card ID",
        GENERATE_TABLE_ID: "Generated Table ID",
        GENERATE_AUDIO_CHANNEL_ID: "Generated Audio ID",
        GENERATE_VIDEO_CHANNEL_ID: "Generated Video ID",
        GENERATE_TEXT_CHANNEL_ID: "Generated Text ID",
        GENERATE_PHASE_ID: "Generated Phase ID",
        GENERATE_DOCUMENT_ID: "Generated Document ID",
        GENERATE_TASKBOARD_ID: "Generated Taskboard ID",
        GENERATE_BRAINSTORMING_SESSION_ID: "Generated Bundle ID",
        GENERATE_CONTRIBUTION_ID: "Generated Component ID",
        GENERATE_PROJECT_REVENUE_ID: "Generated Project",
        GENERATE_VERSION_ID: "Generated Version ID",
    },
    // Generic Messages
    Generic: {
        DEFAULT: "Notification message..",
        ERROR: "An error occurred. Please try again later",
        NO_RESPONSE: "No response from API",
        // Add more generic messages
    },
    Highlight: {
        ADD_HIGHLIGHT_ERROR: 'Adding highlighting was not done.',
        DELETE_HIGHLIGHT_ERROR: 'Error trying to remove highlighting.'
    },
    Info: {
        DEFAULT: "Error in Action Manager",
        GENERAATED_INFO_ITEMS_SUCCESS: "Info items generated successfully",
        GENERAATED_INFO_ITEMS_ERROR: "Error generating info items. Please try again",
    },
    Launch: {
        SET_LAUNCH_PHASE_SUCCESS: "Info items generated successfully",
        SET_LAUNCH_PHASE_ERROR: "Error generating info items. Please try again",
    },
    Logger: {
        DEFAULT: "Log message",
        LOG_INFO: "Info log message",
        LOG_DEBUG: "Debug log message",
        LOG_ERROR: "Error log message",
        LOG_WARNING: "Warning log message",
        LOG_SUCCESS: "Success log message",
        LOG_FAILURE: "Failure log message",
        LOG_INFO_SUCCESS: "Info items generated successfully",
        LOG_INFO_ERROR: "Error generating info",
        LOG_WARNING_SUCCESS: "Warning items generated successfully",
        LOG_WARNING_ERROR: "Error generating info items",
        LOG_SUCCESS_ERROR: "Warning log message",
        LOG_FAILURE_ERROR: "Error log message",
    },
    Login: {
        LOGIN_SUCCESS: "Admin login successful",
        LOGIN_FAILURE: "Admin login failed",
    },
    // Warning and Informational
    LowDiskSpace: {
        DEFAULT: "Low disk space warning",
        DATA_LIMIT_APPROACHING: "Data limit is approaching",
        // Add more messages for the LowDiskSpace type
    },
    Markers: {
        DEFAULT: "Marker added successfully",
        MARKER_UPDATED: "Marker updated successfully",
        MARKER_REMOVED: "Marker removed successfully",
        MARKER_ADD_ERROR: "Error adding marker. Please try again",
        MARKER_UPDATE_ERROR: "Error updating marker. Please try again",
        MARKER_FETCH_ERROR: "Error fetching markers. Please try again",
        MARKER_REMOVE_ERROR: "Error removing marker. Please try again",
    },
    Meeting: {
        MEETING_UPDATE_SUCCESS: "Meeting updated successfully",
        MEETING_UPDATE_FAILED: "Meeting updated failed, try again, if the issue persist, do message use ",
    },
    Member: {
        INVITE_MEMBER_ERROR: "Failed to invite member",
    },
    MessagingSystem: {
        DEFAULT: "New message received", // Default message for the messaging system
        MESSAGE_SENT: "Your message has been sent successfully",
        // Add more messages for the MessagingSystem type
    },
    Metadata: {
        ///add messages
    },
    Milestones: {
        ADD_SUCCESS: "Added successfully",
        REMOVE_SUCCESS: "Removed successfully",
        UPDATE_TITLE_SUCCESS: "Updated successfully",
        CLEAR_ALL_SUCCESS: "Cleared all milestones",
    },
    NamingConventionsError: {
        DEFAULT: "Error in Define Naming Conventions (".concat(typeof errorType, "): ").concat(typeof details),
        // New Error Messages for Naming Conventions
        INVALID_NAME_FORMAT: "Invalid name format. Please follow the specified conventions",
        DUPLICATE_NAME: "Duplicate name found. Choose a unique name",
        // Add more messages for the NamingConventionsError type
    },
    NO_NOTIFICATIONS: {
        DEFAULT: "NO NOTIFICATION WENT OFF.",
        NOTIFICATION_LOADING: "Loading notifications..",
    },
    Notifications: {
        DEFAULT: "Error in Notifications",
        NOTIFICATION_SENT: "Notification sent successfully",
        NOTIFICATION_SENT_SUCCCESS: "Notification sent successfully",
        NOTIFICATION_SEND_FAILED: "Failed to send notification. Please try again later",
        REMOVE_SUCCESS: "Sent notification successfully",
        ADD_SUCCESS: "Sent notification successfully",
        CLEAR_ALL_SUCCESS: "Sent notification successfully",
        UPDATE_MESSAGE_SUCCESS: "Sent notification successfully",
    },


    Notification: {
        ERROR: {
        default: "An error occurred",
        apiError: "API Error",
        validationError: "Validation Error",
        networkError: "Network Error"
        },
        INFO: {
        default: "Information",
        logInfo: "Info logged successfully",
        apiRequest: "API request completed"
        },
        SUCCESS: {
        default: "Success",
        logSuccess: "Success logged",
        operationComplete: "Operation completed successfully"
        },
        WARNING: {
        default: "Warning",
        validationWarning: "Validation Warning",
        performanceWarning: "Performance Warning"
        },
        LOGGING_ERROR: {
        default: "Logging Error",
        logFailure: "Failed to log message",
        apiLogError: "API Logging Error"
        }
    },
    // Success and Operation
    OperationSuccess: {
        DEFAULT: "Operation successful",
        PAYMENT_RECEIVED: "Payment received successfully",
        ONBOARDING_SUCCESS: "Onboarding process completed successfully",
        // Add more messages for the OperationSuccess type
    },
    Onboarding: {
        DEFAULT: "Welcome to the onboarding process!",
        QUESTIONNAIRE_SUBMITTED: "Questionnaire submitted successfully",
        PROFILE_SETUP_SUCCESS: "Profile setup completed successfully",
        PROFILE_SETUP_ERROR: "Error in profile setup. Please try again later",
        TRANSITION_TO_OFFER: "Transitioning to the offer phase",
    },
    Persona: {
        DEFAULT: "Error in Personas",
        WELCOME: "Welcome to the Persona Builder!",
        QUESTIONNAIRE_COMPLETE: "Thank you for completing the questionnaire!",
        BUILDER_CREATION_ERROR: "Error creating persona builder. Please try again",
        // Add more personalized messages for the PersonMessages type
    },
    Phase: {
        FETCH_PHASE_ERROR: "Error fetching phases. Please try again",
        UPDATE_PHASE_ERROR: "Error updating phase. Please try again",
        SAVE_PHASE_ERROR: "Error saving phase. Please try again",
    },
    Preferences: {
        DEFAULT: "Preferences updated successfully",
        DEFAULT_SETTINGS_ERROR: "Error updating default settings. Please try again",
        FETCH_PREFERENCES_ERROR: "Error fetching preferences. Please try again",
        UPDATE_PREFERENCES_ERROR: "Error updating preferences. Please try again",
        FETCH_PREFERENCES_SUCCESS: "Preferences fetched successfully",
        UPDATE_PREFERENCES_SUCCESS: "Preferences updated successfully",
        FETCH_PREFERENCES_REQUEST: "Fetching preferences..",
        UPDATE_PREFERENCES_REQUEST: "Updating preferences..",
        ERROR_REMOVING_PREFERENCES: "Error removing preferences. Please try again",
        SUCCESS_REMOVING_PREFERENCES: "Preferences removed successfully",
        PREFERENCE_SAGAS_ERROR: "Error in preferences sagas. Please try again",
    },
    Projects: {
        PROJECT_FETCH_ERROR: "Error fetching projects",
        FETCH_PROJECT_DETAILS: "Error fetching projects details",
        FETCH_PROJECT_DETAILS_SUCCESS: "Project details have been fetched successfully",
    },
    ProjectOwner: {
        CREATE_PROJECT_ERROR: "Error creating project",
        CREATE_PROJECT_SUCCESS: "Project created successfully",
        INVITE_MEMBER_SUCCESS: "user has been successfully invited to the projcet",
        INVITE_MEMBER_ERROR: "There was an error inviting user to project",
        DELETE_PROJECT_ERROR: "Error deleting project",
        DELETE_PROJECT_SUCCESS: "Project deleted successfully",
        UPDATE_PROJECT_SUCCESS: "Project updated successfully",
        UPDATE_PROJECT_ERROR: "Error updating project",
        ADD_TEAM_MEMBER_SUCCESS: "Team member added successfully",
        ADD_TEAM_MEMBER_ERROR: "Error trying to add team member, please try again",
        REMOVE_TEAM_MEMBER_SUCCESS: "Team member removed successfully",
        REMOVE_TEAM_MEMBER_ERROR: "Team member removed successfully",
        ASSIGN_TASK_SUCCESS: "Team assignments successfully",
        ASSIGN_TASK_ERROR: "Team assignment, please try again",
        CREATE_MEETING_SUCCESS: "Created meeting successfully",
        CREATE_MEETING_ERROR: "Error Creating meeting, please try again",
        UPDATE_MEETING_SUCCESS: "Success updating meeting information",
        UPDATE_MEETING_ERROR: "Error trying to update meeting content, please try again",
        DELETE_MEETING_SUCCESS: "Meeting has been deleted successfully",
        DELETE_MEETING_ERROR: "Was not able to delete meeting, please try again",
        GENERATE_REPORT_SUCCESS: "Generated report successfully",
        GENERATE_REPORT_ERROR: "Error generating report, please try again",
        EXPORT_DATA_SUCCESS: "Report successfully exported data successfully",
        EXPORT_DATA_ERROR: "Error exporting data, try again",
        GET_TEAM_MEMBERS_SUCCESS: "Getting teammembers...",
        GET_TEAM_MEMBERS_ERROR: "Error trying to retrieve teammembers, please try again",
        UPDATE_TASK_SUCCESS: "Update task successfully",
        UPDATE_TASK_ERROR: "Error updating task, please try again",
        DELETE_TASK_SUCCESS: "Deleting task successfully",
        DELETE_TASK_ERROR: "Error deleting task, please try again",
        FETCH_PROJECT_DETAILS_ERROR: "Error trying to retrieve project details",
        FETCH_PROJECT_DETAILS_SUCCESS: "Fetch project details successfully",
        HIRE_DEVELOPER_SUCCESS: 'Hire Developer success',
        HIRE_DEVELOPER_ERROR: 'hire develop error',
        COMPENSATE_DEVELOPER_SUCCESS: 'Compensated developer successfully',
        COMPENSATE_DEVELOPER_ERROR: 'Error paying developer',
        SELECT_DEVELOPER_SUCCESS: 'Successfully selected a developer',
        SELECT_DEVELOPER_ERROR: 'Error selecttng developer',
        INITIATE_IDEATION_PHASE_SUCCESS: 'Initiating ideation phase waas sccessful',
        INITIATE_IDEATION_PHASE_ERROR: 'Error trying to initiate ideation phase',
        FORM_TEAM_SUCCESS: 'Forming team success',
        FORM_TEAM_ERROR: 'Error trying to from the team',
        BRAINSTORM_PRODUCT_SUCCESS: 'Brainstormng product successful',
        BRAINSTORM_PRODUCT_ERROR: 'Error trying to set up brain stormng product',
        LAUNCH_PRODUCT_SUCCESS: 'Launching  product successful',
        LAUNCH_PRODUCT_ERROR: 'Error trying to set up brain stormng product',
        PERFORM_DATA_ANALYSIS_SUCCESS: 'Performng data analysis is successful',
        PERFORM_DATA_ANALYSIS_ERROR: 'Error trying to perform data analysis',
    },
    Prompts: {
        FETCH_PROMPTS_REQUEST: "Fetching prompts..",
        FETCH_PROMPTS_SUCCESS: "Prompts fetched successfully",
        FETCH_PROMPTS_FAILURE: "Failed to fetch prompts. Please try again",
    },
    RandomWalk: {
        FETCH_WALK_SUCCESS: "Random walk completed successfully",
        FETCH_WALK_ERROR: "Error fetching random walk. Please try again",
    },
    Registration: {
        REGISTRATION_SUCCESS: "Registration successful",
    },
    Sagas: {
        DEFAULT: "Error in Saga",
        FETCHING_SAGA: "Fetching saga..",
        FETCHING_SAGA_ERROR: "Error fetching saga. Please try again",
        CREATING_SAGA: "Creating saga..",
        CREATING_SAGA_ERROR: "Error creating saga. Please try again",
        SUCCESS_CREATING_SAGA: "Saga created successfully",
        SUCCESS_FETCHING_SAGA: "Saga fetched successfully",
        SUCCESS_UPDATING_SAGA: "Saga updated successfully",
        SUCCESS_DELETING_SAGA: "Saga deleted successfully",
        UPDATING_SAGA: "Updating saga..",
        UPDATING_SAGA_ERROR: "Error updating saga. Please try again",
        DELETING_SAGA: "Deleting saga..",
        DELETING_SAGA_ERROR: "Error deleting saga. Please try again",
        SUCCESS_FETCHING_SAGAS: "Sagas fetched successfully",
        FETCHING_SAGAS: "Fetching sagas..",
        FETCHING_SAGAS_ERROR: "Error fetching sagas. Please try again",
        ROOT_SAGA_ERROR: "Error in root saga. Please try again",
    },
    Snapshot: {
        DEFAULT: "Error in Snapshots",
        FETCHING_SNAPSHOTS: "Fetching snapshots..",
        UPDATING_SNAPSHOT: "Updating snapshot..",
        FETCHING_SNAPSHOTS_ERROR: "Error fetching snapshots. Please try again",
        UPDATING_SNAPSHOTS: "Updating snapshots..",
        CREATED: "Snapshot created successfully",
        SNAPSHOT_TAKEN: "Snapshot taken successfully",
        Error: "Error creating snapshot. Please try again",
    },
    StateGovCities: {
        DEFAULT: "Error in \"State/Government Cities",
        ERROR_FETCHING_CITIES: "Error fetching state/government cities. Please try again",
        SUCCESS_FETCHING_CITIES: "State/government cities fetched successfully",
        SUCCESS_REMOVING_CITY: "State/government city removed successfully",
        SUCCESS_UPDATING_CITY: "State/government city updated successfully",
        SUCCESS_ADDING_NEW_CITY: "New state/government city added successfully",
        // Add more messages for the StateGovCities type
    },
    Tasks: {
        DEFAULT: "Error in Tasks",
        TASK_ADDED: "Task added successfully",
        TASK_DELETED: "Task deleted successfully",
        TASK_UPDATED: "Task updated successfully",
        COMPLETED: "Task marked as complete successfully!",
        // New Error Messages for Tasks
        TASK_DUPLICATE_ERROR: "Duplicate task found. Please choose a different name",
        TASK_ASSIGN_ERROR: "Error assigning task. Please try again",
        TASK_ADD_ERROR: "Error adding task. Please try again",
        TASK_UPDATE_ERROR: "Task did not update successfully, please try again",
        TASK_FETCH_ERROR: "Error fetching tasks. Please try again",
        TASK_REMOVE_ERROR: "Error removing task. Please try again",
        COMPLETE_ALL_TASKS_ERROR: "Error completing all tasks. Please try again",
        TASK_TOGGLE_ERROR: "Error toggling task status. Please try again",
        USER_GENERATED_SUCCESS: "User-generated task was successful",
        SYSTEM_GENERATED_SUCCESS: "System-generated task was successful",
        USER_GENERATED_ERROR: "Error in user-generated task",
        SYSTEM_GENERATED_ERROR: "Error in system-generated task",
        // New Error Messages for Tasks
    },
    TeamBuildingPhase: {
        DEFAULT: "Error in Team Building Phase",
        FETCHING_TEAM_BUILDING_PHASE: "Fetching team building phase..",
        FETCHING_TEAM_BUILDING_PHASE_ERROR: "Error fetching team building phase. Please try again",
        CREATING_TEAM_BUILDING_PHASE: "Creating team building phase..",
        CREATING_TEAM_BUILDING_PHASE_ERROR: "Error creating team building phase. Please try again",
        SUCCESS_CREATING_TEAM_BUILDING_PHASE: "Team building phase created successfully",
        SUCCESS_FETCHING_TEAM_BUILDING_PHASE: "Team building phase fetched successfully",
        SUCCESS_UPDATING_TEAM_BUILDING_PHASE: "Team building phase updated successfully",
        SUCCESS_DELETING_TEAM_BUILDING_PHASE: "Team building phase deleted successfully",
    },
    Theme: {
        DEFAULT: "Theme updated successfully",
        DEFAULT_SETTINGS_ERROR: "Error updating default settings. Please try again",
        FETCH_THEME_ERROR: "Error fetching theme. Please try again",
        UPDATE_THEME_ERROR: "Error updating theme. Please try again",
        FETCH_THEME_SUCCESS: "Theme fetched successfully",
        UPDATE_THEME_SUCCESS: "Theme updated successfully",
        FETCH_THEME_REQUEST: "Fetching theme..",
        UPDATE_THEME_REQUEST: "Updating theme..",
        ERROR_REMOVING_THEME: "Error removing theme. Please try again",
        SUCCESS_REMOVING_THEME: "Theme removed successfully",
    },
    Toolbar: {
        DEFAULT: "New item added to toolbar",
        ITEM_SELECTED: "Item selected in toolbar",
        ITEM_REMOVED: "Item removed from toolbar",
        ITEM_UPDATED: "Item updated in toolbar",
        FETCHING_TOOLBAR_ITEMS: "Fetching toolbar items...",
        ADDED_TOOLBAR_ITEM: "Toolbar item added successfully",
        FAILED_TO_ADD_TOOLBAR_ITEM: "Failed to add toolbar item",
        ERROR_ADDING_TOOLBAR_ITEM: "Error adding toolbar item",
        REMOVED_TOOLBAR_ITEM: "Toolbar item removed successfully",
        ERROR_REMOVING_TOOLBAR_ITEM: "Error removing toolbar item",
        UPDATED_TOOLBAR_ITEM: "Toolbar item updated successfully",
        ERROR_UPDATING_TOOLBAR_ITEM: "Error updating toolbar item",
    },
    // Team-related
    Team: {
        DEFAULT: "Error in Teams",
        //success
        ASSIGN_TEAM_MEMBER_FAILURE: "Failed to assign team member. Please try again",
        CREATE_TEAM_SUCCESS: "Team created successfully",
        DELETE_TEAM_SUCCESS: "Team deleted successfully",
        REMOVE_TEAM_SUCCESS: "Removed team successfully",
        UPDATE_TEAM_SUCCESS: "Updated team successfully",
        FETCH_TEAM_MEMBERS_SUCCESS: "Fetched team members",
        ADD_TEAM_SUCCESS: "Team added successfully",
        FETCH_TEAM_DATA_SUCCESS: "Fetched team data successfully",
        //failure
        ADD_TEAM_ERROR: "Error adding team. Please try again",
        FETCH_TEAM_ERROR: "Error fetching team. Please try again",
        CREATE_TEAM_FAILURE: "Failed to create team. Please try again",
        DELETE_TEAM_FAILURE: "Failed to delete team. Please try again",
        FETCH_TEAM_MEMBERS_ERROR: "Fetched team members was not successfully",
        FETCH_TEAM_DATA_ERROR: "Failed to fetch team",
        // Add more messages for the TeamLoading type
        UPDATE_TEAM_ERROR: "Error updating team. Please try again",
        REMOVE_TEAM_ERROR: "Error removing team. Please try again",
        UPDATE_TEAM_MEMBERS_SUCCESS: "Updated team member was successfully updated",
        //Batch
        FETCH_TEAMS_SUCCESS: "Fetched teams successfully",
        FETCH_TEAMS_ERROR: "Error fetching teams. Please try again",
        UPDATE_TEAMS_ERROR: "Error updating teams. Please try again",
    },
    TeamManagement: {
        DEFAULT: "Error in Teams",
        //success
        ASSIGN_TEAM_MEMBER_FAILURE: "Failed to assign team member. Please try again",
        CREATE_TEAM_SUCCESS: "Team created successfully",
        DELETE_TEAM_SUCCESS: "Team deleted successfully",
        DELETE_TEAM_FAILURE: "Failed to delete team. Please try again",
        FETCH_TEAM_ERROR: "Error fetching team. Please try again",
        FETCH_TEAMMEMBER_SUCCESS: "Fetched team member successfully",
        FETCH_TEAMMEMBER_FAILURE: "Failed to fetch team member. Please try again",
    },
    Todos: {
        DEFAULT: "Error in Tasks (".concat(typeof errorType, "): ").concat(typeof details),
        Error: "Error",
        TODO_ADDED: "Todo added successfully",
        TODO_DELETED: "Todo deleted successfully",
        TODO_UPDATED: "Todo updated successfully",
        TODO_DUPLICATE_ERROR: "Duplicate todo found. Please choose a different name",
        TODO_ASSIGN_ERROR: "Error assigning todo. Please try again",
        TODO_ADD_ERROR: "Error adding todo. Please try again",
        TODO_UPDATE_ERROR: "Todo did not update successfully, please try again",
        TODO_FETCH_ERROR: "Error fetching todo. Please try again",
        TODO_REMOVE_ERROR: "Error removing todo. Please try again",
        COMPLETE_ALL_TODOS_ERROR: "Error completing all todo. Please try again",
        TODO_TOGGLE_ERROR: "Error toggling todo status. Please try again",
        BATCH_ASSIGN_ERROR: "Error assigning todos in batch. Please try again",
        ASSIGN_TEAM_SUCCESS: 'Assign team success.',
        
    },

    User: {
        FETCH_USER_ERROR: "Error fetching user data. Please try again later",
        ASSIGN_USER_FAILURE: "Failed to assign user. Please try again",
        UPDATE_USER_ERROR: "Error updating user data. Please try again later",
    },
    // User Profile
    UserProfile: {
        PROFILE_SAVING: "Saving user profile..",
        PROFILE_SAVED: "User profile saved successfully!",
        PROFILE_SAVING_SUCCESS: "User profile saved successfully!",
        PROFILE_SAVING_ERROR: "Failed to save user profile. Please try again later.",
        PROFILE_FETCH_ERROR: "Error fetching user profile data. Please try again later.",
        // Add more messages for the UserProfile type
    },
    UserPreferences: {
        SET_THEME_ERROR: "Error setting theme. Please try again",
        SET_THEME_SUCCESS: "Theme set successfully!",
        SET_LANGUAGE_ERROR: "Error setting language. Please try again",
        SET_LANGUAGE_SUCCESS: "Language set successfully!",
        SET_IDEATION_PHASE_ERROR: "Error setting ideation phase. Please try again",
        FETCH_THEME_FAILURE: "Error getting theme. Please try again",
        FETCHING_PREFERENCES_ERROR: 'Error fetching preferences',
        USER_PREFERENCE_UPDATED_SUCCESS: 'User preference updated succefully.',
        USER_PREFERENCE_UPDATED_FAILED: 'User preference updated failed.',
        THEME_SET_SUCCESSFULLY: 'Theme set successful',
        THEME_SETTING_FAILED: 'Theme setting failed',
        FONT_SIZE_SETTING_FAILED: 'Font siize setting failed',
        IDEATION_PHASE_SET_SUCCESSFULLY: 'Ideation phase set successful',
        IDEATION_PHASE_SETTING_FAILED: 'Idea phase setting phase',
        USER_PREFERENCES_DELETED_SUCCESSFULLY: 'user preferences deleted',
        USER_PREFERENCES_DELETION_FAILED: 'User prefernces deletiion failed',
        BRAINSTORMING_PHASE_SET_SUCCESSFULLY: 'Brainstorming phase successfully set',
        BRAINSTORMING_PHASE_SETTING_FAILED: 'Brainstorming phase failed to set',
        LAUNCH_PHASE_SET_SUCCESSFULLY: 'launch phase set successfully',
        LAUNCH_PHASE_SETTING_FAILED: 'Setting launch phase failed',
        DATA_ANALYSIS_PHASE_SET_SUCCESSFULLY: 'Data analysiis phase was successfully set',
        DATA_ANALYSIS_PHASE_SETTING_FAILED: 'Settiing data analysiis phase failed',
        NOTIFICATION_PREFERENCES_SAVED_SUCCESSFULLY: 'Notification preferences saved successfully',
        NOTIFICATION_PREFERENCES_SAVING_FAILED: 'saving notification preferences failed',
    },
    Search: {
        SEARCH_ERROR: 'Error trying to search.'
    },
    Validation: {
        PERMISSION_ERROR: "You do not have permission to perform this action",
        INVALID_INPUT: "Invalid input. Please check your input and try again.",
        MISSING_FIELD: "Required field is missing. Please provide all required information.",
        FORMAT_ERROR: "Format error. Please enter data in the correct format.",
        // Add more validation error messages as needed
    },
    Version: {
        GENERATE_VERSION_ERROR_ID: "Generate version error ID",
    },
    VersionData: {
        FETCH_VERSION_DATA_SUCCESS: 'Fetching version data is a success',
        FETCH_VERSION_DATA_ERROR: 'Fetching version data has caused an error ',
    },
    Video: {
        DEFAULT: "Error in Videos",
        ADD_VIDEO_SUCCESS: "Video added successfully",
        UPLOAD_STARTED: "Video upload started",
        UPLOAD_COMPLETED: "Video upload completed",
        UPLOAD_FAILED: "Video upload failed. Please try again",
        PROCESSING_VIDEO: "Processing video..",
        PROCESSING_COMPLETE: "Video processed successfully",
        PROCESSING_FAILED: "Video processing failed. Please try again",
        CREATE_VIDEO_SUCCESS: "Video created successfully",
        CREATE_VIDEO_ERROR: "Error creating video. Please try again",
        FETCH_VIDEO_SUCCESS: "Video fetched successfully",
        FETCH_VIDEO_ERROR: "Error fetching video. Please try again",
        FETCH_VIDEOS_ERROR: "Error fetching video. Please try again",
        UPDATE_VIDEO_SUCCESS: "Video updated successfully",
        UPDATE_VIDEO_ERROR: "Error updating video. Please try again",
        ADD_VIDEO_ERROR: "Error adding video. Please try again",
        ADD_VIDEO_TAGS_SUCCESS: "Video tags added successfully",
        SEND_VIDEO_NOTIFICATION_ERROR: "Error sending video notification. Please try again",
        SEND_VIDEO_NOTIFICATION_SUCCESS: "Video notification sent successfully",
        SEND_NOTIFICATION_SUCCESS: "Notification sent successfully",
        SEND_NOTIFICATION_ERROR: "Error sending notification. Please try again",
        UPDATE_VIDEO_METADATA_SUCCESS: "Video metadata updated successfully",
        UPDATE_VIDEO_METADATA_ERROR: "Error updating video metadata. Please try again",
        DELETE_VIDEO_SUCCESS: "Video deleted successfully",
        DELETE_VIDEO_ERROR: "Error deleting video. Please try again",
        DISABLE_VIDEO_SUCCESS: "Video is disabled successfully",
        ENABLE_VIDEO_SUCCESS: "Video is enabled",
        PARTICIPANT_MANAGEMENT_ERROR: "Video management",
    },
    // Welcome and Account
    Welcome: {
        DEFAULT: "Error in Welcome",
        ACCOUNT_CREATED: "Your account has been successfully created",
        // Add more messages for the Welcome type
    },
    Token: {
        DEFAULT: "Error in Tokens",
        TOKEN_STAKED: "Tokens successfully staked",
        TOKEN_TRANSFERRED: "Tokens transferred successfully",
        TOKEN_SUPPLY_CAPPED: "Token supply has reached its cap",
        INSUFFICIENT_FUNDS: "Insufficient funds for the operation",
    },
    // Token-related
    TokenUtils: {
        DEFAULT: "Error in Tokens",
        TOKEN_STAKED: "Tokens successfully staked",
        TOKEN_TRANSFERRED: "Tokens transferred successfully",
        TOKEN_SUPPLY_CAPPED: "Token supply has reached its cap",
        INSUFFICIENT_FUNDS: "Insufficient funds for the operation",
        // Auth
        ERROR_GENERATING_TRANSFER_TOKEN: "Error generating transfer token. Please try again",
        SUCCESS_GENERATING_TRANSFER_TOKEN: "Transfer token generated successfully",
        // Add more messages for the TokenUtils type
    },
};

const _default = NOTIFICATION_MESSAGES;
export { _default as default , handleDynamicNotificationMessage, setDynamicNotificationMessageWrapper };
