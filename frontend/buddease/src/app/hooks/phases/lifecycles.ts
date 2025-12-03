// lifecycles.ts

import { getLastActivityTimeForPhase } from '@app/hooks/phases/PhaseActivity'
import { PhaseEntity, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields } from '@/app/typings/entities/PhaseEntiity';
import { Lesson } from "@/app/documents/editing/CourseBuilder";
import { PhaseEntity, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields } from '@/app/hooks/phases/lifecycle'
import { enhancedPhaseHook } from "@/app/hooks/phaseHooks/EnhancePhase";
import { PhaseHookConfig } from "@/app/hooks/phaseHooks/PhaseHooks";
import { CustomPhaseHooks, Phase } from "@/app/models/phases/Phase";
import { IdeaLifecyclePhase } from "@/app/models/phases/PhaseManager";
import { Attachment } from "@/app/documents/attachment/Attachment";
import {
  BaseDataEntity,
  DefaultExcludedFields,
  DefaultMeta,
} from "@/app/config/BaseConfig";

export interface PhaseOptions<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  name: string;
  startDate: Date;
  endDate: Date;
  subPhases: string[];
}

export interface LifecycleState<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  currentPhase: PhaseOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  previousPhase: PhaseOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  phaseHistory: PhaseOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  isTransitioning: boolean;
  lastActivityTime: number;
}

export interface LifecycleConfig<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  phases: PhaseOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  initialPhase?: string;
  autoAdvance?: boolean;
  onPhaseChange?: (from: PhaseOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null, to: PhaseOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  onTransitionError?: (error: Error) => void;
}

export interface LifecycleTransition<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  from: PhaseOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  to: PhaseOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  timestamp: Date;
  success: boolean;
  error?: string;
}


export interface PhaseOptions<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  name: string;
  startDate: Date;
  endDate: Date;
  subPhases: string[];
}

// Define a function to generate a phase object
const generatePhase = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  name: string, 
  subPhases: string[],
  id: string,
  description: string,
  projectId: string
): PhaseOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  const currentDate = new Date();
  
  return {
    // Required properties from PhaseOptions
    id,
    name,
    description,
    projectId,
    date: currentDate,
    
    // Your existing properties
    startDate: currentDate,
    endDate: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000), // Default: 7 days from start
    subPhases,
    component: IdeaLifecyclePhase,
    duration: 0,
    lessons: [] as Lesson[], // Fixed: should be an array, not empty object
    
    hooks: {
      canTransitionTo: (nextPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
        return !!enhancedPhaseHook.canTransitionTo(
          nextPhase as Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & PhaseHookConfig
        );
      },
      handleTransitionTo: (nextPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
        console.log("Transitioning to", nextPhase);
        enhancedPhaseHook.handleTransitionTo(
          nextPhase as Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & PhaseHookConfig
        );
        return true;
      },
      resetIdleTimeout: async () => {},
      isActive: false,
      progress: {
        id: `${id}-progress`,
        name: '', 
        color: '', 
        description: '',
        value: 0,
        label: `${name} Progress`,
        current: 0,
        max: 100,
        percentage: 0,
        min: 0, 
        done: false,
      },
      condition: async (idleTimeoutDuration: number): Promise<boolean> => {
        const lastActivityTime = getLastActivityTimeForPhase(name);
        const currentTime = new Date().getTime();
        const isIdle = (currentTime - lastActivityTime) >= idleTimeoutDuration;
        return isIdle;
      }
    } as CustomPhaseHooks<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  };
};



// Common Functions
const generateGenericPhase = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(name: string, subPhases: string[]): PhaseOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  return {
    id, 
    description, 
    projectId, 
    date,
    name,
    startDate: new Date(),
    endDate: new Date(),
    subPhases,
    component: IdeaLifecyclePhase,
    duration: 0,
    lessons: {} as Lesson[],
    hooks: {
      canTransitionTo: (nextPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
        return !!enhancedPhaseHook.canTransitionTo(
          nextPhase as Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & PhaseHookConfig
        );
      },
      handleTransitionTo: (nextPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
        console.log("Transitioning to", nextPhase);
        enhancedPhaseHook.handleTransitionTo(
          nextPhase as Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & PhaseHookConfig
        );
        return true;
      },
      resetIdleTimeout: async () => {},
      isActive: false,
      progress: {
        id: '',
        value: 0,
        label: '',
        current: 0,
        max: 0,
        percentage: 0,
                label: `${name} Progress`,
        current: 0,
        max: 100,
        percentage: 0,
        min: 0, 
        done: false,
      },
      condition: async (idleTimeoutDuration: number): Promise<boolean> => {
        // Fetch the last activity time for the current phase
        const lastActivityTime = getLastActivityTimeForPhase(name); // Replace with actual implementation
        const currentTime = new Date().getTime();

        // Check if the current time exceeds the last activity time plus the idle timeout duration
        const isIdle = (currentTime - lastActivityTime) >= idleTimeoutDuration;
        return isIdle;
      }
    } as CustomPhaseHooks<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  };
};


const lifecyclePhases: PhaseOptions<PhaseEntity, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields>[] = [
  generatePhase("Idea Lifecycle", ["Idea", "Team Building", "Ideation"]),
  // Add more phases as needed using the generatePhase function
  generateGenericPhase("UI Design", ["Wireframing", "Visual Design", "Prototyping", "User Testing"]),
];

const ideaLifecyclePhases: PhaseOptions<PhaseEntity, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields>[] = [
  { 
    id: '',
    description: '', 
    projectId: '', 
    date: new Date(),
    name: "Idea Lifecycle",
    startDate: new Date(),
    endDate: new Date(),
    subPhases: ["Idea", "Team Building", "Ideation"],
    component: IdeaLifecyclePhase,
    duration: 0,
    lessons: {} as Lesson[],
    hooks: {
      canTransitionTo: (nextPhase: Phase<PhaseEntity, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields>) => {
        return !!enhancedPhaseHook.canTransitionTo(
          nextPhase as Phase<PhaseEntity, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields> & PhaseHookConfig
        );
      },
      handleTransitionTo: (nextPhase: Phase<PhaseEntity, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields>) => {
        console.log("Transitioning to", nextPhase);
        enhancedPhaseHook.handleTransitionTo(
          nextPhase as Phase<PhaseEntity, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields> & PhaseHookConfig
        );
        return true;
      },
      resetIdleTimeout: async () => { },
      isActive: false,
      progress: null,
      condition: function (idleTimeoutDuration: number): Promise<boolean> {
        throw new Error("Function not implemented.");
      }
    }
   },
];


// Define Unique Phases
const appPlanningLifecyclePhases: PhaseOptions[] = [
  generateGenericPhase("App Planning", ["Idea Validation", "Feature Planning", "Timeline Setup"]),
  generateGenericPhase("Development", ["Coding", "Testing", "Debugging", "Deployment"]),
  generateGenericPhase("UX/UI Design", ["User Research", "Wireframing", "Prototyping", "Testing"]),
  generateGenericPhase("Post-Launch Activities", ["Data Analysis", "Refactoring/Rebranding", "Collaboration Settings"]),
  generateGenericPhase("User Experience", ["User Testing", "Feedback Incorporation", "UI Refinement"]),
  generateGenericPhase("Maintenance", ["Bug Fixing", "Feature Enhancement", "Performance Optimization"]),
  generateGenericPhase("End of Life", ["Deprecation", "Sunsetting", "Archival"]),
];

const genericLifecyclePhases: PhaseOptions[] = [
  ...appPlanningLifecyclePhases,
  generateGenericPhase("Maintenance", ["Bug Fixing", "Feature Enhancement", "Performance Optimization"]),
  generateGenericPhase("End of Life", ["Deprecation", "Sunsetting", "Archival"]),
];

const projectLifecycleManagementPhases: PhaseOptions[] = [
  generateGenericPhase("Team Formation", ["Recruitment", "Roles Assignment", "Onboarding"]),
  generateGenericPhase("Brainstorming", ["Idea Generation", "Concept Evaluation", "Feature Prioritization"]),
  generateGenericPhase("Prototyping", ["Mockups", "Interactive Prototypes", "User Feedback"]),
  generateGenericPhase("Development Sprint", ["Sprint Planning", "Coding", "Code Review", "Testing", "Demo"]),
  generateGenericPhase("Launch Preparation", ["Marketing Strategy", "User Training", "Pre-launch Testing"]),
  generateGenericPhase("User Feedback and Iteration", ["Feedback Collection", "Feature Enhancement", "Usability Testing"]),
  generateGenericPhase("Performance Analysis", ["Usage Metrics", "Performance Metrics", "User Satisfaction"]),
  generateGenericPhase("Continuous Improvement", ["Feedback Incorporation", "Feature Optimization", "Process Refinement"]),
  generateGenericPhase("Project Review and Documentation", ["Lessons Learned", "Documentation", "Report Generation"]),
];

// Final Array of All Phases
const allLifecyclePhases = [
  ...ideaLifecyclePhases,
  ...appPlanningLifecyclePhases,
  ...genericLifecyclePhases,
  ...projectLifecycleManagementPhases,
];


export {
  allLifecyclePhases,
  appPlanningLifecyclePhases,
  genericLifecyclePhases,
  ideaLifecyclePhases,
  projectLifecycleManagementPhases
};
// Rest of the code remains unchanged
