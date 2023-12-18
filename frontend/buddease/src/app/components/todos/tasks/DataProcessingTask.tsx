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
  
  // userInterfaces.tsx
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
  