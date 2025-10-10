// RegistrationEndpoints.ts
import { EndpointConfig } from '../EndpointConfigurations';

export interface RegistrationEndpoints {
  registerUser: EndpointConfig;
  updateUserProfile: (userId: number) => EndpointConfig;
  deleteUserAccount: (userId: number) => EndpointConfig;
  getUserDetails: (userId: number) => EndpointConfig;
  listUsers: EndpointConfig;
}