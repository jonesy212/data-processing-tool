import { configServiceInstance } from '../configs/ConfigurationService';
import axiosInstance from '@/app/api/csrfToken'
import { SystemConfigs } from './systemConfigs';
import { UserConfigs } from './userConfigs';
import { ExtendedDappProps } from '../components/web3/dAppAdapter/IPFS';
import { ipfsConfig } from '../configs/ipfsConfig';
import { DocumentSize } from '@/app/models/data/StatusType';
import { DocumentOptions } from '../components/documents/DocumentOptions';
import { fluenceApiKey } from '@/app/utils/web3/dAppAdapter/DApp';
import { PoolConfig } from 'mysql';

export const getConfigsData = async (): Promise<ExtendedDappProps | undefined> => {
  try {
    const systemConfigs = await configServiceInstance.getSystemConfigs();
    const userConfigs = await configServiceInstance.getUserConfigs();

    const systemApiResponse = await axiosInstance.get(systemConfigs.apiUrl ?? "");
    const userApiResponse = await axiosInstance.get(userConfigs.apiUrl ?? "");

    const dbConfig: PoolConfig = {
      user: process.env.DB_USER || "default_user",
      host: process.env.DB_HOST || "localhost",
      database: process.env.DB_NAME || "default_database",
      password: process.env.DB_PASSWORD || "default_password",
      port: parseInt(process.env.DB_PORT ?? "") || 5432,
    };

    // Return COMBINED object with both DApp props and config data
    return {
      // ConfigsData properties
      dbConfig,
      systemApiResponse,
      userApiResponse,
      
      // ExtendedDappProps properties (you need to provide these)
      ipfsConfig: ipfsConfig, // Make sure ipfsConfig is defined
      ethereumRpcUrl: process.env.ETH_RPC_URL || "https://mainnet.infura.io/v3/your-key",
      appName: systemApiResponse.data.appName || "Default App",
      appVersion: systemApiResponse.data.appVersion || "1.0.0",
      currentUser: {
        id: userApiResponse.data.id || "",
        username: userApiResponse.data.username || "",
        role: userApiResponse.data.role,
        teams: userApiResponse.data.teams || [],
        projects: userApiResponse.data.projects || [],
        teamMembers: userApiResponse.data.teamMembers || [],
      },
      currentProject: {
        id: systemApiResponse.data.projectId || "",
        username: userApiResponse.data.username || "",
        description: systemApiResponse.data.projectDescription || "",
        tasks: systemApiResponse.data.tasks || [],
        teamMembers: systemApiResponse.data.teamMembers || [],
      },
      // ... all other DappProps properties with defaults
      documentSize: {} as DocumentSize,
      documentOptions: {} as DocumentOptions,
      enableRealTimeUpdates: true,
      fluenceConfig: {
        ethereumPrivateKey: fluenceApiKey,
        networkId: 1,
        gasPrice: 1000000000,
        contractAddress: "0x...",
      },
      aquaConfig: {
        maxConnections: 10,
        timeout: 5000,
        secureConnection: true,
        reconnectAttempts: 3,
        autoReconnect: true,
      },
      realtimeCommunicationConfig: {
        audio: true,
        video: true,
        text: true,
        collaboration: true,
      },
      phasesConfig: {
        ideation: true,
        teamCreation: true,
        productBrainstorming: true,
        productLaunch: true,
        dataAnalysis: true,
      },
      communicationPreferences: {
        defaultCommunicationMode: "text",
        enableRealTimeUpdates: true,
      },
      dataAnalysisConfig: {
        meaningfulResultsThreshold: 80,
      },
      collaborationOptionsConfig: {
        collaborativeEditing: true,
        documentVersioning: true,
      },
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
          // ... other roles
        ],
      },
      securityConfig: {
        encryptionEnabled: true,
        twoFactorAuthentication: true,
      },
      dappProps: {}
    };
  } catch (error) {
    console.error("Error fetching configs data:", error);
    return undefined;
  }
};