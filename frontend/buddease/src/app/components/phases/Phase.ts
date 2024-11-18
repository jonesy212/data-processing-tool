import { BaseData } from '@/app/components/models/data/Data';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { FC } from "react";
import { Lesson } from "../documents/CourseBuilder";
import { CollaborationOptions } from "../interfaces/options/CollaborationOptions";
import { CommonData } from "../models/CommonData";
import { Data } from "../models/data/Data";
import { Task } from "../models/tasks/Task";
import { Member } from "../models/teams/TeamMembers";
import { Progress } from "../models/tracker/ProgressBar";
import { TagsRecord } from "../snapshots";
import { DetailsItem } from "../state/stores/DetailsListStore";

interface PhaseData extends BaseData<any> {
  // Define any properties specific to phase-related data
}

interface PhaseMeta {
  createdBy?: string;
  updatedBy?: string;
  archived?: boolean;
  [key: string]: any; // Add more metadata as needed
}

// Define a type for a phase
export interface Phase<
  T extends PhaseData = PhaseData,
  Meta extends PhaseMeta = PhaseMeta
  >
  extends CommonData<T, K> {
  id: string;
  index?: number;
  name: string;
  description: string | undefined
  startDate: Date | undefined;
  endDate: Date | undefined;
  subPhases: string[] | Phase<T, Meta>[];
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

export class PhaseImpl<T extends  BaseData<T>,
  K extends T = T> implements Phase<T, K> {
  id: string = "";
  name: string = "";
  startDate: Date = new Date();
  endDate: Date = new Date();
  subPhases: Phase<T>[] = [];
  createdBy: string = ""; // Moved to common data
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
  metadata?: StructuredMetadata<T, K> | undefined;
  details?: DetailsItem<any> | undefined; 
  tags?: TagsRecord<T, K> | string[] | undefined;
  categories?: string[] | undefined;
  documentType?: DocumentTypeEnum | string | undefined;
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


export interface CustomPhaseHooks <T extends Data<T>, K extends T = T> {
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
  canTransitionTo: (nextPhase: Phase<PhaseData>) => {
    // Ensure the next phase's start date is after the current phase's end date
  const isValidTransition = currentPhase.endDate < nextPhase.startDate;
  return isValidTransition;
  },
  handleTransitionTo: async (nextPhase: Phase<PhaseData>) => {
   // Log the transition
  console.log(`Transitioning from ${currentPhase.name} to ${nextPhase.name}`);

  // Perform any necessary cleanup for the current phase
  // (e.g., save data, reset states, etc.)
  await saveCurrentPhaseData(currentPhase.data);

  // Update the current phase reference
  currentPhase = nextPhase;

  // Optionally, notify the user or other components
  notifyTransition(nextPhase);

  },


  resetIdleTimeout: async () => {
    // reset idle timeout
    await Promise.resolve();
  },
};



const saveCurrentPhaseData = async (phaseData: Phase): Promise<void> => {
  try {
    // Use the addPhase API function to save the current phase
    await addPhase(phaseData);
  } catch (error) {
    // If the error is handled inside addPhase, we can just log or handle it here
    console.error('Failed to save current phase data:', error);
    
    // Optionally notify the user about the error
    const notification = useNotification();
    notification.notify(
      'PhaseError', // This could be a custom notification type
      'Failed to save phase data. Please try again.',
      null,
      new Date(),
      "PhaseApiError"
    );

    // Re-throw the error if you want to handle it further up the call stack
    throw error;
  }
};


// Example function to notify of the phase transition
const notifyTransition = (nextPhase: Phase<PhaseData>): void => {
  console.log(`Now in phase: ${nextPhase.name}`);
};


export type { PhaseData, PhaseMeta };
