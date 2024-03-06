import { CommonData } from "../models/CommonData";
import { Data } from "../models/data/Data";

// Define a type for a phase
export interface Phase extends CommonData<Data> {
  name: string;
  startDate: Date;
  endDate: Date;
  subPhases: string[];
  component: React.FC;
  hooks: CustomPhaseHooks;
  duration: number; // Duration of the phase in seconds

}

export class PhaseImpl implements Phase {
  name: string;
  startDate: Date;
  endDate: Date;
  subPhases: string[];
  component: React.FC;
  hooks: CustomPhaseHooks;
  title: string;
  description: string;
  data: any;
  duration: number = 0; // Duration of the phase in seconds

  constructor(
    name: string,
    startDate: Date,
    endDate: Date,
    subPhases: string[],
    component: React.FC,
    hooks: CustomPhaseHooks,
    data: any,
    description: string,
    title: string
  ) {
    this.name = name;
    this.title = title
    this.startDate = startDate
    this.endDate = endDate
    this.subPhases = subPhases;
    this.hooks = hooks
    this.data = data
    this.description = description
    this.component = component;
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
