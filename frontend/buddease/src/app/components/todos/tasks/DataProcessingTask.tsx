import { User } from "../../users/User";

// dataProcessingTaskInterfaces.tsx
export interface DataProcessingTask {
    id: number;
    name: string;
    description: string | null;
    status: string;
    inputDatasetId: number | null;
    outputDatasetId: number | null;
    createdAt: Date;
    startTime: Date | null;
    completionTime: Date | null;
    user: User;
  }
  