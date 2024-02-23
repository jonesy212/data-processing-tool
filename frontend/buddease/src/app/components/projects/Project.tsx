//projects/Project.ts
import { ReactNode } from "react";
import CommonDetails, { CommonData, SupportedData } from "../models/CommonData";
import { Data } from "../models/data/Data";
import { Idea, Task } from "../models/tasks/Task";
import { CustomPhaseHooks, Phase } from "../phases/Phase";
import { Attachment, Todo } from "../todos/Todo";
import { User } from "../users/User";
interface Project extends Data{
  id: string;
  name: string;
  description: string | null; // Updated this line
  members: User[];
  tasks: Task[]
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  leader: User | null;
  budget: number | null;
  phase: Phase | null
  phases: Phase[]
  currentPhase: Phase | null // Provide a default value or mark as optional
  // Add other project-related fields as needed
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
    const specialPhases = ['special', 'customspecial', 'phase3', /* add more special phases */];

    // Check if the project's phase is in the array of special phases
    return specialPhases.includes(phase);
  }

  // Return false if the project or project.phase is not defined
  return false;
}

class ProjectImpl implements Project {
  [key: string]: any;
  scheduled?: boolean | undefined;
  ideas: Idea[]=[];
  dueDate?: Date | null | undefined;
  priority?: "low" | "medium" | "high" | undefined;
  assignee?: User | null | undefined;
  collaborators?: string[] | undefined;
  comments?: Comment[] | undefined;
  attachments?: Attachment[] | undefined;
  
  subtasks?: Todo[] | undefined;
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
  collaborationOptions?: CollaborationOption[] | undefined;
  videoData: VideoData = {} as VideoData;
  _id: string = '0'
  id: string = '0'; // Initialize id property to avoid error
  name: string = "projectName";
  members: User[] = []; // Provide a default value or mark as optional
  tasks: Task[] = []; // Provide a default value or mark as optional
  startDate: Date = new Date(); // Provide a default value or mark as optional
  endDate: Date | null = null; // Provide a default value or mark as optional
  isActive: boolean = false; // Provide a default value or mark as optional
  leader: User | null = null; // Provide a default value or mark as optional
  budget: number | null = null; // Provide a default value or mark as optional
  phase: Phase | null = null; 
  phases: Phase[] = [] // Provide a default value or mark as optional
  currentPhase: Phase | null = null // Provide a default value or mark as optional
  description: string | null = null
  title: string = "project_title"
  status: "pending" | "inProgress" | "completed" = "pending"
  tags: string[] = []
  then: () => void = () => {};
  analysisType: string = "default";
  analysisResults: string[] = [];


  videoUrl: string = "videoUrl";
  videoThumbnail: string = "thumbnail";
  videoDuration: number = 0;
  videoStartTime: Date = new Date(0); // Initialize with the epoch (1970-01-01T00:00:00.000Z)
  videoEndTime: Date = new Date(0); // Initialize with the epoch (1970-01-01T00:00:00.000Z)

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
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
  startDate: new Date,
  endDate: new Date,
  subPhases: [],
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

  hooks: {} as CustomPhaseHooks,
  data: {} as Data
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
    startDate: new Date(currentPhase.startDate),
    endDate: new Date(currentPhase.endDate),
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
  },
];

const inSpecialPhase = isProjectInSpecialPhase(currentProject);
console.log('Is project in special phase?', inSpecialPhase);


const ProjectDetails: React.FC<{ project: Project }> = async ({ project }) => (
  await project ? <CommonDetails data={{} as CommonData<SupportedData>} /> : null
);

export { ProjectDetails };
export default Project ;