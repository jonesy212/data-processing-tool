import { DocumentBuilderConfig } from "@/app/configs/DocumentBuilderConfig";
import { DocumentOptions, DocumentSize } from "../../documents/DocumentOptions";
import { Task } from "../../models/tasks/Task";
import { Team } from "../../models/teams/Team";
import { TeamMember } from "../../models/teams/TeamMembers";
import Project from "../../projects/Project";
export interface DappProps {
  // General props
  appName: string;
  appVersion: string;

  // User-related props
  currentUser: {
    id: string;
    name: string;
    role: string;
    teams: Team[];
    projects: Project[];
    teamMembers: TeamMember[]; 
  };

  // Project-related props
  currentProject: {
    id: string;
    name: string;
    description: string;
    tasks: Task[];
    teamMembers: TeamMember[];
  };

  // Document-related props
  documentSize: DocumentSize;
  documentOptions: DocumentOptions;
  // Real-time updates props
  enableRealTimeUpdates: boolean;

  // Web3-related props
  fluenceConfig: {
    // Define Fluence-related configurations
    // ...
  };

  aquaConfig: {
    // Define Aqua-related configurations
    // ...
  };

  // Additional props as needed
}
export interface DAppAdapterConfig<T extends DappProps> {
  // Common properties for DAppAdapter configuration
  appName: string;
  appVersion: string;
  // Add more common properties as needed

  // Optional configurations for specific features
  dynamicComponentsConfig?: DocumentBuilderConfig;
  documentBuilderConfig?: DocumentBuilderConfig;
  // Add more feature-specific configurations as needed

  // Additional properties related to DappProps
  dappProps: T;
}
