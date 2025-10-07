// /app/api/phases/phaseApiService.ts - API communication
// /app/api/phases/phaseApiService.ts
import internalApiService from '@/app/api/ApiClient';
import { AppPhase } from '@/types/PhaseEntity';

export const phaseApiService = {
  // Server communication methods using ApiClient
  fetchPhaseData: async (phaseId: string): Promise<any> => {
    const response = await internalApiService.get(`/api/phases/${phaseId}`);
    return response.data;
  },
  
  loadPhaseFromDatabase: async (phaseId: string): Promise<AppPhase> => {
    const phaseData = await phaseApiService.fetchPhaseData(phaseId);
    
    // Transform to AppPhase with runtime fields
    return {
      ...phaseData,
      component: getPhaseComponent(phaseData.type),
      hooks: getPhaseHooks(phaseData.id),
      data: initializePhaseData(phaseData)
    };
  },

  savePhase: async (phase: AppPhase): Promise<void> => {
    await internalApiService.post('/api/phases', phase);
  },

  updatePhase: async (phaseId: string, updates: Partial<AppPhase>): Promise<void> => {
    await internalApiService.put(`/api/phases/${phaseId}`, updates);
  },

  deletePhase: async (phaseId: string): Promise<void> => {
    await internalApiService.delete(`/api/phases/${phaseId}`);
  },

  // Add more phase-specific API methods
  getPhasesByProject: async (projectId: string): Promise<AppPhase[]> => {
    const response = await internalApiService.get(`/api/projects/${projectId}/phases`);
    const phasesData = response.data;
    
    // Transform each to AppPhase
    return phasesData.map((data: any) => ({
      ...data,
      component: getPhaseComponent(data.type),
      hooks: getPhaseHooks(data.id),
      data: initializePhaseData(data)
    }));
  }
};

// Helper functions remain the same
const getPhaseComponent = (phaseType: string) => { /* ... */ };
const getPhaseHooks = (phaseId: string) => ({ /* ... */ });