// ExternalAuthEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface ExternalAuthEndpoints extends EndpointCategoryConfig {
  [key: string]: EndpointConfig;
  wixAuthentication: EndpointConfig;
  googleAuthentication: EndpointConfig;
  facebookAuthentication: EndpointConfig;
  githubAuthentication: EndpointConfig;
  twitterAuthentication: EndpointConfig;
  linkedinAuthentication: EndpointConfig;
  microsoftAuthentication: EndpointConfig;
  appleAuthentication: EndpointConfig;
  getAuthUrl: EndpointConfig;
  oauthCallback: EndpointConfig;
  oauthToken: EndpointConfig;
  oauthUserInfo: EndpointConfig;
  disconnectAccount: EndpointConfig;
  getConnectedAccounts: EndpointConfig;
  samlAuthentication: EndpointConfig;
  oidcAuthentication: EndpointConfig;
  getAvailableProviders: EndpointConfig;
  getProviderConfig: EndpointConfig;
}