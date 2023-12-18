import { DataProcessingTask } from "./DataProcessingTask";
// users.tsx
export interface User {
    id: number;
    username: string;
    email: string;
    password: string;
    tier: string;
    uploadQuota: number;
    fullName: string | null;
    bio: string | null;
    profilePicture: string | null;
    processingTasks: DataProcessingTask[];
  }