// Phase.ts
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
import { Member } from '@/app/models/members/Member'
import { Dependency } from '@/app/models/realtime/IntegrationLogic';
import { Task } from "@/app/models/tasks/Task";
import { Progress } from "@/app/models/tracker/ProgressBar";
import { TagsRecord } from '@/app/models/tracker/Tag';
import { SharedProperties } from "@/app/snapshots/SnapshotEvents";
import { ValidationResult } from '@/app/components/database/SchemaEvolutionManager';
import { useNotification } from '@/app/state/context/NotificationContext';
import { Milestone } from '@/app/typings/milestoneTypes'
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

  // Add hierarchical properties:
  level?: number; // 0 = root, 1 = subphase, etc.
  parentPhaseId?: string;
  dependencies?: string[]; // IDs of phases this depends on
  prerequisites?: string[]; // IDs of phases that must complete before this
  milestones?: Milestone[]; // From milestoneTypes.ts
  riskLevel?: 'low' | 'medium' | 'high';
  estimatedEffort?: number;
  actualEffort?: number;
  isParallel?: boolean;
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
  currentMeta: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
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
  tags?: string[] | TagsRecord<T> = [];

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
    return (currentPhase.isComplete ?? false) && !(nextPhase.isActive ?? false);
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
    const errors = [];
    
    if (!phase.name) {
      errors.push({
        field: 'name',
        message: 'Phase name is required',
        rule: 'required'
      });
    }
    
    if (!phase.id) {
      errors.push({
        field: 'id',
        message: 'Phase ID is required',
        rule: 'required'
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
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
>(
  phaseData: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): Promise<void> => {
  try {
    // Use the addPhase API function to save the current phase
    await addPhase(phaseData);
    
    // Success notification (optional - if addPhase doesn't already notify)
    const { notify } = useNotification();
    notify({
      id: `phase_save_success_${phaseData.id || 'new'}_${Date.now()}`,
      message: "Phase data saved successfully",
      data: {
        entityType: 'phase',
        entityId: phaseData.id || 'new',
        action: 'save',
        phaseType: phaseData.type,
        phaseName: phaseData.name,
        phaseData: {
          id: phaseData.id,
          type: phaseData.type,
          name: phaseData.name,
          status: phaseData.status,
          order: phaseData.order
        },
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success' as const
    });
    
  } catch (error: any) {
    console.error('Failed to save current phase data:', error);
    
    // Enhanced error notification
    const { notify } = useNotification();
    const axiosError = error as AxiosError;
    
    let userMessage = "Failed to save phase data";
    let errorType = "PHASE_SAVE_ERROR";
    
    if (axiosError.response) {
      switch (axiosError.response.status) {
        case 400:
          userMessage = "Invalid phase data format";
          errorType = "PHASE_VALIDATION_ERROR";
          break;
        case 401:
          userMessage = "Authentication required to save phase data";
          errorType = "PHASE_AUTH_ERROR";
          break;
        case 403:
          userMessage = "Permission denied to save phase data";
          errorType = "PHASE_PERMISSION_ERROR";
          break;
        case 409:
          userMessage = "Phase conflict detected";
          errorType = "PHASE_CONFLICT_ERROR";
          break;
        case 422:
          userMessage = "Phase data validation failed";
          errorType = "PHASE_DATA_VALIDATION_ERROR";
          break;
        case 500:
          userMessage = "Server error while saving phase data";
          errorType = "PHASE_SERVER_ERROR";
          break;
      }
    } else if (axiosError.request) {
      userMessage = "Network error: Unable to save phase data";
      errorType = "PHASE_NETWORK_ERROR";
    }
    
    // Send notification using consistent object format
    notify({
      id: `phase_save_error_${phaseData.id || 'new'}_${Date.now()}`,
      message: userMessage,
      data: {
        entityType: 'phase',
        entityId: phaseData.id || 'new',
        action: 'save',
        phaseType: phaseData.type,
        phaseName: phaseData.name,
        phaseData: {
          id: phaseData.id,
          type: phaseData.type,
          name: phaseData.name,
          status: phaseData.status
        },
        errorDetails: {
          originalError: axiosError.message,
          errorType: errorType,
          statusCode: axiosError.response?.status,
          errorData: axiosError.response?.data,
          timestamp: new Date().toISOString()
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_ERROR,
      level: 'error' as const,
      metadata: {
        isPhaseError: true,
        phaseType: phaseData.type,
        requiresRetry: true,
        retryAction: () => saveCurrentPhaseData(phaseData)
      },
      action: {
        label: "Retry Save",
        onClick: () => saveCurrentPhaseData(phaseData)
      }
    });
    
    // Optional: Provide guidance for common phase save errors
    if (errorType === 'PHASE_CONFLICT_ERROR') {
      notify({
        id: `phase_conflict_guidance_${Date.now()}`,
        message: "Phase already exists. Try updating instead?",
        data: {
          entityType: 'phase',
          entityId: phaseData.id,
          action: 'conflict_guidance'
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.INFO,
        level: 'info' as const,
        action: {
          label: "Update Phase",
          onClick: () => {
            // Call update function instead
            console.log("Navigate to phase update");
          }
        }
      });
    }
    
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

