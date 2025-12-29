// ApiWebBaseEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface ApiWebBaseEndpoints extends EndpointCategoryConfig {
  login: EndpointConfig;
  logout: EndpointConfig;
  register: EndpointConfig,
  forgotPassword: EndpointConfig,
  resetPassword: EndpointConfig,
  verifyEmail: EndpointConfig,
  resendVerificationEmail: EndpointConfig,
}