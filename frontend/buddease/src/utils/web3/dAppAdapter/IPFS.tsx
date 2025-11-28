// Import necessary libraries or modules
import { getConfigsData } from '@/app/api/getConfigsApi';
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { ipfsConfig } from '@/app/config/ipfsConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { documentOptions } from '@/app/hooks/userScenarioCreation';
import { DocumentSize } from "@/app/models/data/StatusType";
import { ExtendedDappAttachment, ExtendedDappEntity, ExtendedDappExcludedFields, ExtendedDappIncludedFields, ExtendedDappK, ExtendedDappMeta } from '@/app/typings/entities/ExtendedDappEntity';
import { useAuth } from '@/state/context/AuthContext';
import { CustomDAppAdapter } from '@/utils/web3/dAppAdapter/DApp';
import { DAppAdapterConfig, DappProps } from '@/utils/web3/dAppAdapter/DAppAdapterConfig';
import { ethers } from 'ethers';
import { create } from 'ipfs-core';
import { PoolConfig } from 'mysql';


// Get configs data and handle the case where it returns undefined
const extendedProps: ExtendedDappProps | undefined = await getConfigsData();

// Extend the existing DAppAdapterConfig interface
interface ExtendedDappProps extends DappProps {
  ipfsConfig: typeof ipfsConfig;
  ethereumRpcUrl: string; // Add ethereumRpcUrl property
  dappProps?: any; // Add dappProps property

  dbConfig: PoolConfig;
  systemApiResponse: any; 
  userApiResponse: any;
}


interface ExtendedDAppAdapterConfig<
  T extends BaseDataEntity,
  K extends T,
  Meta extends DefaultMeta<T, K>,
  AttachmentType extends Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends DAppAdapterConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  ipfsConfig: typeof ipfsConfig;
  ethereumRpcUrl: string; // Add ethereumRpcUrl property
}


const currentUser = useAuth().state.user; // Get the current user using the useAuth hook


let dappAdapterConfig: DAppAdapterConfig<ExtendedDappEntity, ExtendedDappK, ExtendedDappMeta, ExtendedDappAttachment, ExtendedDappExcludedFields, ExtendedDappIncludedFields>;

if (currentUser) {
  // Ensure that currentUser is properly structured according to DappProps['currentUser']
  const currentUserForDapp: DappProps<
    ExtendedDappEntity,
    ExtendedDappK,     
    ExtendedDappMeta,  
    ExtendedDappAttachment,
    ExtendedDappExcludedFields,
    ExtendedDappIncludedFields>['currentUser'] = {
    id: currentUser.id, // Assign the user's ID
    username: currentUser.username, // Assign the user's name
    role: String(currentUser.role), // Convert UserRole to string and assign it as the user's role
    teams: currentUser.teams, // Assign the user's teams
    projects: currentUser.projects, // Assign the user's projects
    teamMembers: currentUser.teamMembers, // Assign the user's team members
  },

   // Now you can use `currentUser` in your DAppAdapterConfig
   dappAdapterConfig = {
    // Other properties...
    dappProps: {
      // Include other DappProps configurations...
      currentUser: currentUserForDapp,

      // Include other DappProps configurations...
    },
  };
}


export class ExtendedDAppAdapter<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>  extends CustomDAppAdapter {
  private ipfs: Awaited<ReturnType<typeof create>> | null = null;
  private ethereumProvider: ethers.JsonRpcProvider;
  
  constructor(config: ExtendedDAppAdapterConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) {
    super(config);

    // Initialize IPFS
  this.initializeIPFS(config.ipfsConfig);

    // Initialize Ethereum provider
    this.ethereumProvider = new ethers.JsonRpcProvider(config.ethereumRpcUrl);

    // ✅ MOVED: Check extendedProps inside constructor or a method
    this.initializeWithConfig();
  }

  // ✅ ADD: Method to handle config initialization
  private initializeWithConfig(): void {
    // Check if extendedProps is defined before using it
    if (extendedProps && 'systemApiData' in extendedProps && 'userApiData' in extendedProps) {
      // Use extendedProps here
      console.log(extendedProps.systemApiData);
      console.log(extendedProps.userApiData);
    } else {
      console.error('Failed to fetch configs data');
    }
  }

  private async initializeIPFS(ipfsConfig: any): Promise<void> {
    try {
      this.ipfs = await create({
        // ✅ Correct ipfs-core configuration
        start: true,
        repo: `ipfs-repo-${Math.random()}`, // Unique repo for each instance
        config: {
          Addresses: {
            Swarm: [
              `/ip4/${ipfsConfig.ipfsHost || '127.0.0.1'}/tcp/${ipfsConfig.swarmPort || 4001}`,
              `/ip4/${ipfsConfig.ipfsHost || '127.0.0.1'}/tcp/${ipfsConfig.swarmPort || 4002}/ws`
            ],
            API: `/ip4/${ipfsConfig.ipfsHost || '127.0.0.1'}/tcp/${ipfsConfig.apiPort || 5001}`,
            Gateway: `/ip4/${ipfsConfig.ipfsHost || '127.0.0.1'}/tcp/${ipfsConfig.gatewayPort || 8080}`
          }
        }
      });
      console.log('IPFS node initialized successfully');
    } catch (error) {
      console.error('Failed to initialize IPFS:', error);
      throw error;
    }
  }

  private async ensureIPFSReady(): Promise<void> {
    if (!this.ipfs) {
      await new Promise(resolve => setTimeout(resolve, 100));
      return this.ensureIPFSReady();
    }
  }

  async storeFileOnIPFS(file: Buffer): Promise<string> {
    // ✅ FIXED: Wait for IPFS to be ready
    await this.ensureIPFSReady();
    
    if (!this.ipfs) {
      throw new Error('IPFS not initialized');
    }

    // ✅ FIXED: Use ipfs-core API (different from old IPFS package)
    const result = await this.ipfs.add(file);
    const ipfsHash = result.cid.toString(); // ✅ Different property access

    // Store the IPFS hash on the Ethereum blockchain
    await this.storeIPFSHashOnEthereum(ipfsHash);

    return ipfsHash;
  }

  private async getConfigsData(): Promise<ExtendedDappProps> {
    // Get configuration data from your application
    const currentUser = useAuth().state.user;

    let dappAdapterConfig: DAppAdapterConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

    if (currentUser) {
      const currentUserForDapp: DappProps['currentUser'] = {
        id: currentUser.id,
        username: currentUser.username,
        role: String(currentUser.role),
        teams: currentUser.teams,
        projects: currentUser.projects,
        teamMembers: currentUser.teamMembers,
      };

      dappAdapterConfig = {
        dappProps: {
          currentUser: currentUserForDapp,
          ipfsConfig: ipfsConfig,
          ethereumRpcUrl: '',
          appName: '',
          appVersion: '',
          currentProject: {
            id: '',
            name: '',
            description: '',
            tasks: [],
            teamMembers: []
          },
          documentSize: DocumentSize.Letter,
          documentOptions: documentOptions,
          enableRealTimeUpdates: false,
          fluenceConfig: {
            ethereumPrivateKey: 'FLUENCE_API_KEY',
            networkId: 1,
            gasPrice: 1000000000,
            contractAddress: '0x...'
          },
          aquaConfig: {
            maxConnections: 10,
            timeout: 5000,
            secureConnection: true,
            reconnectAttempts: 3,
            autoReconnect: true
          },
          realtimeCommunicationConfig: {
            audio: true,
            video: true,
            text: true,
            collaboration: true
          },
          phasesConfig: {
            ideation: true,
            teamCreation: true,
            productBrainstorming: true,
            productLaunch: true,
            dataAnalysis: true
          },
          communicationPreferences: {
            defaultCommunicationMode: 'text',
            enableRealTimeUpdates: true
          },
          dataAnalysisConfig: {
            meaningfulResultsThreshold: 80
          },
          collaborationOptionsConfig: {
            collaborativeEditing: true,
            documentVersioning: true
          },
          projectTeamConfig: {
            maxTeamMembers: 10,
            teamRoles: []
          },
          securityConfig: {
            encryptionEnabled: true,
            twoFactorAuthentication: true
          }
        },
      };
    }

    return dappAdapterConfig?.dappProps as ExtendedDappProps;
  }

  private async storeIPFSHashOnEthereum(ipfsHash: string): Promise<void> {
    const config = this.getConfig();
  
    if (!config.dappProps.fluenceConfig.ethereumPrivateKey) {
      throw new Error('Ethereum private key is missing in the configuration');
    }
  
    const privateKey = config.dappProps.fluenceConfig.ethereumPrivateKey;
    const wallet = new ethers.Wallet(privateKey, this.ethereumProvider);
  
    const contractAddress = process.env.CONTRACT_ADDRESS;
    const contractABI: any[] = JSON.parse(process.env.CONTRACT_ABI || '[]');
  
    if (!contractAddress) {
      throw new Error('Contract address is missing in the configuration');
    }

    const contract = new ethers.Contract(contractAddress, contractABI, wallet);
    await contract.storeIPFSHash(ipfsHash);
  }
}

// Usage example
const baseConfig = {
  appName: "Extended Project Management App",
  appVersion: "2.0",
  ethereumRpcUrl: "https://your-ethereum-rpc-url",
  dappProps: {} as ExtendedDappProps,
};

const extendedConfig: ExtendedDAppAdapterConfig<ExtendedDappEntity, ExtendedDappK, ExtendedDappMeta, ExtendedDappAttachment, ExtendedDappExcludedFields, ExtendedDappIncludedFields> = {
  ...baseConfig,
  ethereumRpcUrl: "https://your-ethereum-rpc-url",
  ipfsConfig: {
    ...ipfsConfig,
    ipfsPath: '/path/to/ipfs/repo',
    ipfsPort: 5001,
    ipfsProtocol: 'http',
    ipfsHost: 'localhost',
    ipfsGatewayProtocol: 'http',
    ipfsGatewayHost: 'localhost',
    ipfsGatewayPort: 8080,
    ipfsGatewayPath: '/ipfs',
    ipfsGatewayUrl: 'http://localhost:8080/ipfs',
    ipfsApiPort: 5002,
    ipfsApiProtocol: 'http',
    ipfsApiHost: 'localhost',
    ipfsApiUrl: 'http://localhost:5002',
    ipfsApiPath: '/api/v0',
    ipfsSwarmPort: 4001,
    ipfsSwarmProtocol: 'http',
    ipfsSwarmHost: 'localhost',
    ipfsSwarmUrl: 'http://localhost:4001',
    ipfsSwarmPath: '/swarm/peers',
    ipfsWsPort: 5003
  },
  postgresConfig: undefined
};

const extendedDApp = new ExtendedDAppAdapter(extendedConfig);

// Now you can use extendedDApp for rendering and utilize the new IPFS-related functionality
extendedDApp.enableRealtimeCollaboration().enableChatFunctionality();

// Store a file on IPFS and Ethereum
const fileContent = Buffer.from("Hello, IPFS and Ethereum!");
extendedDApp.storeFileOnIPFS(fileContent).then((ipfsHash) => {
  console.log(`File stored on IPFS with hash: ${ipfsHash}`);
});


export { dappAdapterConfig };
export type { ExtendedDAppAdapterConfig, ExtendedDappProps };

