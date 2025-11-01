// AuthEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/app/config/EndpointConfig';

export interface AuthEndpoints extends EndpointCategoryConfig {
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