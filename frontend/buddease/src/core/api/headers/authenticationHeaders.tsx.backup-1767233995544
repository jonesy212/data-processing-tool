// authenticationHeaders.tsx
import configData from "@/core/config/endpoints/configData";
import { AppUserEntity, UserAttachment, UserExcludedFields, UserIncludedFields, UserK, UserMeta } from '@/core/typings/entities/UserEntity';
import { User } from "@/core/users/User";
type Token = string | null;

type AuthenticationHeaders = {
  Authorization?: string;
  'Content-Type': string;
  'X-User-ID'?: string;
  'X-App-Version': string;
};

export const currentAppVersion = configData.currentAppVersion;

export  const createAuthenticationHeaders = (
  token: string | null,
  userId: string | null,
  appVersion: string
): AuthenticationHeaders => {
  const headers: AuthenticationHeaders = {
    'Content-Type': 'application/json',
    'X-App-Version': appVersion,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (userId) {
    headers['X-User-ID'] = userId;
  }

  return headers;
};

// Get tokens from localStorage
const accessToken: Token = localStorage.getItem('accessToken');
const userId: User<AppUserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields>['id'] | null = localStorage.getItem('userId');

// Check if userId is not null before creating authentication headers
const authenticationHeaders: Record<string, string> = createAuthenticationHeaders(
  accessToken,
  userId,
  currentAppVersion.toString()
);

export default authenticationHeaders;
export type { AuthenticationHeaders };
