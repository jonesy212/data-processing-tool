import { Attachment } from '@/app/components/documents/Attachment/attachment';
import { DocumentOptions } from "@/app/components/documents/DocumentOptions";
import { BaseData } from '@/app/components/models/data/Data';
import { DocumentSize } from "@/app/models/data/StatusType";
import { Project } from "@/app/models/projects/Project";
import { Task } from "@/app/models/tasks/Task";
import { Team } from "@/app/models/teams/Team";
import { TeamMember } from "@/app/models/teams/TeamMembers";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "@/config/BaseConfig";
import { DocumentBuilderConfig } from "@/config/DocumentBuilderConfig";
import { ClientConfig } from "@/server/database/Client";
import { UserRole } from "./UserRole";
;

// FLUENCE_API_KEY EXPORT
export const fluenceApiKey = process.env.FLUENCE_API_KEY;

export interface DappProps<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> {
  // General props
  appName: string;
  appVersion: string;

  // User-related props
  currentUser: {
    id: string | number;
    username: string;
    role?: UserRole;
    teams?: Team[];
    
    projects?: Project[];
    teamMembers?: TeamMember[]; 
    
  };

  // Project-related props
  currentProject: {
    id: string;
    username: string;
    description: string;
    tasks: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
    teamMembers: TeamMember[];
  };

  // Document-related props
  documentSize: DocumentSize;
  documentOptions: DocumentOptions;
  // Real-time updates props
  enableRealTimeUpdates: boolean;

  fluenceConfig: {
    ethereumPrivateKey: typeof fluenceApiKey,
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


export interface DAppAdapterConfig<
  T extends DappProps<
    BaseDataEntity,                            // T
    BaseDataEntity,                            // K
    DefaultMeta<BaseDataEntity, BaseDataEntity>, // Meta
    Attachment,                                // AttachmentType
    DefaultExcludedFields<BaseDataEntity>      // ExcludedFields
  > = DappProps<
    BaseDataEntity,
    BaseDataEntity,
    DefaultMeta<BaseDataEntity, BaseDataEntity>,
    Attachment,
    DefaultExcludedFields<BaseDataEntity>
  >,
  K = Extract<T, BaseData<any>>
> {
  // Common properties for DAppAdapter configuration
  appName: string;
  appVersion: string;
  // Add more common properties as needed

  // Optional configurations for specific features
  dynamicComponentsConfig?: DocumentBuilderConfig;
  documentBuilderConfig?: DocumentBuilderConfig;
  // Add more feature-specific configurations as needed
  postgresConfig: ClientConfig | undefined;

  // Additional properties related to DappProps
  dappProps: T;
}
