// unauthorizedService.ts
import { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import { useNotification } from '@/core/state/context/NotificationContext';

export interface UnauthorizedNotificationMessages {
  UNAUTHORIZED_ACCESS_ATTEMPT: string;
  SUPPORT_REQUEST: string;
  LOGOUT_SUCCESS: string;
  DASHBOARD_REDIRECT_SUCCESS: string;
}

export const unauthorizedNotificationMessages: UnauthorizedNotificationMessages = {
  UNAUTHORIZED_ACCESS_ATTEMPT: "Unauthorized access attempt detected",
  SUPPORT_REQUEST: "Support request submitted successfully",
  LOGOUT_SUCCESS: "Logged out successfully",
  DASHBOARD_REDIRECT_SUCCESS: "Redirected to your dashboard"
};

export const unauthorizedService = {
  // Following your notification pattern
  notifyUnauthorizedAccess: (
    user: any,
    attemptedPath: string
  ) => {
    useNotification().notify({
      id: `unauthorized_access_${Date.now()}`,
      message: unauthorizedNotificationMessages.UNAUTHORIZED_ACCESS_ATTEMPT,
      data: {
        entityType: 'auth',
        action: 'unauthorized_access',
        user: user?.username || 'unknown user',
        attemptedPath,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.WARNING,
      level: 'warning' as const
    });
  },

  notifySupportRequest: (
    user: any,
    requestedPath: string
  ) => {
    useNotification().notify({
      id: `support_request_${Date.now()}`,
      message: unauthorizedNotificationMessages.SUPPORT_REQUEST,
      data: {
        entityType: 'support',
        action: 'request_unauthorized_access_support',
        issue: 'unauthorized_access',
        requestedPath,
        user: user?.username || 'anonymous',
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.INFO,
      level: 'info' as const
    });
  },

  notifyLogout: (
    user: any,
    reason: string = 'unauthorized_access_redirect'
  ) => {
    useNotification().notify({
      id: `logout_success_${Date.now()}`,
      message: unauthorizedNotificationMessages.LOGOUT_SUCCESS,
      data: {
        entityType: 'auth',
        action: 'logout',
        user: user?.username || 'unknown',
        reason,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.INFO,
      level: 'info' as const
    });
  },

  notifyDashboardRedirect: (
    user: any,
    targetPath: string
  ) => {
    useNotification().notify({
      id: `dashboard_redirect_${Date.now()}`,
      message: unauthorizedNotificationMessages.DASHBOARD_REDIRECT_SUCCESS,
      data: {
        entityType: 'navigation',
        action: 'redirect_dashboard',
        user: user?.username || 'unknown',
        targetPath,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.INFO,
      level: 'info' as const
    });
  }
};