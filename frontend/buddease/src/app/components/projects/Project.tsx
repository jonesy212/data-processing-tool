//projects/Project.ts
import { ReactNode } from "react";
import CommonDetails, { CommonData, SupportedData } from "../models/CommonData";
import { Data } from "../models/data/Data";
import { Task } from "../models/tasks/Task";
import { CustomPhaseHooks, Phase } from "../phases/Phase";
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
  phase: Phase | null =  null   // Provide a default value or mark as optional
  phases: Phase[] = [] // Provide a default value or mark as optional
  currentPhase: Phase | null = null // Provide a default value or mark as optional
  description: string | null = null
  title: string = "project_title"
  status: "pending" | "inProgress" | "completed" = "pending"
  tags: string[] = []
  then: () => void = () => {};
  analysisType: string = "default";
  analysisResults: string[] = [];
  // project implementation
}

const currentProject = new ProjectImpl();
const currentPhase: Phase = {
  name: "name",
  startDate: new Date,
  endDate: new Date,
  subPhases: [],
  component: (props: {}, context?: any): ReactNode=>{ 
    return (
      <div>
        <p>Current Phase: {currentPhase.name}</p>
        <button onClick={() => context.transitionToNextPhase()}>
          Advance Phase
        </button>
      </div>
    );
  },
  hooks: {} as CustomPhaseHooks
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


const ProjectDetails: React.FC<{ project: Project }> = ({ project }) => (
  project ? <CommonDetails data={{} as CommonData<SupportedData>} /> : null
);

export { ProjectDetails };
export default Project ;