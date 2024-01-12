// User.tsx
import CommonDetails from "../models/CommonDetailsProps";
import { Team } from "../models/teams/Team";
import { TeamMember } from "../models/teams/TeamMembers";
import Project from "../projects/Project";
import { DataProcessingTask } from "../todos/tasks/DataProcessingTask";

export interface User {
  id?: number;
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
  id: User['id'];
  datasets?: string;
  tasks?: string;
  questionnaireResponses?: any;
  chatSettings?: string
  projects?: Project[];
  teams?: Team[];
  teamMembers?: TeamMember[];
  
}

// using commong detais we genrate detais for components by mapping through the objects.
const UserDetails: React.FC<{ user: User }> = ({ user }) => (
  user ? <CommonDetails<User> data={user} /> : <div>User not available</div>
);

export { UserDetails };