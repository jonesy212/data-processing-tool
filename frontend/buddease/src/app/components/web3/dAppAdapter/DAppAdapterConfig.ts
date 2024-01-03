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
    role?: string;
    teams?: Team[];
    projects?: Project[];
    teamMembers?: TeamMember[]; 
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

  fluenceConfig: {
    ethereumPrivateKey: "your_private_key_here",
    networkId: 1, // Mainnet, 3 for Ropsten, etc.
    gasPrice: 1000000000, // Gas price in wei
    contractAddress: "0x...", // Replace with your contract address
    // Other Fluence-related configurations...
  };

  aquaConfig: {
    maxConnections: 10,
    timeout: 5000,
    secureConnection: true,
    reconnectAttempts: 3,
    autoReconnect: true,
    // Other Aqua-related configurations...
  };


  realtimeCommunicationConfig: {
    audio: true,
    video: true,
    text: true,
    collaboration: true,
    // Other options for realtime communication...
  };


  phasesConfig: {
    ideation: true,
    teamCreation: true,
    productBrainstorming: true,
    productLaunch: true,
    dataAnalysis: true,
    // Other phases related configurations...
  };

  communicationPreferences: {
    defaultCommunicationMode: "text", // Default mode for communication
    enableRealTimeUpdates: true,
    // Other communication preferences...
  };
  

  dataAnalysisConfig: {
    meaningfulResultsThreshold: 80, // Percentage for considering results as meaningful
    // Other data analysis configurations...
  };
  

  collaborationOptionsConfig: {
    collaborativeEditing: true,
    documentVersioning: true,
    // Other collaboration options...
  };
  

  projectTeamConfig: {
    maxTeamMembers: 10,
    teamRoles: [
      "Project Manager",
      "Product Owner",
      "Scrum Master",
      "Business Analyst",
      "UI/UX Designer",
      "Software Developer",
      "Quality Assurance Engineer",
      "DevOps Engineer",
      "Data Scientist",
      "Marketing Specialist",
      "Sales Representative",
      "Customer Support",
      "Legal Counsel",
      // Add more specific roles as needed...
    ];    // Other team-related configurations...
  };
  
  
  securityConfig: {
    encryptionEnabled: true,
    twoFactorAuthentication: true,
    // Other security-related configurations...
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
