// registrationConfig.ts
import { BASE_URL } from '@/core/api/baseUrl';
import { RegistrationEndpoints } from '@/core/typings/categories/RegistrationEndpoints';

export const registrationConfig: RegistrationEndpoints = {
  registerUser: { path: `${BASE_URL}/api/users/register`, method: "POST" },
  updateUserProfile: (userId: number) => ({ path: `${BASE_URL}/api/users/${userId}/update`, method: "PUT" }),
  deleteUserAccount: (userId: number) => ({ path: `${BASE_URL}/api/users/${userId}/delete`, method: "DELETE" }),
  getUserDetails: (userId: number) => ({ path: `${BASE_URL}/api/users/${userId}`, method: "GET" }),
  listUsers: { path: `${BASE_URL}/api/users`, method: "GET" },
};