import { Lesson } from "../documents/CourseBuilder";
import { CommonData } from "../models/CommonData";
import { Data } from "../models/data/Data";
import { Task } from "../models/tasks/Task";

// Define a type for a phase
export interface Phase extends CommonData<Data> {
  name: string;
  startDate:  Date;
  endDate:  Date;
  subPhases: string[];
  component: React.FC;
  hooks: CustomPhaseHooks;
  lessons: Lesson[];
  duration: number; // Duration of the phase in seconds
  tasks?: Task[]
}

export class PhaseImpl implements Phase {
  name: string="";
  startDate:  Date= new Date();
  endDate:  Date= new Date();
  subPhases: string[]=[];
  component: React.FC = () => <div>Phase Component</div>,
hooks: CustomPhaseHooks ,
  title: string;
  description: string;
  data: any;
  duration: number = 0; // Duration of the phase in seconds
  lessons: Lesson[] = [];

  constructor(
    name: string,
    startDate: new Date(),
    endDate: new Date(),
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
