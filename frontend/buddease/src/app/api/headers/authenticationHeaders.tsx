import { User } from "@/app/components/users/User";
import configData from "@/app/configs/configData";

type Token = string | null;

// Define the type for authentication headers
type AuthenticationHeaders = {
  Authorization?: string;
  'Content-Type': string;
  'X-User-ID'?: User['id'] | null;
  'X-App-Version': string;
};

const currentAppVersion =  configData.currentAppVersion
export const createAuthenticationHeaders = (token: Token, userId: User['id'] | null, appVersion: typeof currentAppVersion): AuthenticationHeaders => {
  const headers: AuthenticationHeaders = {
    'Content-Type': 'application/json',
    'X-App-Version': appVersion.toString(), // Convert appVersion to string
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (userId) {
    headers['X-User-ID'] = userId.toString(); // Convert userId to string
  }

  return headers;
};




// Get tokens from localStorage
const accessToken: Token = localStorage.getItem('accessToken');
const userId: User['id'] | null = localStorage.getItem('userId');

// Check if userId is not null before creating authentication headers
const authenticationHeaders: AuthenticationHeaders = createAuthenticationHeaders(
  accessToken,
  userId,
  currentAppVersion
);

export default authenticationHeaders;
export type { AuthenticationHeaders };
