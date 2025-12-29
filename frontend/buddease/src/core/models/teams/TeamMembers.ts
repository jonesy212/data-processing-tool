// TeamMembers.ts
import { BaseDataEntity, DefaultMeta } from '@/core/config/BaseConfig';
import { Attachment } from '@/core/documents/attachment/Attachment';
import { Member } from "@/core/models/members/Member";
import { UserRole } from "@/core/models/UserRole";
import UserRoles from '@/core/models/UserRoles';
import { Persona } from "@/core/pages/personas/Persona";
import { BasePermissions, MemberPermission, Permission } from '@/core/permissions/Permission';
import { MemberAttachment, MemberData, MemberEntity, MemberExcludedFields, MemberIncludedFields, MemberK, MemberMeta } from '@/core/typings/entities/MemberEntity';

// Team member settings
interface TeamMemberSettings {
  notificationPreferences?: {
    teamAnnouncements?: boolean;
    projectUpdates?: boolean;
    taskAssignments?: boolean;
    mentionNotifications?: boolean;
  };
  visibilitySettings?: {
    showEmail?: boolean;
    showActivity?: boolean;
    showSkills?: boolean;
  };
  collaborationPreferences?: {
    preferredCommunication?: 'chat' | 'email' | 'video';
    availabilityStatus?: 'available' | 'busy' | 'away';
    workingHours?: {
      start: string;
      end: string;
      timezone: string;
    };
  };
}


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
  teamPermissions?: TeamPermission[]
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
  member?: Member<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  role?: UserRole

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
interface TeamMemberPermissions extends BasePermissions {
  basePermissions: Permission[];
  memberPermissions: MemberPermission[];
  teamPermissions: TeamPermission[];
  
  // Helper methods
  hasPermission: (action: string, resourceType: string, scope?: string) => boolean;
  getTeamPermissions: (teamId: string) => TeamPermission[];
  getMemberPermissions: () => MemberPermission[];
}



  const DEFAULT_REFRESH_UI = () => {};

  const memberData: MemberData<MemberEntity, MemberK, MemberMeta, MemberAttachment, MemberExcludedFields, MemberIncludedFields> = {
    bannerUrl: "", 
    roles: [], 
    followers: [], 
    timestamp: new Date(),
    auditTrail: [],
    deleted: false,
    budget: {
      total: 0,
      used: 0,
      allocated: 0,
      spent: 0,
      remaining: 0,
      currency: 'USD',
      categories: {},
      allocations: [],
      variance: 0,
      lastUpdated: new Date()
    },
    phases: [],
    currentPhase: {
      id: '',
      name: 'Not Started',
      description: '',
      startDate: new Date(),
      endDate: new Date(),
      status: 'pending',
      tasks: [],
      progress: 0,
      order: 0,
      projectId: 'project-id',
      date: new Date()
    },
    done: false,
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

export type { TeamMember, TeamMemberPermissions };

  export { memberData, teamMember };

