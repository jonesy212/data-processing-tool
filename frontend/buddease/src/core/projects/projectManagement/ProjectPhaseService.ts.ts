// ProjectPhaseService.ts.ts
// src/services/ProjectPhaseService.ts
import { environmentAwareEndpointManager } from '@/core/config/endpoints/EnvironmentAwareEndpointManager';
import internalApiService from '@/core/api/ApiClient';

export class ProjectPhaseService {
  async startVideoConference(projectId: number, phaseId: number) {
    if (!environmentAwareEndpointManager.isFeatureEnabled('videoConferencing')) {
      throw new Error('Video conferencing is not available in this environment');
    }

    const endpoint = environmentAwareEndpointManager.getEndpoint(
      'projects', 
      'startVideoConference', 
      projectId, 
      phaseId
    );
    
    const response = await internalApiService.post(endpoint);
    return response.data;
  }

  async collaborateOnPhase(projectId: number, phaseId: number, collaborationData: any) {
    if (!environmentAwareEndpointManager.isFeatureEnabled('realTimeCollaboration')) {
      throw new Error('Real-time collaboration is not available in this environment');
    }

    const endpoint = environmentAwareEndpointManager.getEndpoint(
      'projects', 
      'collaborateOnPhase', 
      projectId, 
      phaseId
    );
    
    const response = await internalApiService.post(endpoint, collaborationData);
    return response.data;
  }

  // Real-world use case: Complete a project phase with crypto settlement
  async completePhaseWithCrypto(projectId: number, phaseId: number, cryptoPayments: any[]) {
    const env = environmentAwareEndpointManager.getCurrentEnvironment();
    
    // Check if we can process crypto payments
    if (!env.features.advancedCrypto) {
      throw new Error('Crypto payments are not available in this environment');
    }

    // Process each crypto payment
    for (const payment of cryptoPayments) {
      if (payment.amount > env.limits.cryptoTransactionLimit) {
        throw new Error(`Payment amount exceeds crypto transaction limit of $${env.limits.cryptoTransactionLimit}`);
      }

      // Execute crypto transfer
      const cryptoEndpoint = environmentAwareEndpointManager.getCryptoEndpoint(
        'transferCrypto',
        payment.fromUserId,
        payment.toUserId,
        payment.amount,
        payment.asset
      );
      
      await internalApiService.post(cryptoEndpoint, payment);
    }

    // Mark phase as completed
    const completionEndpoint = environmentAwareEndpointManager.getEndpoint(
      'projects',
      'completePhase',
      projectId,
      phaseId
    );

    await internalApiService.post(completionEndpoint, {
      completedAt: new Date().toISOString(),
      cryptoPayments: cryptoPayments.map(p => ({
        asset: p.asset,
        amount: p.amount,
        from: p.fromUserId,
        to: p.toUserId
      }))
    });
  }
}

export const projectPhaseService = new ProjectPhaseService();