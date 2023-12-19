//projects/Project.ts
import { User } from "../../todos/TodoReducer";
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
  // Add other project-related fields as needed
  // ...
}

export type { Project };
