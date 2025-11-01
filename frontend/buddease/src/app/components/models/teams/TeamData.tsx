import { BaseDataEntity, DefaultMeta } from '@/app/config/BaseConfig';
import { BrainstormingSettings } from "@/app/interfaces/settings/BrainstormingSettings";
import { CollaborationPreferences } from "@/app/interfaces/settings/CollaborationPreferences";
import { TeamBuildingSettings } from "@/app/interfaces/settings/TeamBuildingSettings";
import BrandingSettings from "@/app/libraries/theme/BrandingService";
import { CommonData } from "@/app/models/CommonData";
import { BaseData } from '@/app/models/data/Data';
import { Project } from "@/app/models/projects/Project";
import { Progress } from "@/app/tracker/ProgressBar";
import { User } from "@/app/users/User";
import { Member } from "./Contributor";

interface TeamData<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
> extends CommonData<T, K>, Partial< BaseData<any>> {
  id: number | string;
  teamName: string
  description?: string;
  members?: Member<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  projects: Project[];
  creationDate: Date;
  isActive: boolean;
  leader: User | null;
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

const teamData: TeamData<StringData, string> = {
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

