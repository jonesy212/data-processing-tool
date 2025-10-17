// AuthEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfig';

export interface AuthEndpoints {
  admin: EndpointConfig;
  forgotPassword: EndpointConfig;
  resetPassword: EndpointConfig;
  verifyEmail: (token: string) => EndpointConfig;
  resendVerificationEmail: EndpointConfig;
  changePassword: EndpointConfig;
  updateProfile: EndpointConfig;
  deactivateAccount: EndpointConfig;
  reactivateAccount: EndpointConfig;
  userHistory: EndpointConfig;
  oauthLogin: EndpointConfig;
  setup2FA: EndpointConfig;
  verify2FA: EndpointConfig;
  userRolesPermissions: EndpointConfig;
  userActivityLog: EndpointConfig;
  userSearch: EndpointConfig;
  exportUserData: EndpointConfig;
  updateNotificationSettings: EndpointConfig;
  updatePrivacySettings: EndpointConfig;
  uploadAvatar: EndpointConfig;
  revokeToken: EndpointConfig;
  profile: EndpointConfig;
  logout: EndpointConfig;
}