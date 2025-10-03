import { addPhase } from "@/app/api/ApiPhases";
import { Attachment } from '@/app/components/documents/Attachment/attachment';
import { BaseData } from '@/app/models/data/Data';
import { Label } from '@/app/branding/BrandingSettings';
import { SharedProperties } from "@/app/snapshots/SnapshotEvents";
import { BaseConfig, BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/configs/BaseConfig';
import { UnifiedMetadata } from "@/server/database/MetaDataOptions";
import { StructuredMetadata } from '@/config/StructuredMetadata';
import { NotificationType, useNotification } from "@/app/context/NotificationContext";
import { FC } from "react";
import { DocumentTypeEnum } from "@/app/typings/documents";
import { Lesson } from "@/app/documents/editing/CourseBuilder";
import { CollaborationOptions } from "@/app/interfaces/options/CollaborationOptions";
import { CommonData } from "@/app/models/CommonData";
import { Data } from "@/app/models/data/Data";
import { Task } from "@/app/models/tasks/Task";
import { Member } from "@/app/models/teams/TeamMembers";
import { Progress } from "@/app/models/tracker/ProgressBar";
import { TagsRecord } from "@/app/snapshots";
import { DetailsItem } from "@/app/state/stores/DetailsListStore";
import { VersionData } from "@/app/versions/VersionData";


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
> extends StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedField> {
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
> = Omit<Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, ExcludedFields>;


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
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends CommonData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    id: string;
  index?: number;
  name: string;
  description: string | undefined
  startDate: Date | undefined;
  endDate: Date | undefined;
  subPhases: string[] | Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  component?: FC<any>; // Adjust to accept any props
  hooks?: CustomPhaseHooks<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  data?: any;
  lessons?: Lesson[];
  duration?: number;
  tasks?: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
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
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends PhaseMeta<T, K> = PhaseMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> implements Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  id: string = "";
  name: string = "";
  index?: number;
  description: string = "";
  startDate?: Date;
  endDate?: Date;
  subPhases: string[] | Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];
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
  tasks?: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
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
  currentMeta: PhaseMeta<BaseDataEntity, BaseDataEntity, DefaultMeta<BaseDataEntity, BaseDataEntity>, Attachment, DefaultExcludedFields<BaseDataEntity>, keyof BaseDataEntity> = {} as any;
  currentMetadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {} as any;
  label: Label = { text: "", color: "#000000" };
  title: string = "";
  date: Date = new Date();
  collaborationOptions?: CollaborationOptions[];
  participants?: Member[];
  metadata?: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | {};
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
  tags?: string[] | TagsRecord<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined = [];

  constructor(options: {
    id?: string;
    name?: string;
    index?: number;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    subPhases?: string[] | Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
    component?: FC<any>;
    hooks?: CustomPhaseHooks<T>;
    data?: any;
    duration?: number;
    lessons?: Lesson[];
    tasks?: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
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
    currentMeta?: PhaseMeta<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    currentMetadata?: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    label?: Label;
    title?: string;
    date?: Date;
    collaborationOptions?: CollaborationOptions[];
    participants?: Member[];
    metadata?: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | {};
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
    tags?: string[] | TagsRecord<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  } = {}) {
    Object.assign(this, options);
  }
}


export interface CustomPhaseHooks<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  [x: string]: any;
  canTransitionTo?: (nextPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean;
  handleTransitionTo?: (nextPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  resetIdleTimeout: () => Promise<void>;
  isActive: boolean;
  progress: Progress | null;
  condition: (idleTimeoutDuration: number) => Promise<boolean>;
  // Add other methods if needed
}

export const customPhaseHooks = {
  canTransitionTo: (
    currentPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
    nextPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => {
    // Ensure the next phase's start date is after the current phase's end date
  const isValidTransition = currentPhase.endDate! < nextPhase.startDate!;
  return isValidTransition;
  },

  handleTransitionTo: async (  
    currentPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
    nextPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => {
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

const saveCurrentPhaseData = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(phaseData: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Promise<void> => {
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
const notifyTransition = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(  
  nextPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): void => {
  console.log(`Now in phase: ${nextPhase.name}`);
};

export type { PhaseData, PhaseLite, PhaseMeta };




export const createCustomPhaseHooks = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(): CustomPhaseHooks<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => ({
  canTransitionTo: (
    currentPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
    nextPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => {
    if (!currentPhase.endDate || !nextPhase.startDate) return false;
    const isValidTransition = currentPhase.endDate < nextPhase.startDate;
    return isValidTransition;
  },

  handleTransitionTo: async (  
    currentPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
    nextPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => {
    console.log(`Transitioning from ${currentPhase.name} to ${nextPhase.name}`);
    await saveCurrentPhaseData(currentPhase);
    notifyTransition(nextPhase);
  },

  resetIdleTimeout: async () => {
    await Promise.resolve();
  },
  isActive: false,
  progress: null,
  condition: async () => true
});

