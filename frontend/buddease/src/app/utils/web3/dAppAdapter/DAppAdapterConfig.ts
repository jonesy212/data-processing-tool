import { ApiConfig } from '@/app/api/ApiConfig';
import { ClientConfig } from "@/app/client/Client";
import { Attachment } from '@/app/documents/attachment/Attachment';
import { DocumentOptions } from "@/app/documents/DocumentOptions";
import { BaseData } from '@/app/models/data/Data';
import { DocumentSize } from "@/app/models/data/StatusType";
import { Project } from "@/app/models/projects/Project";
import { Task } from "@/app/models/tasks/Task";
import { Team } from "@/app/models/teams/Team";
import { TeamMember } from "@/app/models/teams/TeamMembers";
import { UserRole } from "@/app/models/UserRole";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { DocumentBuilderConfig } from "@/config/DocumentBuilderConfig";
import { DappProps as DAppAdapterDappProps } from '@/app/utils/web3/dAppAdapter/DAppAdapterConfig';

// FLUENCE_API_KEY EXPORT
export const fluenceApiKey = process.env.FLUENCE_API_KEY;


export interface DappProps<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends DAppAdapterDappProps {

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
    teamMembers?: TeamMember<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
    
  };

  // Project-related props
  currentProject: {
    id: string;
    username: string;
    description: string;
    tasks: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
    teamMembers: TeamMember<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  };

  // Document-related props
  documentSize: DocumentSize;
  documentOptions: DocumentOptions;
  // Real-time updates props
  enableRealTimeUpdates: boolean;
// All configurations grouped
  configurations: {
    fluenceConfig: {
      ethereumPrivateKey: typeof fluenceApiKey;
      networkId: 1 | 3 | number; // Added other possible network IDs
      gasPrice: number;
      contractAddress: string;
      // Possible missing: providerUrl, chainId, etc.
    };

    aquaConfig: {
      maxConnections: number;
      timeout: number;
      secureConnection: boolean;
      reconnectAttempts: number;
      autoReconnect: boolean;
      // Possible missing: peerId, relayNodes, etc.
    };

    realtimeCommunicationConfig: {
      audio: boolean;
      video: boolean;
      text: boolean;
      collaboration: boolean;
      // Possible missing: screenShare, fileTransfer, etc.
    };

    phasesConfig: {
      ideation: boolean;
      teamCreation: boolean;
      productBrainstorming: boolean;
      productLaunch: boolean;
      dataAnalysis: boolean;
      // Possible missing: planning, development, testing, deployment
    };

    communicationPreferences: {
      defaultCommunicationMode: "text" | "audio" | "video";
      enableRealTimeUpdates: boolean;
      // Possible missing: notificationPreferences, language, etc.
    };

    dataAnalysisConfig: {
      meaningfulResultsThreshold: number;
      // Possible missing: analyticsEnabled, dataRetention, etc.
    };

    collaborationOptionsConfig: {
      collaborativeEditing: boolean;
      documentVersioning: boolean;
      // Possible missing: commentSystem, changeTracking, etc.
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
    
    projectTeamConfig: {
      maxTeamMembers: number;
      teamRoles: string[];
      // Possible missing: defaultRoles, permissionLevels, etc.
    };

    securityConfig: {
      encryptionEnabled: boolean;
      twoFactorAuthentication: boolean;
      sessionTimeout: number; // in minutes
      passwordPolicy: {
        minLength: number;
        requireSpecialChars: boolean;
        requireNumbers: boolean;
      };
      // Possible missing: sessionTimeout, passwordPolicy, etc.
    };
  

    // From AppConfig.ts, MainConfig.tsx
    appConfig: {
      environment: 'development' | 'staging' | 'production';
      debugMode: boolean;
      featureFlags: Record<string, boolean>;
      supportedLanguages: string[];
      defaultLanguage: string;
    };

    // From BackendConfig.ts, FrontendConfig.ts
    backendConfig: {
      apiBaseUrl: string;
      graphqlEndpoint: string;
      restEndpoint: string;
      timeout: number;
      retryAttempts: number;
    };

    frontendConfig: {
      theme: 'light' | 'dark' | 'auto';
      layout: 'fluid' | 'fixed';
      enableAnimations: boolean;
      responsiveBreakpoints: {
        mobile: number;
        tablet: number;
        desktop: number;
      };
    };

    // From DatabaseConfig.tsx, DatabaseTypes.ts
    databaseConfig: {
      type: 'sqlite' | 'postgresql' | 'mongodb' | 'fluence';
      host: string;
      port: number;
      database: string;
      synchronize: boolean;
      logging: boolean;
      connectionTimeout: number;
    };

    // From Web3Config.ts, CustomWeb3Config.ts
    web3Config: {
      network: 'mainnet' | 'testnet' | 'local';
      rpcUrl: string;
      chainId: number;
      contracts: Record<string, string>;
      gasLimit: number;
      gasPrice: number;
    };

    // From DocumentBuilderConfig.ts, FrontendDocumentConfig.ts
    documentConfig: {
      maxFileSize: number;
      allowedFileTypes: string[];
      autoSave: boolean;
      autoSaveInterval: number;
      versioning: boolean;
      maxVersions: number;
    };

    // From DynamicFormConfig.ts
    formConfig: {
      validationMode: 'onChange' | 'onBlur' | 'onSubmit';
      showValidationErrors: boolean;
      autoComplete: boolean;
      submitMode: 'auto' | 'manual';
    };

    // From LayoutConfig.tsx
    layoutConfig: {
      header: {
        visible: boolean;
        fixed: boolean;
      };
      sidebar: {
        visible: boolean;
        collapsed: boolean;
        position: 'left' | 'right';
      };
      footer: {
        visible: boolean;
        fixed: boolean;
      };
    };

    // From LoggerConfig.ts
    loggingConfig: {
      level: 'error' | 'warn' | 'info' | 'debug';
      enableConsole: boolean;
      enableFile: boolean;
      maxFileSize: number;
      logDirectory: string;
    };

    // From UserPreferences.ts, GenerateUserPreferences.ts
    userPreferences: {
      notifications: {
        email: boolean;
        push: boolean;
        sms: boolean;
      };
      privacy: {
        dataSharing: boolean;
        analytics: boolean;
        personalizedAds: boolean;
      };
      accessibility: {
        highContrast: boolean;
        largeText: boolean;
        screenReader: boolean;
      };
    };

    // From MetadataManager.tsx, StructuredMetadata.ts
    metadataConfig: {
      autoGenerate: boolean;
      validation: boolean;
      indexing: boolean;
      searchable: boolean;
      maxTags: number;
    };

    // From IPFSConfig.ts
    ipfsConfig: {
      gateway: string;
      apiUrl: string;
      timeout: number;
      pinning: boolean;
    };

    // From IdleTimeout.ts
    sessionConfig: {
      idleTimeout: number;
      sessionTimeout: number;
      extendSession: boolean;
    };

    // From DataVersionsConfig.tsx
    versioningConfig: {
      enable: boolean;
      maxVersions: number;
      autoPrune: boolean;
      retentionPeriod: number;
    };

    // From MappingConfig.tsx
    mappingConfig: {
      autoMap: boolean;
      strictMode: boolean;
      fieldValidation: boolean;
    };

    uiConfig?: {
      theme: 'light' | 'dark' | 'auto';
      language: string;
      accessibility: {
        highContrast: boolean;
        fontSize: number;
      };
    }
    deploymentConfig?: {
      version: string;
      buildNumber: string;
      environmentVariables: Record<string, string>;
    };
    apiConfig?: ApiConfig
    // From StopwatchConfig.tsx
    performanceConfig: {
      enableMetrics: boolean;
      sampleRate: number;
      reportErrors: boolean;
    };
    // Browser-specific from browserConfig.ts
    browserConfig: {
      supportedBrowsers: string[];
      minimumVersions: Record<string, string>;
      featureDetection: boolean;
    };
  }
  // Additional top-level props that might be needed
  environment: 'development' | 'staging' | 'production';
  apiKeys?: Record<string, string>;
  plugins?: string[];
  customThemes?: Record<string, any>;
  // Possible missing top-level props that might be needed:
  apiKeys?: Record<string, string>;
  environment: 'development' | 'staging' | 'production';
  theme?: ThemeConfig;
  localization?: LocalizationConfig;
  plugins?: PluginConfig[];
  storage?: StorageConfig;
  cache?: CacheConfig;
  logging?: LoggingConfig;

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
