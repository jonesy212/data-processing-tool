// useCryptoIntegration.ts
// src/hooks/useCryptoIntegration.ts
import { environmentAwareEndpointManager } from '@/core/config/endpoints/EnvironmentAwareEndpointManager';
import { cryptoIntegrationService, CryptoPortfolio } from '@/core/services/CryptoIntegrationService';
import { useEffect, useState } from 'react';

export const useCryptoIntegration = (userId: number) => {
  const [portfolio, setPortfolio] = useState<CryptoPortfolio | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [environmentInfo, setEnvironmentInfo] = useState<any>(null);

  useEffect(() => {
    setEnvironmentInfo({
      features: environmentAwareEndpointManager.getCurrentEnvironment().features,
      limits: environmentAwareEndpointManager.getCurrentEnvironment().limits
    });
  }, []);

  const fetchPortfolio = async () => {
    if (!environmentAwareEndpointManager.isFeatureEnabled('advancedCrypto')) {
      setError('Crypto features are not available in your current environment');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const portfolioData = await cryptoIntegrationService.getPortfolio(userId);
      setPortfolio(portfolioData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolio');
    } finally {
      setLoading(false);
    }
  };

  const executeTrade = async (tradeRequest: any) => {
    if (!environmentAwareEndpointManager.isFeatureEnabled('advancedCrypto')) {
      throw new Error('Trading is not available in your current environment');
    }

    try {
      const result = await cryptoIntegrationService.executeTrade(userId, tradeRequest);
      // Refresh portfolio after trade
      await fetchPortfolio();
      return result;
    } catch (err) {
      throw err;
    }
  };

  // Real-world use case: Fund a project phase using crypto
  const fundProjectPhase = async (projectId: number, phaseId: number, amount: number, cryptoAsset: string) => {
    const tradeRequest = {
      symbol: cryptoAsset,
      amount: amount,
      type: 'sell' as const
    };

    try {
      // Execute trade to convert crypto to fiat
      const tradeResult = await executeTrade(tradeRequest);
      
      // Record the funding in the project system
      const fundingEndpoint = environmentAwareEndpointManager.getEndpoint(
        'projects', 
        'fundPhase', 
        projectId, 
        phaseId
      );
      
      await internalApiService.post(fundingEndpoint, {
        amount,
        cryptoAsset,
        tradeId: tradeResult.id,
        timestamp: new Date().toISOString()
      });

      return tradeResult;
    } catch (err) {
      console.error('Project funding failed:', err);
      throw err;
    }
  };

  return {
    portfolio,
    loading,
    error,
    environmentInfo,
    fetchPortfolio,
    executeTrade,
    fundProjectPhase,
    isCryptoEnabled: environmentAwareEndpointManager.isFeatureEnabled('advancedCrypto')
  };
};