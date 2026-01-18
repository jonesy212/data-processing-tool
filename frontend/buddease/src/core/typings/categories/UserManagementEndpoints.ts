// UserManagementEndpoints.ts
import type { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface UserManagementEndpoints extends EndpointCategoryConfig {
  registerUser: EndpointConfig;
  updateUserProfile: (userId: number) => EndpointConfig;
  deleteUserAccount: (userId: number) => EndpointConfig;
  getUserDetails: (userId: number) => EndpointConfig;
  listUsers: EndpointConfig;
}