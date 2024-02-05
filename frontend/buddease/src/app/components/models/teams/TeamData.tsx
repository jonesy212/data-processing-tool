import { BrainstormingSettings } from "../../interfaces/BrainstormingSettings";
import { CollaborationPreferences } from "../../interfaces/settings/CollaborationPreferences";
import { TeamBuildingSettings } from "../../interfaces/settings/TeamBuildingSettings";
import Project from "../../projects/Project";
import { Snapshot } from "../../state/stores/SnapshotStore";
import { User } from "../../users/User";
import { Data } from "../data/Data";
import { Progress } from "../tracker/ProgresBar";

interface TeamData extends Data{
  id: number;
  teamName: string;
  description?: string;
  members: User[];
  projects: Project[];
  creationDate: Date;
  isActive: boolean;
  leader: User | null;
  progress: Progress | null;

  collaborationTools: {
    audio: boolean;
    video: boolean;
    text: boolean;
    realTime: boolean;
    // Add more collaboration tools as needed
  };
  globalCollaboration: {
    isEnabled: boolean;
    communicationChannels: string[]; // e.g., Slack, Discord, etc.
    collaborationPlatforms: string[]; // e.g., Trello, Asana, etc.
    // Add more global collaboration details as needed
  };
  collaborationPreferences: CollaborationPreferences;

  // Add other team-related fields as needed
}
const collaborationPreferences: CollaborationPreferences = {
  teamBuilding: {} as TeamBuildingSettings,
  projectManagement: {} as ProjectManagementSettings,
  meetings: {} as MeetingsSettings,
  brainstorming: {} as BrainstormingSettings,
  branding: {} as BrandingSettings
};

const teamData: TeamData = {
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
  _id: "",
  title: "",
  status: "pending",
  tags: [],
  phase: null,
  then: function (callback: (newData: Snapshot<Data>) => void): void {
    throw new Error("Function not implemented.");
  },
  analysisType: "",
  analysisResults: [],
  videoData: {} as Record<string, any>
};


export default TeamData;
