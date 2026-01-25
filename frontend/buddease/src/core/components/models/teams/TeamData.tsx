// TeamData.tsx
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { BrainstormingSettings } from '@/core/interfaces/settings/BrainstormingSettings';
import type { CollaborationPreferences } from '@/core/interfaces/settings/CollaborationPreferences';
import type { TeamBuildingSettings } from '@/core/interfaces/settings/TeamBuildingSettings';
import type { BrandingSettings } from '@/core/branding/BrandingSettings';
import type { CommonData } from '@/core/models/CommonData';
import type { BaseData } from '@/core/models/data/Data';
import type { Member } from '@/core/models/members/Member';
import type { Project } from '@/core/models/projects/Project';
import type { Progress } from '@/core/models/tracker/ProgressBar';
import type { User } from '@/core/users/User';
import type { TeamEntity, TeamK, TeamMeta, TeamAttachment, TeamExcludedFields, TeamIncludedFields } from '@/core/typings/entities/TeamEntity';



interface TeamData<  
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends CommonData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
  Partial<BaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
  id: number | string;
  teamName: string
  description?: string;
  members?: Member<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  projects: Project[];
  creationDate: Date;
  isActive: boolean;
  leader: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  progress: Progress | null;
  color: string | null;
  collaborationTools?: {
    audio: boolean;
    video: boolean;
    text: boolean;
    realTime: boolean;
    // Add more collaboration tools as needed
  };
  globalCollaboration?: {
    isEnabled: boolean;
    communicationChannels: string[]; // e.g., Slack, Discord, etc.
    collaborationPlatforms: string[]; // e.g., Trello, Asana, etc.
    // Add more global collaboration details as needed
  };
  collaborationPreferences?: CollaborationPreferences;

  // Add other team-related fields as needed
}

// A simple base data type for strings
interface StringData extends BaseData<any> {
  value: string;
}

const collaborationPreferences: CollaborationPreferences = {
  teamBuilding: {} as TeamBuildingSettings,
  projectManagement: {} as ProjectManagementSettings,
  meetings: {} as MeetingsSettings,
  brainstorming: {} as BrainstormingSettings,
  branding: {} as BrandingSettings
};

const teamData: TeamData<TeamEntity, TeamK, TeamMeta, TeamAttachment, TeamExcludedFields, TeamIncludedFields> = {
  // Other team data properties
  collaborationPreferences: collaborationPreferences,
  id: 0,
  teamName: "",
  members: [],
  projects: [],
  creationDate: new Date(),
  isActive: false,
  leader: null,
  progress: null,
  color: "",
  date: new Date(),
  collaborationTools: {
    audio: false,
    video: false,
    text: false,
    realTime: false
  },
  globalCollaboration: {
    isEnabled: false,
    communicationChannels: [],
    collaborationPlatforms: []
  },
};


export { teamData };
export type { TeamData };

