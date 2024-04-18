import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { FC } from "react";
import { Lesson } from "../documents/CourseBuilder";
import { CommonData } from "../models/CommonData";
import { Data } from "../models/data/Data";
import { Task } from "../models/tasks/Task";
import { Member } from "../models/teams/TeamMembers";
import { DetailsItem } from "../state/stores/DetailsListStore";
import { CollaborationOptions } from "../interfaces/options/CollaborationOptions";

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
  members?: Member[]
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
  canTransitionTo: (nextPhase: Phase) => boolean;
  handleTransitionTo: (nextPhase: Phase) => void;
  resetIdleTimeout: () => Promise<void>;
  isActive: boolean;
  // Add other methods if needed
}
