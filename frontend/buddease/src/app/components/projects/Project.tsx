//projects/Project.ts
import { ButtonGenerator } from "@/app/generators/GenerateButtons";
import React, { ReactNode, useEffect, useState } from "react";
import CommonDetails, { CommonData, SupportedData } from "../models/CommonData";
import { Data } from "../models/data/Data";
import { StatusType } from "../models/data/StatusType";
import { Task } from "../models/tasks/Task";
import { Member } from "../models/teams/TeamMembers";
import { CustomPhaseHooks, Phase } from "../phases/Phase";
import { implementThen } from '../state/stores/CommonEvent';
import { default as Comment, default as TodoImpl } from "../todos/Todo";
import { User } from "../users/User";
import { VideoData } from "../video/Video";
import { DataAnalysisResult } from "./DataAnalysisPhase/DataAnalysisResult";
import { UpdatedProjectDetailsProps } from "./UpdateProjectDetails";
import { Attachment } from "../documents/Attachment/attachment";
import { Idea } from "../users/Ideas";


export enum ProjectType {
  Internal = "Internal",
  External = "External",
  Hackathon = "Hackathon",
  CommunityDriven = "CommunityDriven", // Projects initiated and managed within the app by users from a larger community or network, aiming to benefit the community or society as a whole.
  Default = "Default", // Default project type for new projects that don't fit other categories
  Data = 'data'
  // Add more project types as needed
} 


interface Project extends Data {
  id: string;
  name: string;
  description: string | null; // Updated this line
  members: Member[];
  tasks: Task[];
  startDate: Date
  endDate: Date
  isActive: boolean;
  leader: User | null;
  budget: number | null;
  phase: Phase | null;
  phases: Phase[];
  type: ProjectType
  currentPhase: Phase | null; // Provide a default value or mark as optional
  comments?: Comment[];  // Add other project-related fields as needed
  commnetBy?: User | Member;
  then?: typeof implementThen;
  
}

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

class ProjectImpl implements Project {
  [key: string]: any;
  scheduled?: boolean | undefined;
  ideas: Idea[] = [];
  dueDate?: Date | null | undefined;
  priority?: "low" | "medium" | "high" | undefined;
  assignee?: User | null | undefined;
  collaborators?: string[] | undefined;
  comments?: Comment[] | undefined;
  attachments?: Attachment[] | undefined;

  subtasks?: TodoImpl[] | undefined;
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
  videoData: VideoData = {} as VideoData;
  _id: string = "0";
  id: string = "0"; // Initialize id property to avoid error
  name: string = "projectName";
  members: Member[] = []; // Provide a default value or mark as optional
  tasks: Task[] = []; // Provide a default value or mark as optional
  startDate: Date= new Date(); // Provide a default value or mark as optional
  endDate: Date= new Date(); // Provide a default value or mark as optional // Provide a default value or mark as optional
  isActive: boolean = false; // Provide a default value or mark as optional
  leader: User | null = null; // Provide a default value or mark as optional
  budget: number | null = null; // Provide a default value or mark as optional
  phase: Phase | null = null;
  phases: Phase[] = []; // Provide a default value or mark as optional
  currentPhase: Phase | null = null; // Provide a default value or mark as optional
  description: string | null = null;
  title: string = "project_title";
  status: StatusType.Pending | StatusType.InProgress | StatusType.Completed = StatusType.Pending;
  tags: string[] = [];
  then: typeof implementThen = implementThen;
  analysisType?: AnalysisTypeEnum | undefined;
  analysisResults: DataAnalysisResult[] = [];

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
  // project implementation
}

const currentProject = new ProjectImpl();
const currentPhase: Phase = {
  name: "name",
  startDate: new Date(),
  endDate: new Date(),
  subPhases: [],
  data: {} as Data,
  hooks: {} as CustomPhaseHooks,
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

export interface ProjectData extends Project {
  project: Project;
  projects: Project[];
  phases: Phase[];
  transitionToNextPhase: () => void;
}

currentProject.phases = [
  {
    name: currentPhase.name,
    startDate: (currentPhase.startDate),
    endDate: (currentPhase.endDate),
    subPhases: [],
    data: {} as Data,
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

const inSpecialPhase = isProjectInSpecialPhase(currentProject);
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

const ProjectDetails: React.FC<UpdatedProjectDetailsProps> = ({ projectDetails }) => {
  const [details, setDetails] = useState<ProjectData | null>(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      const details = await projectDetails;
      setDetails(details);
    };

    fetchProjectDetails();
  }, [projectDetails]);

  return details ? (
    <>
      <CommonDetails
        data={{} as CommonData<SupportedData>}
        details={
          {
            _id: details.project._id || '',
            id: details.project.id || '',
            title: details.project.title || '',
            description: details.project.description || '',
            status: details.project.status || StatusType.Pending,
            // analysisResults: details.project.analysisResults || [],
          }
        }
      />
      <ButtonGenerator
        onTransitionToPreviousPhase={transitionToPreviousPhase} // Pass the function as a prop
      />
    </>
  ) : null;
};
  

export type { Project, ProjectDetails };

