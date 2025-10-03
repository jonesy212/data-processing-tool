import { Phase } from './Phase'; // Assuming Phase and CustomPhaseHooks are defined in a separate file

class PhaseService {
  private phases: Phase[];

  constructor(phases: Phase[]) {
    this.phases = phases;
  }

  getPhases(): Phase[] {
    return this.phases;
  }

  getPhaseByName(name: string): Phase | undefined {
    return this.phases.find(phase => phase.name === name);
  }

  addPhase(phase: Phase): void {
    this.phases.push(phase);
  }

  removePhase(phaseName: string): void {
    this.phases = this.phases.filter(phase => phase.name !== phaseName);
  }

  updatePhase(phaseId: number, updatedPhase: Phase): void { 
    const phaseIndex = this.phases.findIndex(phase => (phase.data as any).id === phaseId);
    this.phases[phaseIndex] = updatedPhase;
  }

  // Other methods for managing phases, such as updating phase details, validating phase transitions, etc.
}

export default PhaseService;
