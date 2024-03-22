import BrandingSettings from "@/app/libraries/theme/BrandingService";
import { BrainstormingSettings } from "../../interfaces/BrainstormingSettings";
import { CollaborationPreferences } from "../../interfaces/settings/CollaborationPreferences";
import { TeamBuildingSettings } from "../../interfaces/settings/TeamBuildingSettings";
import { Project } from "../../projects/Project";
import { User } from "../../users/User";
import { Data } from "../data/Data";
import { Progress } from "../tracker/ProgressBar";
import { Member } from "./TeamMembers";

interface TeamData extends Partial<Data> {
  id: number | string;
  teamName: Data["title"];
  description?: string;
  members?: Member[];
  projects: Project[];
  creationDate: Date;
  isActive: boolean;
  leader: User | null;
  progress: Progress | null;

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

const teamData: TeamData & Partial<TeamData> = {
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
