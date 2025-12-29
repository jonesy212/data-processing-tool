// LifecycleManager.ts
import { LifecycleConfig, LifecycleState, LifecycleTransition, PhaseOptions } from '@/core/hooks/phases/lifecycles';

export class LifecycleManager {
  private phases: Map<string, PhaseOptions>;
  private state: LifecycleState;
  private config: LifecycleConfig;
  private transitionHistory: LifecycleTransition[] = [];

  constructor(config: LifecycleConfig) {
    this.config = config;
    this.phases = new Map(config.phases.map(phase => [phase.name, phase]));
    this.state = {
      currentPhase: config.initialPhase ? this.getPhase(config.initialPhase) : null,
      previousPhase: null,
      phaseHistory: [],
      isTransitioning: false,
      lastActivityTime: Date.now()
    };
  }

  // Core lifecycle methods
  async transitionTo(phaseName: string): Promise<boolean> {
    if (this.state.isTransitioning) {
      throw new Error('Already transitioning between phases');
    }

    const targetPhase = this.getPhase(phaseName);
    if (!targetPhase) {
      throw new Error(`Phase '${phaseName}' not found`);
    }

    const currentPhase = this.state.currentPhase;
    
    // Check if transition is allowed
    if (currentPhase && !currentPhase.hooks.canTransitionTo(targetPhase)) {
      const error = `Transition from '${currentPhase.name}' to '${phaseName}' is not allowed`;
      this.recordTransition(currentPhase, targetPhase, false, error);
      this.config.onTransitionError?.(new Error(error));
      return false;
    }

    this.state.isTransitioning = true;

    try {
      // Handle transition logic
      if (currentPhase) {
        currentPhase.hooks.handleTransitionTo(targetPhase);
      }

      // Update state
      this.state.previousPhase = currentPhase;
      this.state.currentPhase = targetPhase;
      this.state.phaseHistory.push(targetPhase);
      this.state.lastActivityTime = Date.now();
      this.state.isTransitioning = false;

      // Record successful transition
      this.recordTransition(currentPhase, targetPhase, true);

      // Notify listeners
      this.config.onPhaseChange?.(currentPhase, targetPhase);

      return true;
    } catch (error) {
      this.state.isTransitioning = false;
      const errorMessage = error instanceof Error ? error.message : 'Unknown transition error';
      this.recordTransition(currentPhase, targetPhase, false, errorMessage);
      this.config.onTransitionError?.(error instanceof Error ? error : new Error(errorMessage));
      return false;
    }
  }

  canTransitionTo(phaseName: string): boolean {
    const targetPhase = this.getPhase(phaseName);
    const currentPhase = this.state.currentPhase;
    
    if (!targetPhase) return false;
    if (!currentPhase) return true; // Can transition to any phase if no current phase
    
    return currentPhase.hooks.canTransitionTo(targetPhase);
  }

  // Phase management
  getPhase(phaseName: string): PhaseOptions | undefined {
    return this.phases.get(phaseName);
  }

  getAllPhases(): PhaseOptions[] {
    return Array.from(this.phases.values());
  }

  getPhaseBySubPhase(subPhaseName: string): PhaseOptions | undefined {
    return this.getAllPhases().find(phase => 
      phase.subPhases.includes(subPhaseName)
    );
  }

  // State management
  getCurrentPhase(): PhaseOptions | null {
    return this.state.currentPhase;
  }

  getPreviousPhase(): PhaseOptions | null {
    return this.state.previousPhase;
  }

  getPhaseHistory(): PhaseOptions[] {
    return [...this.state.phaseHistory];
  }

  getNextPossiblePhases(): PhaseOptions[] {
    const currentPhase = this.state.currentPhase;
    if (!currentPhase) return this.getAllPhases();

    return this.getAllPhases().filter(phase =>
      currentPhase.hooks.canTransitionTo(phase)
    );
  }

  // Activity tracking
  updateActivity(): void {
    this.state.lastActivityTime = Date.now();
  }

  async checkIdleTimeout(idleTimeoutDuration: number): Promise<boolean> {
    const currentPhase = this.state.currentPhase;
    if (!currentPhase) return false;

    const currentTime = Date.now();
    const isIdle = (currentTime - this.state.lastActivityTime) >= idleTimeoutDuration;
    
    if (isIdle) {
      return await currentPhase.hooks.condition(idleTimeoutDuration);
    }
    
    return false;
  }

  // Utility methods
  private recordTransition(
    from: PhaseOptions | null, 
    to: PhaseOptions, 
    success: boolean, 
    error?: string
  ): void {
    const transition: LifecycleTransition = {
      from: from || {} as PhaseOptions,
      to,
      timestamp: new Date(),
      success,
      error
    };
    this.transitionHistory.push(transition);
  }

  getTransitionHistory(): LifecycleTransition[] {
    return [...this.transitionHistory];
  }

  reset(): void {
    this.state = {
      currentPhase: this.config.initialPhase ? this.getPhase(this.config.initialPhase) : null,
      previousPhase: null,
      phaseHistory: [],
      isTransitioning: false,
      lastActivityTime: Date.now()
    };
    this.transitionHistory = [];
  }
}