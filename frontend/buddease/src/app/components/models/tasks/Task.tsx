// Task.ts
import { User } from "@/app/components/todos/tasks/User";
import CommonDetails from "../CommonDetailsProps";

interface Task {
  then(arg0: (newTask: any) => void): unknown;
  id: string;
  title: string;
  description?: string;
  assignedTo: User[];
  dueDate: Date;
  status: 'pending' | 'todo' | 'inProgress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  estimatedHours?: number | null;
  actualHours?: number | null;
  startDate?: Date | null;
  completionDate?: Date | null;
  endDate?: Date | null,
  isActive: boolean,
  tags: string[];
  dependencies?: Task[];
  previouslyAssignedTo: User[]
  done: boolean; 
  // Add other task-related fields as needed
}

// using commong detais we genrate detais for components by mapping through the objects.
const TaskDetails: React.FC<{ task: Task }> = ({ task }) => (
  
  <CommonDetails<Task> data= { task } />
);

export { TaskDetails };
export type { Task };

