import { AppPhase, PhaseMilestone } from '@/app//typings/entities/PhaseEntity';
import { addPhase } from "@/app/api/ApiPhases";
import { Label } from '@/app/branding/BrandingSettings';
import { BaseConfig, BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { UnifiedMetadata } from "@/app/config/MetaDataOptions";
import { StructuredMetadata } from '@/app/config/StructuredMetadata';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { Lesson } from "@/app/documents/editing/CourseBuilder";
import { CollaborationOptions } from "@/app/interfaces/options/CollaborationOptions";
import { CommonData } from "@/app/models/CommonData";
import { BaseData } from '@/app/models/data/Data';
import { Dependency } from '@/app/models/realtime/IntegrationLogic';
import { Task } from "@/app/models/tasks/Task";
import { Member } from "@/app/models/teams/TeamMembers";
import { Progress } from "@/app/models/tracker/ProgressBar";
import { TagsRecord } from '@/app/models/tracker/Tag';
import { SharedProperties } from "@/app/snapshots/SnapshotEvents";
import { ValidationResult } from '@/app/snapshots/ValidationRule';
import { NotificationType, useNotification } from '@/app/state/context/NotificationContext';
import { DetailsItem } from "@/app/state/stores/DetailsListStore";
import { DocumentTypeEnum } from "@/app/typings/documentTypes";
import { PhaseMeta } from '@/app/typings/phaseTypes';
import { FC } from "react";

interface PhaseData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends BaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        SharedProperties<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
// Define any properties specific to phase-related data
  phaseName?: string;
  startDate?: Date;
  endDate?: Date;
  subPhases?: PhaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
}

interface PhaseMetaInterface<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  baseConfig: BaseConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  createdBy?: string;
  updatedBy?: string;
  archived?: boolean;
  relatedUsers?: string[];
  deadline?: Date | string;
  childIds?: K[];
  
  [key: string]: any; // flexible extra metadata
}

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
  duration?: number;
  description: string | undefined
  startDate?: Date | undefined;
  endDate?: Date | undefined;
  component?: FC<any>; 
  data?: any;
  color?: string;
  status?: string;
  isActive?: boolean;
  type?: string;
  responsibleUsers?: string[]; // IDs of users responsible for the phase
  isComplete?: boolean;
  projectId: string;
  assignedTeamIds?: string[];
  budget?: number;
  actualCost?: number;
  progress?: number;
  members?: Member<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  lessons?: Lesson[];
  documents?: string[]; // Document IDs associated with this phase
  subPhases?: string[] | Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  hooks?: CustomPhaseHooks<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  tasks?: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  dependencies?: Dependency[]; // Phase IDs this phase depends on
  milestones?: PhaseMilestone[];
  __typename?: "Phase";
  // status: 'planned' | 'active' | 'completed' | 'cancelled';
}

export class PhaseImpl<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> implements Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  id: string = "";
  projectId: string = "";
  name: string = "";

  index?: number;
  description: string = "";
  startDate?: Date;
  endDate?: Date;
  subPhases: string[] | Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];
  component!: FC<any>;
  hooks: CustomPhaseHooks<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
    resetIdleTimeout: async () => {},
    isActive: false,
    progress: null,
    condition: async () => true,
    canTransitionTo: (nextPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => false
  };
  data: any;
  duration: number = 0;
  lessons: Lesson[] = [];
  tasks?: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  members?: Member<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
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
  currentMeta: PhaseMeta = {} as any;
  currentMetadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {} as any;
  label: Label = { text: "", color: "#000000" };
  title: string = "";
  date: Date = new Date();
  collaborationOptions?: CollaborationOptions[];
  participants?: Member<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  metadata?: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
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
  tags?: string[] | TagsRecord<T> | undefined = [];

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
    members?: Member<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
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
    currentMeta?: PhaseMeta
    currentMetadata?: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    label?: Label;
    title?: string;
    date?: Date;
    collaborationOptions?: CollaborationOptions[];
    participants?: Member<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
    metadata?: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
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
    tags?: string[] | TagsRecord<T>;
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
  // ✅ CLEAN: No repetitive 6 parameters
  canTransitionTo: (currentPhase: AppPhase, nextPhase: AppPhase): boolean => {
    return currentPhase.isComplete && !nextPhase.isActive;
  },

  onPhaseStart: (phase: AppPhase): void => {
    console.log(`Starting phase: ${phase.name}`);
    // Phase start logic
  },

  onPhaseComplete: (phase: AppPhase): void => {
    console.log(`Completing phase: ${phase.name}`);
    // Phase completion logic
  },

  validatePhase: (phase: AppPhase): ValidationResult => {
    return {
      isValid: !!phase.name && !!phase.id,
      errors: phase.name ? [] : ['Phase name is required']
    };
  },

  getNextPhase: (currentPhase: AppPhase, availablePhases: AppPhase[]): AppPhase | null => {
    return availablePhases.find(phase => 
      customPhaseHooks.canTransitionTo(currentPhase, phase)
    ) || null;
  }
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
>() => ({
  canTransitionTo: (
    currentPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
    nextPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => {
    // Enhanced validation with better error handling
    if (!currentPhase.endDate || !nextPhase.startDate) {
      console.warn('Missing date information for phase transition');
      return false;
    }

    const isValidTransition = currentPhase.endDate < nextPhase.startDate;
    
    // Additional validation: check if current phase is complete
    if (currentPhase.isComplete !== true) {
      console.warn(`Current phase "${currentPhase.name}" is not marked as complete`);
      return false;
    }

    return isValidTransition;
  },

  handleTransitionTo: async (  
    currentPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
    nextPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => {
    // Log the transition with more context
    console.log(`Transitioning from "${currentPhase.name}" to "${nextPhase.name}" at ${new Date().toISOString()}`);

    try {
      // Perform any necessary cleanup for the current phase
      if (currentPhase.data) {
        await saveCurrentPhaseData(currentPhase.data);
      }

      // Update phase statuses (return new objects instead of mutating)
      const updatedCurrentPhase = {
        ...currentPhase,
        isActive: false,
        status: 'completed',
        updatedAt: new Date()
      };

      const updatedNextPhase = {
        ...nextPhase,
        isActive: true,
        status: 'active',
        updatedAt: new Date()
      };

      // Notify the user or other components
      await notifyTransition(updatedNextPhase);

      // Log successful transition
      console.log(`Successfully transitioned to phase: ${nextPhase.name}`);

      return { 
        previousPhase: updatedCurrentPhase, 
        currentPhase: updatedNextPhase 
      };

    } catch (error: unknown) {
      // Narrow the type before accessing .message
      if (error instanceof Error) {
        console.error(`Failed to transition from ${currentPhase.name} to ${nextPhase.name}:`, error);
        throw new Error(`Phase transition failed: ${error.message}`);
      } else {
        console.error(`Failed to transition from ${currentPhase.name} to ${nextPhase.name}:`, error);
        throw new Error(`Phase transition failed: ${String(error)}`);
      }
    }
  },

  resetIdleTimeout: async (phase?: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
    // Reset idle timeout with phase context
    if (phase) {
      console.log(`Resetting idle timeout for phase: ${phase.name}`);
    }
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('Idle timeout reset successfully');
  },

  // Additional helper methods
  validatePhaseDates: (phase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
    if (phase.startDate && phase.endDate) {
      return phase.startDate < phase.endDate;
    }
    return true; // phases without dates are valid
  },

  calculatePhaseProgress: (phase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
    if (!phase.startDate || !phase.endDate) return 0;
    
    const now = new Date();
    const totalDuration = phase.endDate.getTime() - phase.startDate.getTime();
    const elapsed = now.getTime() - phase.startDate.getTime();
    
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  }
});

