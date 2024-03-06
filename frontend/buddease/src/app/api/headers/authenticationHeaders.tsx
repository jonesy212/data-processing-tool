import { User } from "@/app/components/users/User";
import configData from "@/app/configs/configData";

type Token = string | null;

// Define the type for authentication headers
type AuthenticationHeaders = {
  Authorization?: string;
  'Content-Type': string;
  'X-User-ID'?: User['id'] | null; // Updated type for userId
  'X-App-Version': string;
};

const createAuthenticationHeaders = (token: Token, userId: User['id'] | null, appVersion: string): AuthenticationHeaders => {
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-User-ID': userId, // Updated value for userId
      'X-App-Version': appVersion, // Dynamic application version
      // Add more authentication headers if needed
    };
  } else {
    return {
      'Content-Type': 'application/json',
      'X-App-Version': appVersion, // Dynamic application version
      // Add default headers if no token is provided
    };
  }
};

// Get tokens from localStorage
const accessToken: Token = localStorage.getItem('accessToken');
const userId: User['id'] | null = localStorage.getItem('userId');

// Specify the current application version
const currentAppVersion = configData.currentAppVersion

// Check if userId is not null before creating authentication headers
const authenticationHeaders: AuthenticationHeaders = createAuthenticationHeaders(
  accessToken,
  userId,
  currentAppVersion
);

export default authenticationHeaders;
