// projects/Project.ts
import { BaseData } from '@/app/components/models/data/Data';
import { Progress } from "@/app/components/models/tracker/ProgressBar";
import { AllStatus } from '@/app/components/state/stores/DetailsListStore';
import { ButtonGenerator } from "@/app/generators/GenerateButtons";
import { Collaborator }  from '@/app/components/models/teams/TeamMembers'
import React, { ReactNode, useEffect, useState } from "react";
import { Exchange } from "../crypto/Exchange";
import { ScheduledData } from "@/app/components/calendar/ScheduledData";
import { Attachment } from "../documents/Attachment/attachment";
import { CollaborationOptions } from "../interfaces/options/CollaborationOptions";
import CommonDetails, { CommonData, SupportedData } from "../models/CommonData";
import { Data } from "../models/data/Data";
import { ExchangeData } from "../models/data/ExchangeData";
import { StatusType } from "../models/data/StatusType";
import { Task } from "../models/tasks/Task";
import { Team } from "../models/teams/Team";
import { Member } from "../models/teams/TeamMembers";
import { CustomPhaseHooks, Phase, PhaseEntity
  PhaseK,
  PhaseMetaType,
  PhaseExcluded,,  
  PhaseData
  PhaseMeta} from "../phases/Phase";
import { CustomComment } from "../state/redux/slices/BlogSlice";
import { implementThen } from '../state/stores/CommonEvent';
import { default as Comment, default as TodoImpl } from "../todos/Todo";
import { Idea } from "../users/Ideas";
import { User } from "../users/User";
import { VideoData } from "../video/Video";
import { AnalysisTypeEnum } from "./DataAnalysisPhase/AnalysisType";
import { DataAnalysisResult } from "./DataAnalysisPhase/DataAnalysisResult";
import { UpdatedProjectDetailsProps } from "./UpdateProjectDetails";
import { Tag } from "../models/tracker/Tag";
import { SharedTimestamps } from '@/RelatedProps'
import { DefaultMeta, DefaultExcludedFields, baseConfig } from '@/app/configs/BaseConfig';
import { sharedMetadata, sharedBaseData } from '@/app/configs/metadata/createMetadataState';
import { T, K, Meta } from '../models/data/dataStoreMethods';
import { ExcludedFields } from '../routing/Fields';
import { BaseDataEntity } from '../snapshots/ValidationRule';


// A project’s raw entity shape
type ProjectEntity = BaseDataEntity & {
  title: string;
  description?: string;
  budget?: number;
};

type ProjectK = ProjectEntity;
type ProjectMeta = DefaultMeta<ProjectEntity, ProjectK>;
type ProjectExcludedFields = DefaultExcludedFields<ProjectEntity>;


type TypedProject = Project<ProjectEntity, ProjectK, ProjectMeta, ProjectExcludedFields>;

export enum ProjectType {
  Internal = "Internal",
  External = "External",
  Hackathon = "Hackathon",
  CommunityDriven = "CommunityDriven", // Projects initiated and managed within the app by users from a larger community or network, aiming to benefit the community or society as a whole.
  Default = "Default", // Default project type for new projects that don't fit other categories
  Data = 'data'
  // Add more project types as needed
} 


interface Project<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment, 
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> extends BaseData<T, K, Meta, AttachmentType, ExcludedFields> {
  id: string;
  name: string;
  description: string; // Updated this line
  members: Member[];
  tasks: Task<T, K, Meta, ExcludedFields>[];
  comments?: (Comment<T, K, Meta> | CustomComment)[] | undefined;
  startDate: Date | undefined
  endDate: Date | undefined
  isActive: boolean;
  leader: User | null;
  budget: number | null;
  phase: Phase | null;
  phases: Phase[];
  type: ProjectType;
  status: AllStatus;
  currentPhase: Phase | null; // Provide a default value or mark as optional
  
  
  currentTeam?: Team<T, K, Meta, ExcludedFields>; // <-- Add this
  reassignedProjects?: Project<T, K, Meta, ExcludedFields>[]; // <-- Add this

  commnetBy?: User | Member;
  then?: typeof implementThen;
  data?: ProjectData<T, K, Meta, ExcludedFields>;
  customProperty?: string;
  projectProgress?: Progress
  // tags?: string[] | Tag[];
}

type ReassignProject = (
  newTeam: Team,
  newProject: Project,
  previousTeam: Team,
  reassignmentDate: Date
) => void;



export interface ProjectDetails {
  _id?: string  | undefined;
  id?: string;
  title: string;
  name: string;
  description: string;
  status: StatusType;
  tasks: Task<T, K, Meta, ExcludedFields>[];
  projectDetails?: Partial<ProjectDetails>;

  // Add other properties as needed
}



const reassignProject: ReassignProject = (
  newTeam: Team,
  newProject: Project,
  previousTeam: Team,
  reassignmentDate: Date
) => {
  // Step 1: Update project's current team assignment
  newProject.currentTeam = newTeam;

  // Step 2: Record the reassignment in reassignedProjects array
  newProject.reassignedProjects.push({
    projectId: newProject.id,
    project: newProject,
    projectName: newProject.name,
    previousTeam: previousTeam,
    reassignmentDate: reassignmentDate,
  });

  // Step 3: Implement any additional logic, such as notifying stakeholders, updating related data, etc.
  
  // Example: Log the reassignment details
  console.log(`Project "${newProject.name}" reassigned from "${previousTeam.teamName}" to "${newTeam.teamName}" on ${reassignmentDate}`);

  // Example: Trigger notifications or other actions

  // Optionally, you might persist these changes to your data storage or trigger further actions
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
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> implements Project {
  [key: string]: any;
  scheduled?: ScheduledData<any>;
  isScheduled?: boolean;
  ideas: Idea[] = [];
  dueDate?: Date | null | undefined;
  priority?: "low" | "medium" | "high" | undefined;
  assignee?: User | undefined;
  collaborators?: Collaborator[] | undefined;
  comments?: (Comment<T, K, Meta, ExcludedFields> | CustomComment)[] | undefined
  attachments?: Attachment[] | undefined;
  customProperty?: string;
  subtasks?: TodoImpl<any, any, any, any>[] | undefined;
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
  members: Member[] = []; // Provide a default value or mark as optional
  tasks: Task<T, K, Meta, ExcludedFields>[] = []; // Provide a default value or mark as optional
  startDate: Date= new Date(); // Provide a default value or mark as optional
  endDate: Date= new Date(); // Provide a default value or mark as optional // Provide a default value or mark as optional
  isActive: boolean = false; // Provide a default value or mark as optional
  leader: User | null = null; // Provide a default value or mark as optional
  budget: number | null = null; // Provide a default value or mark as optional
  phase: Phase | null = null;
  phases: Phase[] = []; // Provide a default value or mark as optional
  currentPhase: Phase | null = null; // Provide a default value or mark as optional
  description: string = "";
  title: string = "project_title";
  status: StatusType.Pending | StatusType.InProgress | StatusType.Completed = StatusType.Pending;
  tags:  string[] = [];
  then: typeof implementThen = implementThen;
  analysisType?: AnalysisTypeEnum | undefined;
  analysisResults: DataAnalysisResult<any>[] = [];
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
  constructor(init?: Partial<Project<T, K, Meta, ExcludedFields>>) {
    this.id = init?.id ?? "";
    this.name = init?.name ?? "";
    this.description = init?.description;
    this.members = init?.members ?? [];
    this.tasks = init?.tasks ?? [];
    this.comments = init?.comments;
  }
  // project implementation
}

const currentProject = new ProjectImpl<ProjectEntity, ProjectK, ProjectMeta, ProjectExcludedFields>({
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



const currentPhase: PhaseData<PhaseEntity, PhaseK, PhaseMetaType, Attachment, PhaseExcluded> = {
  id: "0",
  name: "name",
  startDate: new Date(),
  endDate: new Date(),
  subPhases: [],
  data: {} as BaseData<PhaseEntity, PhaseK, PhaseMetaType, Attachment, PhaseExcluded>,
  hooks: {} as CustomPhaseHooks,
  description: "", 
  label: {
    text: "",
    color: "",
  },
  currentMeta: {} as PhaseMeta<PhaseEntity, PhaseK, PhaseMetaType, PhaseExcluded>, 
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
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> extends Project, SharedTimestamps {
  project: Project;
  projects: Project[];
  phases: Phase[];
  transitionToNextPhase: () => void;
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
    metadata: {
      createdBy: string;
      createdAt: Date;
      updatedBy: string;
      updatedAt: Date;
    };
    exchangeData: ExchangeData[];
    averagePrice: number;
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
    data: {} as Data<T, K, Meta>,
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

export { reassignProject }