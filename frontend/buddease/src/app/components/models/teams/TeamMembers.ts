import { User } from "../../users/User";
import { UserRole } from "../../users/UserRole";

interface Member extends User {
  teamId: string;
  roleInTeam: string;
  // Add other member-specific properties here
}

// Define the MemberData interface extending Member
interface MemberData extends Member {
  datasets?: string;
  tasks?: string;
  questionnaireResponses?: any;
  // Add other fields specific to MemberData
}
interface TeamMember {
    id: number;
    username: string;
    email: string;
    password: string;
    tier: string;
    upload_quota: number;
    user_type: string;
    // Add other TeamMember-related fields as needed
  }
  

  const memberData: MemberData = {
    id: 1,
    username: 'member1',
    email: 'member1@example.com',
    teamId: "",
    roleInTeam: "",
    _id: "",
    tier: "",
    uploadQuota: 0,
    fullName: null,
    bio: null,
    userType: "",
    hasQuota: false,
    profilePicture: null,
    processingTasks: [],
    role: {} as UserRole,
    timeBasedCode: ""
  };
  const teamMember: TeamMember = {
    id: 1,
    username: "user1",
    email: "user1@example.com",
    password: "password1",
    tier: "free",
    upload_quota: 0,
    user_type: "individual",
    // Add other TeamMember-related field values
  };
  
  export type { TeamMember };
