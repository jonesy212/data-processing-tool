import { Attachment } from "@/app/documents/attachment/Attachment";
import { Task } from '@/app/models/tasks/Task';
import { Team } from '@/app/models/teams/Team';
import { Persona } from "@/app/pages/personas/Persona";
import { User } from "@/app/users/User";
import { UserRole } from "@/app/models/UserRole";
import { BaseDataEntity, DefaultMeta } from '@/config/BaseConfig';
import UserRoles from '@/app/models/UserRoles';
import { MemberEntity
  MemberK, 
  MemberMeta, 
  MemberData 
  MemberAttachment, 
  MemberExcludedFields,
  MemberIncludedFields, 
} from '@/app/typings/entities/MemberEntity'

export interface Member extends User {
  teamId: string;
  roleInTeam: string;
  memberName: string;
  teams?: Team[];
  host?: boolean;
  // Add other member-specific properties here
}

export interface Contribution {
  projectId: string;       // or number if projects have IDs
  projectName: string;
  role?: string;           // e.g., "developer", "designer"
  commits?: number;        // optional number of commits/contributions
  details: { note: string; date?: string }[]
  date?: string;
}

interface Contributor extends Member {
  contributions: Contribution[]; // detailed breakdown per project
  joinedAt?: Date;
  active?: boolean;
}


  interface TeamMember<
  T extends BaseDataEntity = MemberEntity,
  K extends T = MemberK,
  Meta extends DefaultMeta<T, K> = MemberMeta,
  AttachmentType extends Attachment = MemberAttachment,
  ExcludedFields extends keyof T = MemberExcludedFields,
  IncludedFields extends keyof T = MemberIncludedFields
> extends MemberData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  // Team-specific additional properties
  teamRole?: string;
  joinDate?: Date;
  permissions?: TeamPermissions;
  isTeamAdmin?: boolean;
  teamSpecificSettings?: TeamMemberSettings;
  contributionScore?: number;
  lastTeamActivity?: Date;
}

// Team permissions type
interface TeamPermissions {
  canManageTeam?: boolean;
  canInviteMembers?: boolean;
  canRemoveMembers?: boolean;
  canCreateProjects?: boolean;
  canDeleteProjects?: boolean;
  canAssignTasks?: boolean;
  canViewAnalytics?: boolean;
}

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


  const DEFAULT_REFRESH_UI = () => {};

// Option 1: Using the exact MemberEntity generic parameters
const memberData: MemberData<
  MemberEntity,
  MemberK, 
  MemberMeta,
  MemberAttachment,
  MemberExcludedFields,
  MemberIncludedFields
> = {
    bannerUrl: "https://example.com/default-banner.jpg", 
    roles: ["member", "contributor"], 
    followers: ["user123", "user456"], 
    preferences: {
      refreshUI: DEFAULT_REFRESH_UI,
      theme: "dark",
      language: "en",
      notifications: true,
      emailUpdates: false
    }, 
    storeId: 12345,
    id: "member-001",
    username: 'member1',
    email: 'member1@example.com',
    teamId: "team-001",
    roleInTeam: "developer",
    _id: "mongo-member-001",
    tier: "premium",
    uploadQuota: 1024,
    fullName: "John Doe",
    bio: "Experienced software developer with 5+ years in web development",
    userType: "premium_user",
    hasQuota: true,
    profilePicture: "https://example.com/avatars/member1.jpg",
    processingTasks: ["task-001", "task-002"],
    role: {
      id: "role-001",
      name: "Developer",
      permissions: ["read", "write", "delete"],
      level: 2
    } as UserRole,
    timeBasedCode: "TBC-123456",
    memberName: "John Doe",
    persona: {
      id: "persona-001",
      name: "May",
      age: "32",
      gender: "woman",
      type: "developer",
      traits: ["analytical", "creative", "collaborative"],
      preferences: ["code_reviews", "pair_programming"]
    } as Persona,
    snapshots: [],
    token: "auth-token-xyz-123",
    avatarUrl: "https://example.com/avatars/member1.jpg",
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2024-01-20"),
    isVerified: true,
    isAdmin: false,
    isActive: true,
    firstName: "John",
    lastName: "Doe",
    friends: ["user123", "user456", "user789"],
    blockedUsers: [],
    settings: {
      privacy: "public",
      emailNotifications: true,
      pushNotifications: false,
      twoFactorAuth: true
    },
    interests: ["programming", "gaming", "photography", "hiking"],
    privacySettings: {
      profileVisibility: "public",
      emailVisibility: "friends_only",
      activityVisibility: "public",
      friendListVisibility: "friends_only"
    },
    notifications: {
      email: true,
      push: false,
      sms: false,
      frequency: "daily"
    },
    activityLog: [
      {
        id: "activity-001",
        type: "login",
        timestamp: new Date("2024-01-20T10:00:00"),
        details: "User logged in successfully"
      }
    ],
    socialLinks: {
      github: "https://github.com/johndoe",
      twitter: "https://twitter.com/johndoe",
      linkedin: "https://linkedin.com/in/johndoe"
    },
    relationshipStatus: "single",
    hobbies: ["coding", "gaming", "reading", "traveling"],
    skills: ["JavaScript", "TypeScript", "React", "Node.js", "Python"],
    achievements: [
      {
        id: "achieve-001",
        title: "First Project",
        description: "Completed first major project",
        date: new Date("2023-03-15")
      }
    ],
    profileVisibility: "public",
    profileAccessControl: {
      canViewProfile: true,
      canSendMessages: true,
      canSeeFriends: true,
      canSeeActivity: true
    },
    activityStatus: "online",
    isAuthorized: true,
    // MemberData specific fields
    datasets: "user-dataset-001,user-dataset-002",
    tasks: [
      {
        id: "task-001",
        title: "Complete onboarding",
        status: "completed",
        priority: "high",
        dueDate: new Date("2024-01-25")
      } as Task<MemberEntity, MemberK, MemberMeta, MemberAttachment, MemberExcludedFields, MemberIncludedFields>
    ],
    questionnaireResponses: {
      onboarding: {
        completed: true,
        responses: {
          experience: "5 years",
          skills: ["JavaScript", "React"]
        }
      }
    },
    joinDate: new Date("2023-01-15"),
    lastActive: new Date("2024-01-20T14:30:00"),
    status: "active",
    projects: ["project-001", "project-002"],
    permissions: ["read", "write", "comment"]
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

export type { Contributor, TeamMember };
export { memberData, teamMember };

