import { Persona } from "@/app/pages/personas/Persona";
import { User } from "../../users/User";
import { UserRole } from "../../users/UserRole";
import { Team } from "./Team";

export interface Member extends User {
  teamId: string;
  roleInTeam: string;
  memberName: string;
  teams?: Team[];
  // Add other member-specific properties here
}

// Define the Contributor interface or type// Define the Contributor interface extending Member
interface Contributor extends Member {
  contributions: number;
  // Add any other properties specific to Contributor
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
    timeBasedCode: "",
    memberName: "",
    persona: {} as Persona,
    snapshots: []
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

export default MemberData; 
  export type { Contributor, TeamMember };

  export { memberData, teamMember };
