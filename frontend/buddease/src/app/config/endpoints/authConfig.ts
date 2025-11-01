// authConfig.ts
import { BASE_URL } from '@/app/api/baseUrl';
import { AuthEndpoints } from '@/app/typings/categories/AuthEndpoints';

export const authConfig: AuthEndpoints = {
  admin: { path: `${BASE_URL}/api/admin/login`, method: "POST" },
  forgotPassword: { path: `${BASE_URL}/auth/forgot-password`, method: "POST" },
  resetPassword: { path: `${BASE_URL}/auth/reset-password`, method: "POST" },
  verifyEmail: (token: string) => ({ path: `${BASE_URL}/auth/verify-email/${token}`, method: "GET" }),
  resendVerificationEmail: { path: `${BASE_URL}/auth/resend-verification-email`, method: "POST" },
  changePassword: { path: `${BASE_URL}/auth/change-password`, method: "POST" },
  updateProfile: { path: `${BASE_URL}/auth/update-profile`, method: "PUT" },
  deactivateAccount: { path: `${BASE_URL}/auth/deactivate-account`, method: "POST" },
  reactivateAccount: { path: `${BASE_URL}/auth/reactivate-account`, method: "POST" },
  userHistory: { path: `${BASE_URL}/auth/user-history`, method: "GET" },
  oauthLogin: { path: `${BASE_URL}/auth/oauth-login`, method: "POST" },
  setup2FA: { path: `${BASE_URL}/auth/setup-2fa`, method: "POST" },
  verify2FA: { path: `${BASE_URL}/auth/verify-2fa`, method: "POST" },
  userRolesPermissions: { path: `${BASE_URL}/auth/user-roles-permissions`, method: "GET" },
  userActivityLog: { path: `${BASE_URL}/auth/user-activity-log`, method: "GET" },
  userSearch: { path: `${BASE_URL}/auth/user-search`, method: "POST" },
  exportUserData: { path: `${BASE_URL}/auth/export-user-data`, method: "GET" },
  updateNotificationSettings: { path: `${BASE_URL}/auth/update-notification-settings`, method: "PUT" },
  updatePrivacySettings: { path: `${BASE_URL}/auth/update-privacy-settings`, method: "PUT" },
  uploadAvatar: { path: `${BASE_URL}/auth/upload-avatar`, method: "POST" },
  revokeToken: { path: `${BASE_URL}/auth/revoke-token`, method: "POST" },
  profile: { path: `${BASE_URL}/auth/profile`, method: "GET" },
  logout: { path: `${BASE_URL}/auth/logout`, method: "POST" },
};