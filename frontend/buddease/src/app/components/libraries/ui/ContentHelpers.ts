import { Task } from "../../models/tasks/Task";
import { Project } from "../../projects/Project";

// ContentHelpers.ts
export function isTask(content: Task | Project): content is Task {
    return (content as Task).status !== undefined;
  }
  
export function isProject(content: Task | Project): content is Project {
    return (content as Project).startDate !== undefined;
  }
  