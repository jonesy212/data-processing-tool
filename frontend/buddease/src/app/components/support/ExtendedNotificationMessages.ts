// ExtendedNotificationMessages.ts
import NOTIFICATION_MESSAGES from "./NotificationMessages";

const EXTENDED_NOTIFICATION_MESSAGES = {
  ...NOTIFICATION_MESSAGES,
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
