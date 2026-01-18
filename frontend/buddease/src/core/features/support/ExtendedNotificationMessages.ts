// ExtendedNotificationMessages.ts
import NOTIFICATION_MESSAGES from "./NotificationMessages";

const EXTENDED_NOTIFICATION_MESSAGES = {
  ...NOTIFICATION_MESSAGES,
  Tasks: {
    // Core CRUD operations
    TASK_ADD_SUCCESS: 'Task added successfully!',
    TASK_ADD_ERROR: 'Failed to add task. Please try again.',
    
    TASK_FETCH_SUCCESS: 'Tasks loaded successfully!',
    TASK_FETCH_ERROR: 'Failed to load tasks. Please try again.',
    
    TASK_UPDATE_SUCCESS: 'Task updated successfully!',
    TASK_UPDATE_ERROR: 'Failed to update task. Please try again.',
    
    TASK_REMOVE_SUCCESS: 'Task removed successfully!',
    TASK_REMOVE_ERROR: 'Failed to remove task. Please try again.',
    
    TASK_TOGGLE_SUCCESS: 'Task status updated!',
    TASK_TOGGLE_ERROR: 'Failed to update task status. Please try again.',

    // Batch operations
    BATCH_UPDATE_SUCCESS: 'Tasks updated successfully!',
    BATCH_UPDATE_ERROR: 'Failed to update tasks. Please try again.',
    
    BATCH_REMOVE_SUCCESS: 'Tasks removed successfully!',
    BATCH_REMOVE_ERROR: 'Failed to remove tasks. Please try again.',

    // Assignment operations
    TASK_ASSIGN_SUCCESS: 'Task assigned successfully!',
    TASK_ASSIGN_ERROR: 'Failed to assign task. Please try again.',
    
    TASK_UNASSIGN_SUCCESS: 'Task unassigned successfully!',
    TASK_UNASSIGN_ERROR: 'Failed to unassign task. Please try again.',

    // Status operations
    COMPLETE_ALL_TASKS_SUCCESS: 'All tasks completed successfully!',
    COMPLETE_ALL_TASKS_ERROR: 'Failed to complete all tasks. Please try again.',
    
    MARK_TASK_COMPLETE_SUCCESS: 'Task marked as complete!',
    MARK_TASK_COMPLETE_ERROR: 'Failed to mark task as complete. Please try again.',

    // Priority operations
    TASK_PRIORITY_UPDATE_SUCCESS: 'Task priority updated!',
    TASK_PRIORITY_UPDATE_ERROR: 'Failed to update task priority. Please try again.',

    // Filter/Sort operations
    FILTER_TASKS_SUCCESS: 'Tasks filtered successfully!',
    FILTER_TASKS_ERROR: 'Failed to filter tasks. Please try again.',
    
    SORT_TASKS_SUCCESS: 'Tasks sorted successfully!',
    SORT_TASKS_ERROR: 'Failed to sort tasks. Please try again.',

    // Export operations
    EXPORT_TASKS_SUCCESS: 'Tasks exported successfully!',
    EXPORT_TASKS_ERROR: 'Failed to export tasks. Please try again.',

    // Analytics operations
    TASK_COUNTS_FETCH_SUCCESS: 'Task analytics loaded!',
    TASK_COUNTS_FETCH_ERROR: 'Failed to load task analytics. Please try again.',

    // Ideas operations
    TASK_IDEAS_UPDATE_SUCCESS: 'Task ideas updated successfully!',
    TASK_IDEAS_UPDATE_ERROR: 'Failed to update task ideas. Please try again.',

    // General notifications
    TASK_OPERATION_SUCCESS: 'Task operation completed successfully!',
    TASK_OPERATION_ERROR: 'Task operation failed. Please try again.',
    
    NO_TASKS_FOUND: 'No tasks found matching your criteria.',
    TASKS_LOADING: 'Loading tasks...',
    TASKS_LOADED: 'Tasks loaded successfully!'
  },
  IdleTimeout: {
    SESSION_EXPIRING: 'Your session is about to expire. Click OK to continue.',
    LOGOUT_SUCCESS: 'User has been logged out successfully.',
    LOGOUT_ERROR: 'Error logging out. Please try again.',
    CLEAR_DATA: 'Clearing sensitive user data.',
    REDIRECT: 'Redirecting to the landing page.',
    RESET_TIMEOUT: 'Idle timeout reset.',
    TIMEOUT_CLEANUP: 'Idle timeout cleanup.',
    TIMEOUT_TRIGGERED: 'Idle timeout triggered.'  
  },
} as const;


export default EXTENDED_NOTIFICATION_MESSAGES;
