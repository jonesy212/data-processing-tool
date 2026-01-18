// EnvironmentAwareEndpointManager.ts
src/config/endpoints/EnvironmentAwareEndpointManager.ts
import { getApiEndpointUrl } from '@/core/api/endpointConfigurations';
import { EnvironmentConfig, environments } from '@/core/config/EnvironmentConfig';

export class EnvironmentAwareEndpointManager {
  private currentEnv: EnvironmentConfig;

  constructor() {
    this.currentEnv = this.determineEnvironment();
  }

  private determineEnvironment(): EnvironmentConfig {
    const hostname = window.location.hostname;
    
    if (hostname.includes('localhost') || hostname.includes('dev.')) {
      return environments.development;
    } else if (hostname.includes('staging.')) {
      return environments.staging;
    } else {
      return environments.production;
    }
  }

  getEndpoint<T extends keyof EndpointConfigurations>(
    category: T,
    endpointKey: keyof EndpointConfigurations[T],
    ...params: any[]
  ): string {
    const baseEndpoint = getApiEndpointUrl(category, endpointKey, ...params);
    
    // Apply environment-specific transformations
    return this.applyEnvironmentTransformations(baseEndpoint);
  }

  private applyEnvironmentTransformations(endpoint: string): string {
    // Replace base URLs based on environment
    let transformedEndpoint = endpoint;
    
    if (this.currentEnv.name === 'development') {
      transformedEndpoint = endpoint
        .replace('https://api.projectapp.com', this.currentEnv.apiBaseUrl)
        .replace('https://crypto-api.projectapp.com', this.currentEnv.cryptoApiUrl);
    } else if (this.currentEnv.name === 'staging') {
      transformedEndpoint = endpoint
        .replace('https://api.projectapp.com', this.currentEnv.apiBaseUrl)
        .replace('https://crypto-api.projectapp.com', this.currentEnv.cryptoApiUrl);
    }
    
    return transformedEndpoint;
  }

  // Crypto-specific endpoint handling
  getCryptoEndpoint(endpointKey: string, ...params: any[]): string {
    if (!this.currentEnv.features.advancedCrypto) {
      throw new Error('Crypto features are not enabled in this environment');
    }

    const cryptoEndpoint = this.getEndpoint('crypto', endpointKey as any, ...params);
    return cryptoEndpoint;
  }

  getCurrentEnvironment(): EnvironmentConfig {
    return this.currentEnv;
  }

  isFeatureEnabled(feature: keyof EnvironmentConfig['features']): boolean {
    return this.currentEnv.features[feature];
  }

  getLimit(limit: keyof EnvironmentConfig['limits']): number {
    return this.currentEnv.limits[limit];
  }
}

export const environmentAwareEndpointManager = new EnvironmentAwareEndpointManager();