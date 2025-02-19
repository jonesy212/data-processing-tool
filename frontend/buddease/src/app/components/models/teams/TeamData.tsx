import { BaseData } from '@/app/components/models/data/Data';
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import BrandingSettings from "@/app/libraries/theme/BrandingService";
import { BrainstormingSettings } from "../../interfaces/settings/BrainstormingSettings";
import { CollaborationPreferences } from "../../interfaces/settings/CollaborationPreferences";
import { TeamBuildingSettings } from "../../interfaces/settings/TeamBuildingSettings";
import { Project } from "../../projects/Project";
import { User } from "../../users/User";
import { Data } from "../data/Data";
import { Progress } from "../tracker/ProgressBar";
import { Member } from "./TeamMembers";
import { CommonData } from "./models/CommonData";

interface TeamData<
  T extends  BaseData<any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
  > extends CommonData<T, K>, Partial< BaseData<any>> {
  id: number | string;
  teamName: string
  description?: string;
  members?: Member[];
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
const collaborationPreferences: CollaborationPreferences = {
  teamBuilding: {} as TeamBuildingSettings,
  projectManagement: {} as ProjectManagementSettings,
  meetings: {} as MeetingsSettings,
  brainstorming: {} as BrainstormingSettings,
  branding: {} as BrandingSettings
};

const teamData: TeamData<BaseData<Data<string>, Data<string>, any>, string> & Partial<TeamData<Data<string>, string>> = {
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


export default TeamData; teamData
