// utils.ts
import { Task } from "../components/models/tasks/Task";

let currentTaskId = 1;

export const generateNewTask = (projectId?: string): Task => {
  // Make the task ID more unique and identifiable between teams and projects
  const taskId = `${projectId}_${currentTaskId}`;
  
  // Increment the task ID for the next task
  currentTaskId++;
  
  return {
    id: taskId,
    title: "",
    description: "",
    assignedTo: [],
    dueDate: new Date(),
    status: "pending",
    priority: "medium",
    estimatedHours: 0,
    actualHours: 0,
    startDate: new Date(),
    completionDate: new Date(),
    endDate: new Date(),
    isActive: false,
    tags: [],
    dependencies: [],
    then: (arg0: (newTask: any) => void) => { },
    previouslyAssignedTo: [],
    done: false
  };  
};  





