// Define a type for a phase
export interface Phase {
  name: string;
  startDate: Date;
  endDate: Date;
  subPhases: string[];
  component: React.FC;
  hooks: CustomPhaseHooks;
}

export class PhaseImpl implements Phase {
  name: string;
  startDate: Date;
  endDate: Date;
  subPhases: string[];
  component: React.FC;
  hooks: CustomPhaseHooks;

  constructor(
    name: string,
    startDate: Date,
    endDate: Date,
    subPhases: string[],
    component: React.FC,
    hooks: CustomPhaseHooks
  ) {
    this.name = name;
    this.startDate = startDate
    this.endDate = endDate
    this.subPhases = subPhases;
    this.component = component;
    this.hooks = hooks

  }
}

export interface CustomPhaseHooks {
  [x: string]: any;
  canTransitionTo: (nextPhase: Phase) => boolean;
  handleTransitionTo: (nextPhase: Phase) => void;
  resetIdleTimeout: () => Promise<void>;
  isActive: boolean;
  // Add other methods if needed
}
