// idleTimeoutConstants.ts
// Define the EXTENDED__DURATION
export const EXTENDED__DURATION = 60000; // 1 minute in milliseconds

// Define the extended notification messages
const EXTENDED__NOTIFICATION_MESSAGES = {
  IdleTimeout: {
    SESSION_EXPIRING: 'Your session is about to expire. Please interact to continue.',
    LOGOUT_SUCCESS: 'Logout successful.',
    LOGOUT_ERROR: 'Error occurred during logout.',
    CLEAR_DATA: 'Clearing user data.',
    REDIRECT: 'Redirecting to landing page.',
    RESET_TIMEOUT: 'Resetting idle timeout.',
    TIMEOUT_CLEANUP: 'Idle timeout cleanup.',
  },
};

export default EXTENDED__NOTIFICATION_MESSAGES;
