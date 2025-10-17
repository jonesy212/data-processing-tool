// UserManagementEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfig';

export interface UserManagementEndpoints {
  registerUser: EndpointConfig;
  updateUserProfile: (userId: number) => EndpointConfig;
  deleteUserAccount: (userId: number) => EndpointConfig;
  getUserDetails: (userId: number) => EndpointConfig;
  listUsers: EndpointConfig;
}