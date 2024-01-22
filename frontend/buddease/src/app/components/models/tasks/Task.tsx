// Task.ts
import { User } from "@/app/components/users/User";
import CommonDetails from "../CommonData";
import { Data } from "../data/Data";

interface Task extends Data {
  id: string | number;
  title: string;
  description: string;
  then(arg0: (newTask: any) => void): unknown;
  assignedTo: User[];
  dueDate: Date;
  status: 'pending' | 'inProgress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  estimatedHours?: number | null;
  actualHours?: number | null;
  completionDate?: Date | null;
  dependencies?: Task[];
  previouslyAssignedTo: User[]
  done: boolean; 
  data: Data;
  [Symbol.iterator](): Iterator<any>;
  some: (callbackfn: (value: Task, index: number, array: Task[]) => unknown, thisArg?: any) => boolean;
}

// using commong detais we genrate detais for components by mapping through the objects.
const TaskDetails: React.FC<{ task: Task }> = ({ task }) => (
  
  <CommonDetails data= { task } />
);

export { TaskDetails };
export type { Task };

