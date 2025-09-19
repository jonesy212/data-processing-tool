import { addPhase } from "@/app/api/ApiPhases";
import { Attachment } from '@/app/components/documents/Attachment/attachment';
import { BaseData } from '@/app/components/models/data/Data';
import { K, T } from "@/app/components/models/data/dataStoreMethods";
import { Label } from '@/app/components/projects/branding/BrandingSettings';
import { SharedProperties } from "@/app/components/snapshots/SnapshotEvents";
import { BaseConfig, BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/configs/BaseConfig';
import { UnifiedMetadata } from "@/app/configs/database/MetaDataOptions";
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { NotificationType, useNotification } from "@/app/context/NotificationContext";
import { FC } from "react";
import { DocumentTypeEnum } from "../../../server/DocumentGenerator";
import { Lesson } from "../documents/CourseBuilder";
import { CollaborationOptions } from "../interfaces/options/CollaborationOptions";
import { CommonData } from "../models/CommonData";
import { Data } from "../models/data/Data";
import { Task } from "../models/tasks/Task";
import { Member } from "../models/teams/TeamMembers";
import { Progress } from "../models/tracker/ProgressBar";
import { TagsRecord } from "../snapshots";
import { DetailsItem } from "../state/stores/DetailsListStore";
import { VersionData } from "../versions/VersionData";


type PhaseEntity = BaseDataEntity;
type PhaseK = PhaseEntity;
type PhaseMetaType = DefaultMeta<PhaseEntity, PhaseK>;
type PhaseExcluded = DefaultExcludedFields<PhaseEntity>;




interface PhaseData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends BaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        SharedProperties<T, K, Meta> {
 // Define any properties specific to phase-related data
  phaseName?: string;
  startDate?: Date;
  endDate?: Date;
  subPhases?: PhaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
}

interface PhaseMeta<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends StructuredMetadata<T, K> {
  baseConfig: BaseConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  createdBy?: string;
  updatedBy?: string;
  archived?: boolean;
  relatedUsers?: string[];
  deadline?: Date | string;
  childIds?: K[];
  
  [key: string]: any; // flexible extra metadata
}

type DataWithOmittedFields<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = Omit<Data<T, K, Meta>, ExcludedFields>;


interface PhaseLite {
  id?: string;               // Identifier for the phase
  name?: string;             // Human-readable name
  description?: string;      // Short description
  startDate?: Date;          // Optional start date
  endDate?: Date;            // Optional end date
  index?: number;            // Optional ordering index
  color?: string;            // Optional display color
  status?: string;           // Optional status (active, complete, etc.)
  isActive?: boolean;        // Whether the phase is currently active
  isComplete?: boolean;      // Completion status
}

// Define a type for a phase
export interface Phase<
  T extends PhaseData<BaseDataEntity> = PhaseData<BaseDataEntity>,
  K extends T = T,
  Meta extends PhaseMeta<T, K> = PhaseMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> extends CommonData<T, K, Meta, ExcludedFields> {
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
  tasks?: Task<T, K, Meta, ExcludedFields>[];
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
  T extends BaseData<any, any, any, Attachment, any> = BaseData<any>,
  K extends T = T,
  Meta extends PhaseMeta<T, K, never> = PhaseMeta<T, K, never>
> implements Phase<T, K, Meta> {
  id: string = "";
  name: string = "";
  index?: number;
  description: string = "";
  startDate?: Date;
  endDate?: Date;
  subPhases: string[] | Phase<T, K, Meta>[] = [];
  component!: FC<any>;
  hooks: CustomPhaseHooks<T> = {
    resetIdleTimeout: async () => {},
    isActive: false,
    progress: null,
    condition: async () => true,
  };
  data: any;
  duration: number = 0;
  lessons: Lesson[] = [];
  tasks?: Task<T, K, Meta, ExcludedFields>[];
  members?: Member[];
  color?: string;
  status?: string;
  isActive?: boolean = true;
  type?: string;
  responsibleUsers?: string[];
  isComplete?: boolean = false;
  createdBy: string = "";
  updatedBy?: string;
  archived?: boolean;
  relatedUsers?: string[];
  deadline?: Date | string;
  currentMeta: PhaseMeta<BaseData<any, any, any, Attachment>> = {} as PhaseMeta<BaseData<any, any, any, Attachment>>;
  currentMetadata: UnifiedMetadata<T, K, Meta, never> = {} as UnifiedMetadata<T, K, Meta, never>;
  label: Label = { text: "", color: "#000000" };
  title: string = "";
  date: Date = new Date();
  collaborationOptions?: CollaborationOptions[];
  participants?: Member[];
  metadata?: UnifiedMetadata<T, K>;
  details?: DetailsItem<any>;
  categories?: string[];
  documentType?: DocumentTypeEnum | string;
  documentStatus?: string;
  documentOwner?: string;
  documentAccess?: string;
  documentSharing?: string;
  documentSecurity?: string;
  documentRetention?: string;
  documentLifecycle?: string;
  documentWorkflow?: string;
  documentIntegration?: string;
  documentReporting?: string;
  documentBackup?: string;

  // Flexible tags to satisfy TS
  tags?: string[] | TagsRecord<T, K> | undefined = [];

  constructor(options: {
    id?: string;
    name?: string;
    index?: number;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    subPhases?: string[] | Phase<T, K, Meta>[];
    component?: FC<any>;
    hooks?: CustomPhaseHooks<T>;
    data?: any;
    duration?: number;
    lessons?: Lesson[];
    tasks?: Task<T, K, Meta, ExcludedFields>[];
    members?: Member[];
    color?: string;
    status?: string;
    isActive?: boolean;
    type?: string;
    responsibleUsers?: string[];
    isComplete?: boolean;
    createdBy?: string;
    updatedBy?: string;
    archived?: boolean;
    relatedUsers?: string[];
    deadline?: Date | string;
    currentMeta?: PhaseMeta<BaseData<any, any, any, Attachment>>;
    currentMetadata?: UnifiedMetadata<T, K, Meta, never>;
    label?: Label;
    title?: string;
    date?: Date;
    collaborationOptions?: CollaborationOptions[];
    participants?: Member[];
    metadata?: UnifiedMetadata<T, K>;
    details?: DetailsItem<any>;
    categories?: string[];
    documentType?: DocumentTypeEnum | string;
    documentStatus?: string;
    documentOwner?: string;
    documentAccess?: string;
    documentSharing?: string;
    documentSecurity?: string;
    documentRetention?: string;
    documentLifecycle?: string;
    documentWorkflow?: string;
    documentIntegration?: string;
    documentReporting?: string;
    documentBackup?: string;
    tags?: string[] | TagsRecord<T, K>;
  } = {}) {
    Object.assign(this, options);
  }
}





export interface CustomPhaseHooks<
  T extends PhaseData<BaseData<any, any, StructuredMetadata<any, any>, Attachment>> = PhaseData<BaseData<any, any, StructuredMetadata<any, any>, Attachment>>,
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
  canTransitionTo: (currentPhase: Phase<PhaseData<T, K>>, nextPhase: Phase<PhaseData<T, K>>) => {
    // Ensure the next phase's start date is after the current phase's end date
  const isValidTransition = currentPhase.endDate! < nextPhase.startDate!;
  return isValidTransition;
  },

  handleTransitionTo: async (currentPhase: Phase<PhaseData<T, K>>, nextPhase: Phase<PhaseData<T, K>>) => {
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
const notifyTransition = (nextPhase: Phase<PhaseData<T, K>>): void => {
  console.log(`Now in phase: ${nextPhase.name}`);
};

export type { PhaseData, PhaseLite, PhaseMeta, PhaseEntity,
  PhaseK,
  PhaseMetaType,
  PhaseExcluded 
};

