import UserRoles from '@/app/components/users/UserRoles';
import { Persona } from "@/app/pages/personas/Persona";
import { User } from "../../users/User";
import { UserRole } from "../../users/UserRole";
import { Team } from './Team';
import { Task } from '../tasks/Task';

export interface Collaborator extends Member {
  collaborations: number; // Number of collaborations
  // Add any other properties specific to Collaborator
}

export interface Member extends User {
  teamId: string;
  roleInTeam: string;
  memberName: string;
  teams?: Team[];
  host?: boolean;
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
  tasks?: Task[];
  questionnaireResponses?: any;
  // Add other fields specific to MemberData
}
interface TeamMember extends MemberData {
    id: number;
    username: string;
    email: string;
    tier: string;
    upload_quota: number;
  user_type: string;
  role: UserRole
    // Add other TeamMember-related fields as needed
  }
  

  const memberData: MemberData = {
    bannerUrl: "", roles: "", followers: "", preferences: "", storeId: "",
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
    snapshots: [],
    token: null,
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: undefined,
    isVerified: false,
    isAdmin: false,
    isActive: false,
    firstName: "",
    lastName: "",
    friends: [],
    blockedUsers: [],
    settings: null,
    interests: [],
    privacySettings: undefined,
    notifications: undefined,
    activityLog: [],
    socialLinks: undefined,
    relationshipStatus: null,
    hobbies: [],
    skills: [],
    achievements: [],
    profileVisibility: "",
    profileAccessControl: undefined,
    activityStatus: "",
    isAuthorized: false
  };
  const teamMember: TeamMember = {
    id: 1,
    username: "user1",
    email: "user1@example.com",
    tier: "free",
    upload_quota: 0,
    user_type: "individual",
    role: UserRoles.Member
  } as TeamMember

export default MemberData; 
  export type { Contributor, TeamMember };

  export { memberData, teamMember };
