import { EndpointConfig } from '@/config/EndpointConfig';

export interface ApiWebBaseEndpoints {
  login: EndpointConfig;
  logout: EndpointConfig;
  register: EndpointConfig,
  forgotPassword: EndpointConfig,
  resetPassword: EndpointConfig,
  verifyEmail: EndpointConfig,
  resendVerificationEmail: EndpointConfig,
}