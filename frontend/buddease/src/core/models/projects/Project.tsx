// Project.tsx
// projects/Project.ts (CLIENT-SIDE ONLY)
import { ScheduledData } from "@/core/calendar/ScheduledData";
import { Collaborator } from "@/core/collaborators/Collaborator";
import { CommonDetails } from '@/core/components/models/details/CommonDetails';
import { Team } from "@/core/components/teams/Team";
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { sharedBaseData } from '@/core/config/metadata/MetadataHooks';
import { Attachment } from '@/core/documents/attachment/Attachment';
import { SharedTimestamps } from '@/core/documents/RelatedProps';
import { ButtonGenerator } from "@/core/generators/GenerateButtons";
import { CollaborationOptions } from "@/core/interfaces/options/CollaborationOptions";
import { CommonData } from "@/core/models/CommonData";
import { Exchange } from '@/core/models/cypto/Exchange';
import { BaseData, Data } from '@/core/models/data/Data';
import { ExchangeData } from "@/core/models/data/ExchangeData";
import { StatusType } from "@/core/models/data/StatusType";
import { Member } from "@/core/models/members/Member";
import {
    CustomPhaseHooks, Phase,
    PhaseData,
} from '@/core/models/phases/Phase';
import { Task } from "@/core/models/tasks/Task";
import { Progress } from "@/core/models/tracker/ProgressBar";
import { DataAnalysisResult } from "@/core/projects/DataAnalysisPhase/DataAnalysisResult";
import { UpdatedProjectDetailsProps } from "@/core/projects/UpdateProjectDetails";
import { TeamService } from '@/core/services/teamService';
import { CustomComment } from "@/core/state/redux/slices/BlogSlice";
import { implementThen } from '@/core/state/stores/CommonEvent';
import { AllStatus } from '@/core/state/stores/DetailsListStore';
import { default as Comment, default as TodoImpl } from "@/core/todos/Todo";
import { AnalysisTypeEnum } from "@/core/typings/AnalysisType";
import { ProjectAttachment, ProjectEntity, ProjectExcludedFields, ProjectIncludedFields, ProjectK, ProjectMeta } from '@/core/typings/entities/ProjectEntity';
import {
    PhaseEntity,
    PhaseExcludedFields,
    PhaseK,
    PhaseMeta
} from '@/core/typings/phaseTypes';
import { VideoData } from '@/core/typings/videoTypes/Video';
import { Idea } from "@/core/users/Ideas";
import { User } from "@/core/users/User";
import React, { ReactNode, useEffect, useState } from "react";



type TypedProject = Project<ProjectEntity, ProjectK, ProjectMeta, ProjectAttachment, ProjectExcludedFields, ProjectIncludedFields>;

export enum ProjectType {
  Internal = "Internal",
  External = "External",
  Hackathon = "Hackathon",
  CommunityDriven = "CommunityDriven", // Projects initiated and managed within the app by users from a larger community or network, aiming to benefit the community or society as a whole.
  Default = "Default", // Default project type for new projects that don't fit other categories
  Data = 'data',
  Crypto = "Crypto", // Specialized for crypto trading/management
  DataAnalysis = "DataAnalysis" // More specific than 'Data'
  // Add more project types as needed
} 


export type ClientProjectEntity = BaseDataEntity & {
  // Core Project Info (matching your Project interface)
  name: string;
  title: string;
  description: string;
  
  // Project Management
  status: AllStatus; // Using your existing AllStatus type
  type: ProjectType;
  isActive: boolean;
  priority?: "low" | "medium" | "high";
  
  // Team & Collaboration (simplified from your interface)
  members: string[]; // Member IDs instead of full Member objects
  leader: string | null; // User ID instead of full User object
  currentTeam?: string; // Team ID instead of full Team object
  
  // Timeline
  startDate: Date | undefined;
  endDate: Date | undefined;
  dueDate?: Date | null;
  
  // Financial
  budget: number | null;
  cryptoBudget?: number; // Additional for crypto features
  
  // Phases & Progress
  phases: string[]; // Phase IDs instead of full Phase objects
  currentPhase: string | null; // Phase ID instead of full Phase object
  projectProgress?: Progress;
  progress?: number; // 0-100 percentage for quick reference
  
  // Tasks & Content
  tasks: string[]; // Task IDs instead of full Task objects
  comments?: string[]; // Comment IDs
  ideas: string[]; // Idea IDs
  attachments?: string[]; // Attachment IDs
  
  // Crypto Integration
  associatedWallet?: string;
  cryptoTransactions?: string[];
  tradingStrategy?: 'conservative' | 'moderate' | 'aggressive';
  hasCryptoSection: boolean;
  
  // Media & Analysis
  videoUrl?: string;
  videoThumbnail?: string;
  videoDuration?: number;
  analysisType?: AnalysisTypeEnum;
  analysisResults: string[]; // Analysis result IDs
  
  // Metadata
  tags: string[];
  categories?: string[];
  customProperty?: string;
  
  // Dates (from BaseDataEntity + your interface)
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  
  // Status flags
  isArchived?: boolean;
  isCompleted?: boolean;
  isBeingEdited?: boolean;
  isBeingDeleted?: boolean;
  isBeingCompleted?: boolean;
  isBeingReassigned?: boolean;
  
  // Collaboration features
  collaborationOptions?: CollaborationOptions[];
  communicationChannels?: {
    audio: boolean;
    video: boolean;
    text: boolean;
  };
  
  // Visibility
  visibility?: 'private' | 'team' | 'public';
};

// Simplified version for basic project operations
export type SimpleClientProject = Pick<Project, 
  'id' | 'name' | 'title' | 'description' | 'status' | 'type' | 'startDate' | 'endDate' | 'isActive'
> & {
  progress: number;
  members: string[];
  hasCryptoSection: boolean;
} & Pick<SharedTimestamps, 'createdAt' | 'updatedAt'>;


interface Project<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends BaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  id: string;
  name: string;
  description: string; 
  members: Member<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  tasks: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  comments?: (Comment<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | CustomComment)[] | undefined;
  startDate: Date | undefined
  endDate: Date | undefined
  isActive: boolean;
  leader: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  budget: number | null;
  phase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  phases: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  type: ProjectType;
  status: AllStatus;
  currentPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null; // Provide a default value or mark as optional
  done: boolean
  
  currentTeam?: Team<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> ;
  reassignedProjects?: Project<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];

  commnetBy?: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    | Member<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  data?: ProjectData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> ;
  customProperty?: string;
  projectProgress?: Progress
  then?: typeof implementThen;
  // tags?: string[] | Tag[];
}

type ReassignProject = (
  newTeam: Team,
  newProject: Project,
  previousTeam: Team,
  reassignmentDate: Date
) => void;



export interface ProjectDetails<  
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  _id?: string  | undefined;
  id?: string;
  title: string;
  name: string;
  description: string;
  status: StatusType;
  tasks: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  projectDetails?: Partial<ProjectDetails>;

  // Add other properties as needed
}


const unassignProject: UnassignProject = async (
  team: Team,
  project: Project,
  unassignmentDate: Date = new Date()
): Promise<void> => {
  try {
    // Client-side updates
    project.currentTeam = undefined;
    
    // Persist via TeamService
    await TeamService.unassignProject(team, project);
    
    // Additional logic
    console.log(`Project "${project.name}" unassigned from team "${team.teamName}"`);
    
  } catch (error) {
    // Rollback logic
    console.error('Error in unassignProject:', error);
    throw error;
  }
};



const assignProject: AssignProject = async (
  team: Team,
  project: Project,
  assignmentDate: Date = new Date()
): Promise<void> => {
  try {
    // Client-side updates
    project.currentTeam = team;
    
    // Persist via TeamService
    await TeamService.assignProject(team, project);
    
    // Additional logic
    console.log(`Project "${project.name}" assigned to team "${team.teamName}"`);
    
  } catch (error) {
    // Rollback logic
    project.currentTeam = null;
    console.error('Error in assignProject:', error);
    throw error;
  }
};

const getProgress = async (team: Team): Promise<number> => {
  try {
    return await TeamService.getTeamProgress(team.id);
  } catch (error) {
    console.error('Error fetching progress:', error);
    throw error;
  }
};


const reassignProject: ReassignProject = async (
  newTeam: Team,
  project: Project,
  previousTeam: Team,
  reassignmentDate: Date = new Date()
): Promise<void> => {
  try {
    // Step 1: Update project's current team assignment (client-side)
    project.currentTeam = newTeam;

    // Step 2: Record the reassignment in reassignedProjects array (client-side)
    const reassignmentRecord = {
      projectId: project.id,
      project: project,
      projectName: project.name,
      previousTeam: previousTeam,
      reassignmentDate: reassignmentDate,
    };

    project.reassignedProjects.push(reassignmentRecord);

    // Step 3: Persist to database via API call
    await TeamService.reassignProject(
      newTeam.id,
      project.id,
      previousTeam.id,
      reassignmentDate
    );

    // Step 4: Implement additional client-side logic
    console.log(`Project "${project.name}" reassigned from "${previousTeam.teamName}" to "${newTeam.teamName}" on ${reassignmentDate}`);

    // Step 5: Trigger notifications or other actions
    await triggerReassignmentNotifications(newTeam, project, previousTeam, reassignmentDate);

  } catch (error) {
    console.error('Error in reassignProject:', error);
    
    // Rollback client-side changes if persistence fails
    project.currentTeam = previousTeam;
    project.reassignedProjects.pop(); // Remove the last reassignment record
    
    throw error; // Re-throw to let caller handle the error
  }
};

// Function to determine if the project is in a special phase
export function isProjectInSpecialPhase(project: Project): boolean {
  // Ensure project and project.phases are defined
  if (project && project.phases) {
    // Get the current phase name
    const currentPhase = project.phases[project.phases.length - 1].name;

    // Use a case-insensitive comparison for the phase value
    const phase = currentPhase.toLowerCase().trim();

    // Define an array of special phases
    const specialPhases = [
      "special",
      "customspecial",
      "phase3" /* add more special phases */,
    ];

    // Check if the project's phase is in the array of special phases
    return specialPhases.includes(phase);
  }

  // Return false if the project or project.phase is not defined
  return false;
}

class ProjectImpl<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> implements Project<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  [key: string]: any;
  scheduled?: ScheduledData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  isScheduled?: boolean;
  ideas: Idea[] = [];
  dueDate?: Date | null | undefined;
  priority?: "low" | "medium" | "high" | undefined;
  assignee?: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
  collaborators?: Collaborator[] | undefined;
  comments?: (Comment<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>  | CustomComment)[] | undefined
  attachments?: Attachment[] | undefined;
  customProperty?: string;
  subtasks?: TodoImpl<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined;
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
  createdBy?: string | undefined;
  updatedBy?: string | undefined;
  isArchived?: boolean | undefined;
  isCompleted?: boolean | undefined;
  isBeingEdited?: boolean | undefined;
  isBeingDeleted?: boolean | undefined;
  isBeingCompleted?: boolean | undefined;
  isBeingReassigned?: boolean | undefined;
  collaborationOptions?: CollaborationOptions[] | undefined;
  videoData: VideoData<any, any> = {} as VideoData<any, any>;
  _id: string = "0";
  id: string = "0"; // Initialize id property to avoid error
  name: string = "projectName";
  members: Member<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = []; // Provide a default value or mark as optional
  tasks: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = []; // Provide a default value or mark as optional
  startDate: Date= new Date(); // Provide a default value or mark as optional
  endDate: Date= new Date(); // Provide a default value or mark as optional // Provide a default value or mark as optional
  isActive: boolean = false; // Provide a default value or mark as optional
  leader: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null = null; // Provide a default value or mark as optional
  budget: number | null = null; // Provide a default value or mark as optional
  phase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null = null;
  phases: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = []; // Provide a default value or mark as optional
  currentPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null = null; // Provide a default value or mark as optional
  description: string = "";
  title: string = "project_title";
  status: StatusType.Pending | StatusType.InProgress | StatusType.Completed = StatusType.Pending;
  tags:  string[] = [];
  then: typeof implementThen = implementThen;
  analysisType?: AnalysisTypeEnum | undefined;
  analysisResults: DataAnalysisResult<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];
  videoUrl: string = "videoUrl";
  videoThumbnail: string = "thumbnail";
  videoDuration: number = 0;
  videoStartTime: Date = new Date(0); // Initialize with the epoch (1970-01-01T00:00:00.000Z)
  videoEndTime: Date = new Date(0); // Initialize with the epoch (1970-01-01T00:00:00.000Z)
  type: ProjectType = ProjectType.Internal; 

  // Function to format time as HH:MM:SS
  formatTime(time: Date): string {
    return `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;
  }

  // Getters for formatted time strings
  get videoStartTimeString(): string {
    return this.formatTime(this.videoStartTime);
  }

  get videoEndTimeString(): string {
    return this.formatTime(this.videoEndTime);
  }

  // Function to format duration as HH:MM:SS
  formatDuration(durationInSeconds: number): string {
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = durationInSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  // Getter for formatted duration string
  get formattedVideoDuration(): string {
    return this.formatDuration(this.videoDuration);
  }
  constructor(init?: Partial<Project<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> >) {
    this.id = init?.id ?? "";
    this.name = init?.name ?? "";
    this.description = init?.description ?? '';
    this.members = init?.members ?? [];
    this.tasks = init?.tasks ?? [];
    this.comments = init?.comments;
  }
  // project implementation
}


const project: ClientProjectEntity = {
  // From BaseDataEntity
  id: "proj-123",
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-03-20'),
  
  // Core Project Info
  name: "AI Research Project",
  title: "Advanced AI Research Initiative",
  description: "Exploring machine learning algorithms for predictive analytics in financial markets",
  
  // Project Management
  status: "active" as AllStatus,
  type: ProjectType.Internal,
  isActive: true,
  priority: "high",
  
  // Team & Collaboration
  members: ["user-1", "user-2", "user-3"],
  leader: "user-1",
  currentTeam: "team-ai-research",
  
  // Timeline
  startDate: new Date('2024-01-15'),
  endDate: new Date('2024-12-31'),
  dueDate: new Date('2024-12-15'),
  
  // Financial
  budget: 50000,
  cryptoBudget: 10000,
  
  // Phases & Progress
  phases: ["phase-1", "phase-2", "phase-3"],
  currentPhase: "phase-2",
  projectProgress: {
    id: "",
    name: "",
    color: "",
    description: "",
    percentage: 65, 
    status: "in-progress",
  } as Progress,
  progress: 65,
  
  // Tasks & Content
  tasks: ["task-1", "task-2", "task-3"],
  comments: ["comment-1", "comment-2"],
  ideas: ["idea-1", "idea-2"],
  attachments: ["attachment-1", "attachment-2"],
  
  // Crypto Integration
  associatedWallet: "wallet-xyz-123",
  cryptoTransactions: ["txn-1", "txn-2", "txn-3"],
  tradingStrategy: "moderate",
  hasCryptoSection: true,
  
  // Media & Analysis
  videoUrl: "https://example.com/project-video",
  videoThumbnail: "https://example.com/thumbnail.jpg",
  videoDuration: 3600,
  analysisType: AnalysisTypeEnum.PREDICTIVE,
  analysisResults: ["analysis-1", "analysis-2"],
  
  // Metadata
  tags: ["AI", "Machine Learning", "Finance", "Crypto"],
  categories: ["Research", "Technology"],
  customProperty: "Custom project metadata",
  
  // Additional metadata
  createdBy: "admin-user",
  updatedBy: "project-leader",
  
  // Status flags
  isArchived: false,
  isCompleted: false,
  isBeingEdited: false,
  isBeingDeleted: false,
  isBeingCompleted: false,
  isBeingReassigned: false,
  
  // Collaboration features
  collaborationOptions: [
    { type: "brainstorming", enabled: true },
    { type: "file-sharing", enabled: true }
  ] as CollaborationOptions[],
  
  communicationChannels: {
    audio: true,
    video: true,
    text: true
  },
  
  // Visibility
  visibility: "team",
};

const currentProject = new ProjectImpl<ProjectEntity, ProjectK, ProjectMeta, ProjectAttachment, ProjectExcludedFields, ProjectIncludedFields>({
  id: "p1",
  name: "AI Research",
  description: "Exploring AI-powered project management",
  members: [],
  tasks: [],
  isActive: true,
  leader: null,
  budget: 50000,
  phase: null,
  phases: [],
  type: "Research" as ProjectType,
  status: "active" as AllStatus,
  currentPhase: null,
});



const currentPhase: PhaseData<PhaseEntity, PhaseK, PhaseMeta, Attachment, PhaseExcludedFields> = {
  id: "0",
  name: "name",
  startDate: new Date(),
  endDate: new Date(),
  subPhases: [],
  eventRecords: {}, 
  records: {}, 
  eventIds: [],
  data: {} as BaseData<PhaseEntity, PhaseK, PhaseMeta, Attachment, PhaseExcludedFields>,
  hooks: {} as CustomPhaseHooks<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  description: "", 
  label: {
    text: "",
    color: "",
  },
  currentMeta: {} as PhaseMeta, 
  currentMetadata: {
    baseConfig, sharedMetadata, sharedBaseData, taggable,
  },

  component: (props: {}, context?: any): ReactNode => {
    return (
      <div>
        <p>Current Phase: {currentPhase.name}</p>
        <button onClick={() => context.transitionToNextPhase()}>
          Advance Phase
        </button>
      </div>
    );
  },
  lessons: [],
  duration: 0,
  tasks: []
};

export interface ProjectData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends BaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    Project,
    SharedTimestamps {
  // Project-specific properties
  project: Project;
  projects: Project[];
  phases: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  transitionToNextPhase: () => void;
  currentPhase: ProjectPhase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  projectStatus: ProjectStatus<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  priority: ProjectPriority;
  tasks: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  
  // Project management
  timeline: ProjectTimeline;
  budget: ProjectBudget;
  resources: ProjectResource[];
  risks: ProjectRisk[];
  metrics: ProjectMetrics;
  
  // Team and stakeholders
  projectManager: string;
  teamMembers: Member<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  stakeholders: string[];
  
  // Project metadata
  projectMetadata?: {
    id: number;
    projectName: Project["name"];
    description: Project["description"];
    teamMembers: Team["members"];
    exchange: Exchange;
    communication: {
      audio: boolean;
      video: boolean;
      text: boolean;
    };
    collaborationOptions: {
      brainstorming: boolean;
      fileSharing: boolean;
      realTimeEditing: boolean;
    };
    metadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
    exchangeData: ExchangeData[];
    averagePrice: number;

    // Conversion metadata
    convertedFromSnapshot?: boolean;
    snapshotId?: string;
    conversionTimestamp?: string;
    originalSnapshotType?: string;
    projectTemplate?: string;
    industry?: string;
    complexity?: 'simple' | 'moderate' | 'complex';
    [key: string]: any;
  };
}

currentProject.phases = [
  {
 
    id: currentPhase.id,
    name: currentPhase.name,
    description: currentPhase.description,
    label: currentPhase.label,
    date: currentPhase.date,
    createdBy: currentPhase.createdBy,
    startDate: (currentPhase.startDate),
    endDate: (currentPhase.endDate),
    currentMeta: (currentPhase.currentMeta), 
    currentMetadata: (currentPhase.currentMetadata),
    subPhases: [],
    data: {} as Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    component: () => {
      return null;
    },
    hooks: {
      canTransitionTo: (nextPhase: Phase) => false,
      handleTransitionTo: (nextPhase: Phase) => {
        // Provide your implementation
      },
    } as CustomPhaseHooks,
    lessons: [],
    duration: 0,
    tasks: [],
  },
];

const inSpecialPhase = isProjectInSpecialPhase(await currentProject);
console.log("Is project in special phase?", inSpecialPhase);


const transitionToPreviousPhase = (setCurrentPhase: React.Dispatch<React.SetStateAction<Phase>>, currentPhase: Phase) => {
  // Assuming you have access to the current phase index and phases array
  // You can navigate to the previous phase by decrementing the index
  // Make sure to handle edge cases like the first phase

  const phases: Phase[] = []
  const currentIndex = phases.findIndex(phase => phase.name === currentPhase.name);
  
  if (currentIndex === -1) {
    console.error("Current phase not found in phases array.");
    return;
  }

  const previousIndex = currentIndex - 1;

  if (previousIndex < 0) {
    console.warn("Already at the first phase, cannot transition to a previous phase.");
    return;
  }

  const previousPhase = phases[previousIndex];
  
  // Perform any necessary actions to transition to the previous phase
  setCurrentPhase(previousPhase);
};

const ProjectDetailsComponents: React.FC<UpdatedProjectDetailsProps> = ({
  projectDetails,
}) => {
  const [details, setDetails] = useState<ProjectData | null>(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const response = await fetch("/api/projects/details"); // Replace with the appropriate API endpoint
        const details = await response.json();
        setDetails(details);
      } catch (error) {
        console.error("Error fetching project details:", error);
      }
    };

    fetchProjectDetails();
  }, [projectDetails]);

  return details ? (
    <>
      <CommonDetails
        data={{} as CommonData<BaseData<any>>}
        details={{
          _id: details.project._id || "",
          id: details.project.id || "",
          title: details.project.title || "",
          description: details.project.description || "",
          status: details.project.status || StatusType.Pending,
          updatedAt: details.updatedAt
            ? new Date(details.updatedAt)
            : undefined,
          analysisResults: details.project.analysisResults || [],
          currentMeta: details.project.currentMeta,
          currentMetadata: details.project.currentMetadata,
          createdBy: details.project.createdBy,
         
        }}
      />
      <ButtonGenerator
        onTransitionToPreviousPhase={transitionToPreviousPhase} // Pass the function as a prop
      />
    </>
  ) : null;
};
  
export default ProjectDetailsComponents
export type { Project };

  export { assignProject, getProgress, reassignProject, unassignProject };
