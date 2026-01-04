EnvironmentConfig.ts
src/config/environments/EnvironmentConfig.ts
export interface EnvironmentConfig {
  name: 'development' | 'staging' | 'production';
  apiBaseUrl: string;
  cryptoApiUrl: string;
  websocketUrl: string;
  features: {
    advancedCrypto: boolean;
    realTimeCollaboration: boolean;
    videoConferencing: boolean;
    aiAssistance: boolean;
  };
  limits: {
    maxTeamSize: number;
    maxFileSize: number;
    cryptoTransactionLimit: number;
  };
  thirdParty: {
    stripeKey: string;
    cryptoExchangeApiKey: string;
    videoProvider: 'agora' | 'zoom' | 'custom';
  };
}

export const environments: Record<string, EnvironmentConfig> = {
  development: {
    name: 'development',
    apiBaseUrl: 'https://dev-api.projectapp.com',
    cryptoApiUrl: 'https://dev-crypto-api.projectapp.com',
    websocketUrl: 'wss://dev-ws.projectapp.com',
    features: {
      advancedCrypto: true,  // Test crypto features in dev
      realTimeCollaboration: true,
      videoConferencing: true,
      aiAssistance: true
    },
    limits: {
      maxTeamSize: 10,
      maxFileSize: 100 * 1024 * 1024, // 100MB
      cryptoTransactionLimit: 1000 // $1000 limit for testing
    },
    thirdParty: {
      stripeKey: 'pk_test_...',
      cryptoExchangeApiKey: 'test_exchange_key',
      videoProvider: 'agora'
    }
  },
  staging: {
    name: 'staging',
    apiBaseUrl: 'https://staging-api.projectapp.com',
    cryptoApiUrl: 'https://staging-crypto-api.projectapp.com',
    websocketUrl: 'wss://staging-ws.projectapp.com',
    features: {
      advancedCrypto: true,
      realTimeCollaboration: true,
      videoConferencing: false, // Disable video in staging
      aiAssistance: false
    },
    limits: {
      maxTeamSize: 50,
      maxFileSize: 500 * 1024 * 1024, // 500MB
      cryptoTransactionLimit: 10000 // $10,000 limit
    },
    thirdParty: {
      stripeKey: 'pk_test_...',
      cryptoExchangeApiKey: 'staging_exchange_key',
      videoProvider: 'agora'
    }
  },
  production: {
    name: 'production',
    apiBaseUrl: 'https://api.projectapp.com',
    cryptoApiUrl: 'https://crypto-api.projectapp.com',
    websocketUrl: 'wss://ws.projectapp.com',
    features: {
      advancedCrypto: false, // Roll out gradually in prod
      realTimeCollaboration: true,
      videoConferencing: true,
      aiAssistance: false
    },
    limits: {
      maxTeamSize: 200,
      maxFileSize: 1024 * 1024 * 1024, // 1GB
      cryptoTransactionLimit: 50000 // $50,000 limit
    },
    thirdParty: {
      stripeKey: 'pk_live_...',
      cryptoExchangeApiKey: 'live_exchange_key',
      videoProvider: 'zoom'
    }
  }
};