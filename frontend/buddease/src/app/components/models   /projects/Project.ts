//projects/Project.ts
import { User } from "../../todos/tasks/User";
import { Task } from "../tasks/Task";

interface Project {
  id: number;
  name: string;
  description: string | null;
  members: User[];
  tasks: Task[]
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  leader: User | null;
  budget: number | null;
  phase: string
  // Add other project-related fields as needed
  // ...
}


// Function to determine if the project is in a special phase

// Function to determine if the project is in a special phase
export function isProjectInSpecialPhase(project: Project): boolean {
  // Ensure project and project.phase are defined
  if (project && project.phase) {
    // Use a case-insensitive comparison for the phase value
    const phase = project.phase.toLowerCase().trim();

    // Define an array of special phases
    const specialPhases = ['special', 'customspecial', 'phase3', /* add more special phases */];

    // Check if the project's phase is in the array of special phases
    return specialPhases.includes(phase);
  }

  // Return false if the project or project.phase is not defined
  return false;
}

class ProjectImpl implements Project {
  id: number = 0; // Initialize id property to avoid error
  name: string = "";
  description: string | null = null; // Provide a default value or mark as optional
  members: User[] = []; // Provide a default value or mark as optional
  tasks: Task[] = []; // Provide a default value or mark as optional
  startDate: Date = new Date(); // Provide a default value or mark as optional
  endDate: Date | null = null; // Provide a default value or mark as optional
  isActive: boolean = false; // Provide a default value or mark as optional
  leader: User | null = null; // Provide a default value or mark as optional
  budget: number | null = null; // Provide a default value or mark as optional
  phase: string = ""; // Provide a default value or mark as optional
  // project implementation
}


const currentProject = new ProjectImpl();

currentProject.phase = 'Special'; // Change this phase as per your project's actual state

const inSpecialPhase = isProjectInSpecialPhase(currentProject);
console.log('Is project in special phase?', inSpecialPhase);






export default Project ;
