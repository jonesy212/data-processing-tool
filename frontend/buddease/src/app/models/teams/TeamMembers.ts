import { TeamMember } from '@/app/components/models/teams/TeamMembers';
import { Team } from '@/app/components/models/teams/Team';
import { UserRole } from "@/app/models/UserRole";
import UserRoles from '@/app/models/UserRoles';
import { Persona } from "@/app/pages/personas/Persona";
import { MemberData } from '@/app/typings/entities/MemberEntity';
import { User } from "@/app/users/User";
import { Permission } from '@/app/permissions/Permission';



interface TeamMember<
  T extends BaseDataEntity = MemberEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = MemberAttachment,
  ExcludedFields extends keyof T = MemberExcludedFields,
  IncludedFields extends keyof T = keyof T
> extends MemberData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  // Team-specific additional properties
  teamRole?: string;
  joinDate?: Date;
  permissions: TeamPermissions;
  isTeamAdmin?: boolean;
  teamSpecificSettings?: TeamMemberSettings;
  contributionScore?: number;
  lastTeamActivity?: Date;

  // Core member fields
  id: number;
  username: string;
  email: string;
  tier: string;
  upload_quota: number;
  user_type: string;
  role?: Member;

  // Permission management methods
  canPerformAction: (action: string, resource: string, teamId?: string) => boolean;
  updateTeamPermissions: (permissions: TeamPermission[]) => void;
  updateMemberPermissions: (permissions: MemberPermission[]) => void;
}


// Team-specific Permissions
interface TeamPermission extends Permission {
  scope: 'team';
  resourceType: 'team' | 'team_member' | 'team_data' | 'team_settings';
  teamId: string;
  // Team-specific constraints
  canManageTeamMembers?: boolean;
  canEditTeamSettings?: boolean;
  canViewTeamAnalytics?: boolean;
  canAssignTasks?: boolean;
}


// Team Member Permissions (combines both)
interface TeamMemberPermissions {
  basePermissions: Permission[];
  memberPermissions: MemberPermission[];
  teamPermissions: TeamPermission[];
  
  // Helper methods
  hasPermission: (action: string, resourceType: string, scope?: string) => boolean;
  getTeamPermissions: (teamId: string) => TeamPermission[];
  getMemberPermissions: () => MemberPermission[];
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

export type { TeamMember };

export { memberData, teamMember };

