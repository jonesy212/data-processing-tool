// ExternalAuthEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfig';

export interface ExternalAuthEndpoints {
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