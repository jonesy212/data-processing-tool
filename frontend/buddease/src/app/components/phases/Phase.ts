import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { FC } from "react";
import { Lesson } from "../documents/CourseBuilder";
import { CollaborationOptions } from "../interfaces/options/CollaborationOptions";
import { CommonData } from "../models/CommonData";
import { Data } from "../models/data/Data";
import { Task } from "../models/tasks/Task";
import { Member } from "../models/teams/TeamMembers";
import { Progress } from "../models/tracker/ProgressBar";
import { DetailsItem } from "../state/stores/DetailsListStore";

// Define a type for a phase
export interface Phase extends CommonData<Data> {
  name: string;
  startDate:  Date;
  endDate:  Date;
  subPhases: string[];
  component: React.FC;
  hooks: CustomPhaseHooks;
  lessons?: Lesson[];
  duration: number;
  tasks?: Task[];
  members?: Member[];
}

export class PhaseImpl implements Phase {
  name: string="";
  startDate:  Date= new Date();
  endDate:  Date= new Date();
  subPhases: string[]=[];
  // component: React.FC = () => <div>Phase Component</div>,
  hooks: CustomPhaseHooks = {
    canTransitionTo: () => true,
    handleTransitionTo: () => {},
    resetIdleTimeout: () => Promise.resolve(),
    isActive: false,
    progress: {
      id: "default",
      value: 0,
      label: ""
    } as Progress
  };
  title: string = "";
  description: string = "";
  data: any;
  duration: number = 0; // Duration of the phase in seconds
  lessons: Lesson[] = [];

  constructor(
    name: string,
    startDate:  Date,
    endDate:  Date,
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
  component: FC<{}>;
  // tasks?: Task[] | undefined;
  collaborationOptions?: CollaborationOptions[] | undefined;
  participants?: Member[] | undefined;
  metadata?: StructuredMetadata | undefined;
  details?: DetailsItem<Data> | undefined;
  tags?: string[] | undefined;
  categories?: string[] | undefined;
  documentType?: string | undefined;
  documentStatus?: string | undefined;
  documentOwner?: string | undefined;
  documentAccess?: string | undefined;
  documentSharing?: string | undefined;
  documentSecurity?: string | undefined;
  documentRetention?: string | undefined;
  documentLifecycle?: string | undefined;
  documentWorkflow?: string | undefined;
  documentIntegration?: string | undefined;
  documentReporting?: string | undefined;
  documentBackup?: string | undefined;
}




export interface CustomPhaseHooks {
  [x: string]: any;
  canTransitionTo?: (nextPhase: Phase) => boolean;
  handleTransitionTo?: (nextPhase: Phase) => void;
  resetIdleTimeout: () => Promise<void>;
  isActive: boolean;
  progress: Progress | null
  // Add other methods if needed
}


export const customPhaseHooks = {
  canTransitionTo: (nextPhase: Phase) => {
    // custom transition logic
    return true;
  },
  handleTransitionTo: async (nextPhase: Phase) => {
    // custom transition handling
    await Promise.resolve();
  },
  resetIdleTimeout: async () => {
    // reset idle timeout
    await Promise.resolve();
  }
}