// userManagementConfig.ts
import { UserManagementEndpoints } from '../types/categories/UserManagementEndpoints';
import { BASE_URL } from './baseUrl';

export const userManagementConfig: UserManagementEndpoints = {
  registerUser: { path: `${BASE_URL}/api/users/register`, method: "POST" },
  updateUserProfile: (userId: number) => ({ path: `${BASE_URL}/api/users/${userId}/update`, method: "PUT" }),
  deleteUserAccount: (userId: number) => ({ path: `${BASE_URL}/api/users/${userId}/delete`, method: "DELETE" }),
  getUserDetails: (userId: number) => ({ path: `${BASE_URL}/api/users/${userId}`, method: "GET" }),
  listUsers: { path: `${BASE_URL}/api/users`, method: "GET" },
};