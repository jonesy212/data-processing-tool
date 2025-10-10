import { Team } from '@/app/components/models/teams/Team';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { UserRole } from "@/app/models/UserRole";
import UserRoles from '@/app/models/UserRoles';
import { Persona } from "@/app/pages/personas/Persona";
import { User } from "@/app/users/User";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';

export interface Member extends User {
  teamId: string;
  roleInTeam: string;
  memberName: string;
  teams?: Team[];
  host?: boolean;
  // Add other member-specific properties here
}




interface TeamMember<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends MemberData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    id: number;
    username: string;
    email: string;
    tier: string;
    upload_quota: number;
  user_type: string;
  role: UserRole
    // Add other TeamMember-related fields as needed
  }
  

  const DEFAULT_REFRESH_UI = () => {};

  const memberData: MemberData = {
    bannerUrl: "", 
    roles: [], 
    followers: [], 
    preferences: {
      refreshUI: DEFAULT_REFRESH_UI,
    }, 
    storeId: 0,
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

