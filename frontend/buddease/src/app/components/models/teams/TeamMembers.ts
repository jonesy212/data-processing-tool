import { Attachment } from "@/app/documents/attachment/Attachment";
import { Task } from '@/app/models/tasks/Task';
import { Team } from '@/app/models/teams/Team';
import { Persona } from "@/app/pages/personas/Persona";
import { User } from "@/app/users/User";
import { UserRole } from "@/app/models/UserRole";
import { Member } from "@/app/models/members/Member";
import { BaseDataEntity, DefaultMeta } from '@/config/BaseConfig';
import UserRoles from '@/app/models/UserRoles';
import { MemberEntity,
  MemberK, 
  MemberMeta, 
  MemberData,
  MemberAttachment, 
  MemberExcludedFields,
  MemberIncludedFields, 
} from '@/app/typings/entities/MemberEntity'
import PersonaTypeEnum from '@/app/pages/personas/PersonaBuilder'

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


export type { Contributor, TeamMember };

