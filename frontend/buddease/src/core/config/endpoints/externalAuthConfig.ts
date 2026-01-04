externalAuthConfig.ts
externalAuthConfig.tts
import { ExternalAuthEndpoints } from '@/core/typings/categories/ExternalAuthEndpoints';

export const externalAuthConfig: ExternalAuthEndpoints = {
  wixAuthentication: {
    method: 'POST',
    path: '/external/wix/authenticate',
    description: 'Authenticate user via Wix OAuth',
    requiresAuth: false,
    parameters: {
      code: { type: 'string', required: true, description: 'OAuth authorization code' },
      redirectUri: { type: 'string', required: true, description: 'OAuth redirect URI' }
    }
  },
  
  googleAuthentication: {
    method: 'POST',
    path: '/external/google/authenticate',
    description: 'Authenticate user via Google OAuth',
    requiresAuth: false,
    parameters: {
      code: { type: 'string', required: true, description: 'OAuth authorization code' },
      redirectUri: { type: 'string', required: true, description: 'OAuth redirect URI' }
    }
  },
  
  facebookAuthentication: {
    method: 'POST',
    path: '/external/facebook/authenticate',
    description: 'Authenticate user via Facebook OAuth',
    requiresAuth: false,
    parameters: {
      code: { type: 'string', required: true, description: 'OAuth authorization code' },
      redirectUri: { type: 'string', required: true, description: 'OAuth redirect URI' }
    }
  },
  
  githubAuthentication: {
    method: 'POST',
    path: '/external/github/authenticate',
    description: 'Authenticate user via GitHub OAuth',
    requiresAuth: false,
    parameters: {
      code: { type: 'string', required: true, description: 'OAuth authorization code' },
      redirectUri: { type: 'string', required: true, description: 'OAuth redirect URI' }
    }
  },
  
  twitterAuthentication: {
    method: 'POST',
    path: '/external/twitter/authenticate',
    description: 'Authenticate user via Twitter OAuth',
    requiresAuth: false,
    parameters: {
      oauth_token: { type: 'string', required: true, description: 'OAuth token' },
      oauth_verifier: { type: 'string', required: true, description: 'OAuth verifier' }
    }
  },
  
  linkedinAuthentication: {
    method: 'POST',
    path: '/external/linkedin/authenticate',
    description: 'Authenticate user via LinkedIn OAuth',
    requiresAuth: false,
    parameters: {
      code: { type: 'string', required: true, description: 'OAuth authorization code' },
      redirectUri: { type: 'string', required: true, description: 'OAuth redirect URI' }
    }
  },
  
  microsoftAuthentication: {
    method: 'POST',
    path: '/external/microsoft/authenticate',
    description: 'Authenticate user via Microsoft OAuth',
    requiresAuth: false,
    parameters: {
      code: { type: 'string', required: true, description: 'OAuth authorization code' },
      redirectUri: { type: 'string', required: true, description: 'OAuth redirect URI' }
    }
  },
  
  appleAuthentication: {
    method: 'POST',
    path: '/external/apple/authenticate',
    description: 'Authenticate user via Apple Sign In',
    requiresAuth: false,
    parameters: {
      code: { type: 'string', required: true, description: 'Authorization code' },
      id_token: { type: 'string', required: true, description: 'Apple ID token' },
      user: { type: 'object', required: false, description: 'Apple user object' }
    }
  },

  // OAuth initiation endpoints
  getAuthUrl: {
    method: 'GET',
    path: '/external/{provider}/auth-url',
    description: 'Get OAuth authorization URL for specific provider',
    requiresAuth: false,
    parameters: {
      provider: { type: 'string', required: true, description: 'OAuth provider name' },
      redirectUri: { type: 'string', required: true, description: 'OAuth redirect URI' },
      state: { type: 'string', required: false, description: 'OAuth state parameter' }
    }
  },

  // OAuth callback handling
  oauthCallback: {
    method: 'GET',
    path: '/external/{provider}/callback',
    description: 'Handle OAuth callback from provider',
    requiresAuth: false,
    parameters: {
      provider: { type: 'string', required: true, description: 'OAuth provider name' },
      code: { type: 'string', required: false, description: 'OAuth authorization code' },
      state: { type: 'string', required: false, description: 'OAuth state parameter' },
      error: { type: 'string', required: false, description: 'OAuth error message' }
    }
  },

  oauthToken: {
    method: 'POST',
    path: '/external/{provider}/token',
    description: 'Exchange authorization code for access token',
    requiresAuth: false,
    parameters: {
      provider: { type: 'string', required: true, description: 'OAuth provider name' },
      code: { type: 'string', required: true, description: 'OAuth authorization code' },
      redirectUri: { type: 'string', required: true, description: 'OAuth redirect URI' }
    }
  },

  oauthUserInfo: {
    method: 'GET',
    path: '/external/{provider}/userinfo',
    description: 'Get user info from OAuth provider',
    requiresAuth: true,
    parameters: {
      provider: { type: 'string', required: true, description: 'OAuth provider name' }
    }
  },

  // Connection management
  disconnectAccount: {
    method: 'POST',
    path: '/external/{provider}/disconnect',
    description: 'Disconnect external account from user profile',
    requiresAuth: true,
    parameters: {
      provider: { type: 'string', required: true, description: 'OAuth provider name' }
    }
  },

  getConnectedAccounts: {
    method: 'GET',
    path: '/external/connected-accounts',
    description: 'Get list of connected external accounts for current user',
    requiresAuth: true
  },

  // SSO and enterprise endpoints
  samlAuthentication: {
    method: 'POST',
    path: '/external/saml/authenticate',
    description: 'Authenticate user via SAML SSO',
    requiresAuth: false,
    parameters: {
      SAMLResponse: { type: 'string', required: true, description: 'SAML response from IdP' },
      RelayState: { type: 'string', required: false, description: 'SAML relay state' }
    }
  },

  oidcAuthentication: {
    method: 'POST',
    path: '/external/oidc/authenticate',
    description: 'Authenticate user via OpenID Connect',
    requiresAuth: false,
    parameters: {
      code: { type: 'string', required: true, description: 'OIDC authorization code' },
      redirectUri: { type: 'string', required: true, description: 'OIDC redirect URI' }
    }
  },

  // Provider configuration
  getAvailableProviders: {
    method: 'GET',
    path: '/external/providers',
    description: 'Get list of available external authentication providers',
    requiresAuth: false
  },

  getProviderConfig: {
    method: 'GET',
    path: '/external/{provider}/config',
    description: 'Get configuration for specific OAuth provider',
    requiresAuth: false,
    parameters: {
      provider: { type: 'string', required: true, description: 'OAuth provider name' }
    }
  }
};