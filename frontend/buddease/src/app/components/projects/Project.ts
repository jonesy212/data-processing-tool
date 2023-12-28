//projects/Project.ts
import { Task } from "../models/tasks/Task";
import { CustomPhaseHooks, Phase } from "../phases/ideaPhase/Phase";
import { User } from "../todos/tasks/User";

interface Project {
  id: string;
  name: string;
  description: string | null;
  members: User[];
  tasks: Task[]
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  leader: User | null;
  budget: number | null;
  phases: Phase[]
  // Add other project-related fields as needed
  // ...
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
  id: string = '0'; // Initialize id property to avoid error
  name: string = "projectName";
  description: string | null = null; // Provide a default value or mark as optional
  members: User[] = []; // Provide a default value or mark as optional
  tasks: Task[] = []; // Provide a default value or mark as optional
  startDate: Date = new Date(); // Provide a default value or mark as optional
  endDate: Date | null = null; // Provide a default value or mark as optional
  isActive: boolean = false; // Provide a default value or mark as optional
  leader: User | null = null; // Provide a default value or mark as optional
  budget: number | null = null; // Provide a default value or mark as optional
  phases: Phase[] = [] // Provide a default value or mark as optional
  // project implementation
}

const currentProject = new ProjectImpl();
const currentPhase = {
  name: "name",
  startDate: "startDate",
  endDate: "endDate",
};

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
      canTransitionTo: (nextPhase: string) => false, // Provide your implementation
      handleTransitionTo: (nextPhase: string) => {
        // Provide your implementation
        
      },
    } as CustomPhaseHooks,
    // Added missing 'hooks' property
  },
];

const inSpecialPhase = isProjectInSpecialPhase(currentProject);
console.log('Is project in special phase?', inSpecialPhase);





export default Project ;
