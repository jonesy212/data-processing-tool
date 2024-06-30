import { User } from "@/app/components/users/User";
import configData from "@/app/configs/configData";

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
const userId: User['id'] | null = localStorage.getItem('userId');

// Check if userId is not null before creating authentication headers
const authenticationHeaders: Record<string, string> = createAuthenticationHeaders(
  accessToken,
  userId,
  currentAppVersion.toString()
);

export default authenticationHeaders;
export type { AuthenticationHeaders };
