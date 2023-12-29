import { DataProcessingTask } from "./DataProcessingTask";
// users.tsx
export interface User {
  id: number;
  username: string;
  email: string;
  tier: string;
  uploadQuota: number;
  fullName: string | null;
  bio: string | null;
  userType: string,
  hasQuota: boolean,
  profilePicture: string | null;
  processingTasks: DataProcessingTask[];
  data?: UserData
}


// Placeholder for user data
export interface UserData {
  datasets?: string;
  tasks?: string;
  questionnaireResponses?: any;
}