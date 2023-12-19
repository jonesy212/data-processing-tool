import { User } from "../../todos/TodoReducer";

interface Task {
    id: number;
    name: string;
    description: string;
    assignedTo: User[];
    dueDate: Date;
    status: 'todo' | 'inProgress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    estimatedHours: number | null;
    actualHours: number | null;
    startDate: Date | null;
    completionDate: Date | null;
    endDate: Date | null,
    isActive: boolean,
    tags: string[]; // Assuming tasks can have tags
    dependencies: Task[]; // Other tasks this task depends on
    // Add other task-related fields as needed
}
  
export type { Task };
