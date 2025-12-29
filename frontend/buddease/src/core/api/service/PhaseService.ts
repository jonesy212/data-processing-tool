// PhaseService.ts
// PhaseService.ts - Client-side state management
import { AppPhase } from '@/core/typings/entities/PhaseEntity';

class PhaseService {
  private phases: AppPhase[] = [];

  constructor(phases: AppPhase[] = []) {
    this.phases = phases;
  }

  // Sync local state with server using ApiClient
  async loadPhasesFromServer(projectId?: string): Promise<void> {
    try {
      let phasesData: AppPhase[];
      
      if (projectId) {
        phasesData = await phaseApiService.getPhasesByProject(projectId);
      } else {
        // This would need a general phases endpoint
        const response = await internalApiService.get('/api/phases');
        phasesData = await Promise.all(
          response.data.map(async (data: any) => 
            await phaseApiService.loadPhaseFromDatabase(data.id)
          )
        );
      }
      
      this.phases = phasesData;
    } catch (error) {
      console.error('Failed to load phases from server:', error);
      throw error; // Let the caller handle the error
    }
  }

  async addPhaseAndSync(phase: AppPhase): Promise<void> {
    // Add to local state
    this.addPhase(phase);
    
    // Sync to server using ApiClient
    try {
      await phaseApiService.savePhase(phase);
    } catch (error) {
      // Rollback local state if server fails
      this.removePhase(phase.name);
      throw error;
    }
  }

  async updatePhaseAndSync(phaseId: number, updatedPhase: AppPhase): Promise<void> {
    const oldPhase = this.getPhaseById(phaseId);
    if (!oldPhase) throw new Error('Phase not found');
    
    // Update local state
    this.updatePhase(phaseId, updatedPhase);
    
    // Sync to server
    try {
      await phaseApiService.updatePhase(phaseId.toString(), updatedPhase);
    } catch (error) {
      // Rollback local state if server fails
      this.updatePhase(phaseId, oldPhase);
      throw error;
    }
  }

  // Your existing methods
  getPhases(): AppPhase[] { 
    return this.phases; 
  }

  getPhaseByName(name: string): AppPhase | undefined { 
    return this.phases.find(phase => phase.name === name);
  }

  getPhaseById(id: number): AppPhase | undefined {
    return this.phases.find(phase => (phase.data as any).id === id);
  }

  addPhase(phase: AppPhase): void { 
    this.phases.push(phase); 
  }

  removePhase(phaseName: string): void { 
    this.phases = this.phases.filter(phase => phase.name !== phaseName); 
  }

  updatePhase(phaseId: number, updatedPhase: AppPhase): void { 
    const phaseIndex = this.phases.findIndex(phase => (phase.data as any).id === phaseId);
    if (phaseIndex !== -1) {
      this.phases[phaseIndex] = updatedPhase;
    }
  }
}

export default PhaseService;