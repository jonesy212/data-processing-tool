import { NotificationContext } from '@/app/components/support/NotificationContext';
import { CustomNotificationType } from './../models/data/StatusType';
import { Attachment } from '@/app/components/documents/Attachment/attachment';
import { addPhase } from "@/app/api/ApiPhases";
import { BaseData } from '@/app/components/models/data/Data';
import { Label } from '@/app/components/projects/branding/BrandingSettings';
import { NotificationType } from '@/app/components/support/NotificationContext';
import { UnifiedMetaDataOptions } from "@/app/configs/database/MetaDataOptions";
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { FC } from "react";
import { Lesson } from "../documents/CourseBuilder";
import { AttachmentType } from '@/app/components/documents/NoteData'
import { DocumentTypeEnum } from "../documents/DocumentGenerator";
import { CollaborationOptions } from "../interfaces/options/CollaborationOptions";
import { CommonData } from "../models/CommonData";
import { Data } from "../models/data/Data";
import { Task } from "../models/tasks/Task";
import { Member } from "../models/teams/TeamMembers";
import { Progress } from "../models/tracker/ProgressBar";
import { TagsRecord } from "../snapshots";
import { DetailsItem } from "../state/stores/DetailsListStore";
import { useNotification } from "../support/NotificationContext";

interface PhaseData<
  T extends BaseData<any> = BaseData<any, any>,
  K extends T = T,
> extends BaseData<T, K> {
  // Define any properties specific to phase-related data
  phaseName?: string;
  startDate?: Date;
  endDate?: Date;
}

interface PhaseMeta<
  T extends PhaseData<any, any> = PhaseData<any, any>,
  K extends T = T
> extends StructuredMetadata<T, K> {

  createdBy: string;
  updatedBy?: string;
  archived?: boolean;
  relatedUsers?: string[];
  deadline?: Date | string;
  childIds?: K[];
  [key: string]: any; // Add more metadata as needed
}


type DataWithOmittedFields<T extends BaseData<any, any, StructuredMetadata<any, any>, Attachment>, 
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
ExcludedFields extends keyof T = never
> = Omit<Data<T, K, Meta>, ExcludedFields>;

// Define a type for a phase
export interface Phase<
  T extends PhaseData<BaseData<any, any>> = PhaseData<BaseData<any, any>>,
  K extends T = T,
  Meta extends PhaseMeta = PhaseMeta
  > extends CommonData<BaseData<any, any, StructuredMetadata<any, any>, Attachment>,
  BaseData<any, any, StructuredMetadata<any, any>, Attachment>, Meta
> {
    id: string;
  index?: number;
  name: string;
  description: string | undefined
  startDate: Date | undefined;
  endDate: Date | undefined;
  subPhases: string[] | Phase<T, K, Meta>[];
  component?: FC<any>; // Adjust to accept any props
  hooks?: CustomPhaseHooks<PhaseData<BaseData<any, any, StructuredMetadata<any, any>, Attachment>>>;
  data?: any;
  lessons?: Lesson[];
  duration?: number;
  tasks?: Task[];
  members?: Member[];
  color?: string;
  status?: string;
  isActive?: boolean;
  type?: string;
  responsibleUsers?: string[]; // IDs of users responsible for the phase
  isComplete?: boolean;
  createdAt?: undefined;
  updatedAt?: undefined;
  __typename?: "Phase";
}

  export class PhaseImpl<
    T extends BaseData<any> = BaseData<any, any>,
    K extends T = T,
    Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
  > implements Phase<PhaseData<BaseData<any, any, StructuredMetadata<any, any>, Attachment>, 
    BaseData<any, any, StructuredMetadata<any, any>, Attachment>
    >, 
    PhaseData<BaseData<any, any, StructuredMetadata<any, any>, Attachment>, BaseData<any, any, StructuredMetadata<any, any>, Attachment>>> {
    id: string = "";
    name: string = "";
    startDate: Date | undefined = undefined; 
    endDate: Date | undefined = undefined; 
    subPhases: string[] | Phase<PhaseData<BaseData<any, any, StructuredMetadata<any, any>, Attachment>, BaseData<any, any, StructuredMetadata<any, any>, Attachment>>, PhaseData<BaseData<any, any, StructuredMetadata<any, any>, Attachment>, BaseData<any, any, StructuredMetadata<any, any>, Attachment>>, PhaseMeta>[] = [];
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

    // New properties added to fix the error
    label: Label = { text: "",
      color: "#000000" };
    currentMeta: PhaseMeta<PhaseData<any, any>, PhaseData<any, any>> = {} as PhaseMeta<PhaseData<any, any>, PhaseData<any, any>>;
    currentMetadata: UnifiedMetaDataOptions<BaseData<any, any, StructuredMetadata<any, any>, Attachment>, BaseData<any, any, StructuredMetadata<any, any>, Attachment>, PhaseMeta<PhaseData<any, any>, PhaseData<any, any>>, never> = 
    {} as UnifiedMetaDataOptions<BaseData<any, any, StructuredMetadata<any, any>, Attachment>, BaseData<any, any, StructuredMetadata<any, any>, Attachment>, PhaseMeta<PhaseData<any, any>, PhaseData<any, any>>, never>;
    date: Date = new Date(); 
    
    // Default to the current date
  
    constructor(
      name: string,
      startDate: Date,
      endDate: Date,
      subPhases: string[] | Phase<PhaseData<BaseData<any, any, StructuredMetadata<any, any>, Attachment>, BaseData<any, any, StructuredMetadata<any, any>, Attachment>>, PhaseData<BaseData<any, any, StructuredMetadata<any, any>, Attachment>, BaseData<any, any, StructuredMetadata<any, any>, Attachment>>, PhaseMeta>[],
      component: React.FC,
      hooks: CustomPhaseHooks<T>,
      data: any,
      description: string,
      title: string,
      label?: Label,  // Added to constructor parameters
      currentMeta?: PhaseMeta<PhaseData<any, any>, PhaseData<any, any>>, // Added to constructor parameters
      currentMetadata?: UnifiedMetaDataOptions<BaseData<any, any, StructuredMetadata<any, any>, Attachment>, BaseData<any, any, StructuredMetadata<any, any>, Attachment>, PhaseMeta<PhaseData<any, any>, PhaseData<any, any>>, never>, // Added to constructor parameters
      date?: Date // Added to constructor parameters
    ) {
      this.name = name;
      this.startDate = startDate;
      this.endDate = endDate;
      this.subPhases = subPhases;
      this.hooks = hooks;
      this.data = data;
      this.description = description;
      this.component = component;
      this.title = title;

      if (label) this.label = label;
      if (currentMeta) this.currentMeta = currentMeta;
      if (currentMetadata) this.currentMetadata = currentMetadata;
      if (date) this.date = date;
    }
  component: FC<{}>;
  // tasks?: Task[] | undefined;
  collaborationOptions?: CollaborationOptions[] | undefined;
  participants?: Member[] | undefined;
  metadata?: UnifiedMetaDataOptions<
    PhaseData<BaseData<any, any, StructuredMetadata<any, any>, Attachment>, BaseData<any, any, StructuredMetadata<any, any>, Attachment>>, 
    PhaseData<BaseData<any, any, StructuredMetadata<any, any>, Attachment>, BaseData<any, any, StructuredMetadata<any, any>, Attachment>>, 
    StructuredMetadata<BaseData<any, any, StructuredMetadata<any, any>, Attachment>, BaseData<any, any, StructuredMetadata<any, any>, Attachment>>, 
    never
  >;
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




export interface CustomPhaseHooks<
  T extends BaseData<any> = BaseData<any, any>,
  K extends T = T
> {
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
  canTransitionTo: (currentPhase: Phase<PhaseData>, nextPhase: Phase<PhaseData>) => {
    // Ensure the next phase's start date is after the current phase's end date
  const isValidTransition = currentPhase.endDate! < nextPhase.startDate!;
  return isValidTransition;
  },

  handleTransitionTo: async (currentPhase: Phase<PhaseData>, nextPhase: Phase<PhaseData>) => {
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
      "PhaseApiError" as NotificationType
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
