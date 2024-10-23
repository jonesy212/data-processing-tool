import { UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { FC } from "react";
import { Lesson } from "../documents/CourseBuilder";
import { CollaborationOptions } from "../interfaces/options/CollaborationOptions";
import { CommonData } from "../models/CommonData";
import { Task } from "../models/tasks/Task";
import { Member } from "../models/teams/TeamMembers";
import { Progress } from "../models/tracker/ProgressBar";
import { TagsRecord } from "../snapshots";
import { DetailsItem } from "../state/stores/DetailsListStore";
import { Data } from "../models/data/Data";
import { Meta, T } from "../models/data/dataStoreMethods";

// Define a type for a phase
export interface Phase<T extends Data,
Meta extends UnifiedMetaDataOptions = UnifiedMetaDataOptions,
K extends Data = T>
  extends CommonData<T> {
  id: string;
  index?: number;
  name: string;
  description: string | undefined
  startDate: Date | undefined;
  endDate: Date | undefined;
  subPhases: string[] | Phase<T>[];
  component?: FC<any>; // Adjust to accept any props
  hooks?: CustomPhaseHooks<T>;
  data?: any;
  lessons?: Lesson[];
  duration?: number;
  tasks?: Task[];
  members?: Member[];
  color?: string;
  status?: string;
  isActive?: boolean;
  type?: string;
  createdAt?: undefined;
  updatedAt?: undefined;
  __typename?: "Phase";
}

export class PhaseImpl<T extends Data,
  Meta extends UnifiedMetaDataOptions = UnifiedMetaDataOptions,
  K extends Data = T> implements Phase<T> {
  id: string = "";
  name: string = "";
  startDate: Date = new Date();
  endDate: Date = new Date();
  subPhases: Phase<T>[] = [];
  // component: React.FC = () => <div>Phase Component</div>,
  hooks: CustomPhaseHooks<T> = {
    // Initialize hooks object
    resetIdleTimeout: async () => {}, // Example implementation, you can adjust as needed
    isActive: false,
    progress: null,
    condition: async () => true,
  };
  title: string = "";
  description: string = "";
  data: any;
  duration: number = 0; // Duration of the phase in seconds
  lessons: Lesson[] = [];

  constructor(
    name: string,
    startDate: Date,
    endDate: Date,
    subPhases: Phase<T>[],
    component: React.FC,
    hooks: CustomPhaseHooks<T>,
    data: any,
    description: string,
    title: string
  ) {
    this.name = name;
    this.title = title;
    this.startDate = startDate;
    this.endDate = endDate;
    this.subPhases = subPhases;
    this.hooks = hooks;
    this.data = data;
    this.description = description;
    this.component = component;
  }
  component: FC<{}>;
  // tasks?: Task[] | undefined;
  collaborationOptions?: CollaborationOptions[] | undefined;
  participants?: Member[] | undefined;
  metadata?: StructuredMetadata<T, Meta, K> | undefined;
  details?: DetailsItem<any> | undefined; 
  tags?: TagsRecord | string[] | undefined;
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

export interface CustomPhaseHooks <T extends Data> {
  [x: string]: any;
  canTransitionTo?: (nextPhase: Phase<T>) => boolean;
  handleTransitionTo?: (nextPhase: Phase<T>) => void;
  resetIdleTimeout: () => Promise<void>;
  isActive: boolean;
  progress: Progress | null;
  condition: (idleTimeoutDuration: number) => Promise<boolean>;
  // Add other methods if needed
}

export const customPhaseHooks = {
  canTransitionTo: (nextPhase: Phase<T>) => {
    // custom transition logic
    return true;
  },
  handleTransitionTo: async (nextPhase: Phase<T>) => {
    // custom transition handling
    await Promise.resolve();
  },
  resetIdleTimeout: async () => {
    // reset idle timeout
    await Promise.resolve();
  },
};
