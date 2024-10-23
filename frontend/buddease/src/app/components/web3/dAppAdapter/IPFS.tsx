// Import necessary libraries or modules
import { ethers } from 'ethers';
import IPFS from 'ipfs';
import { getConfigsData } from '../../../api/getConfigsApi';
import { ipfsConfig } from '../../../configs/ipfsConfig';
import { useAuth } from '../../auth/AuthContext';
import { CustomDAppAdapter } from './DApp';
import { DAppAdapterConfig, DappProps } from './DAppAdapterConfig';
  // Get configs data and handle the case where it returns undefined
const extendedProps: ExtendedDappProps | undefined = await getConfigsData();

// Extend the existing DAppAdapterConfig interface
interface ExtendedDappProps extends DappProps {
  ipfsConfig: typeof ipfsConfig;
  ethereumRpcUrl: string; // Add ethereumRpcUrl property
  dappProps?: any; // Add dappProps property
}

interface ExtendedDAppAdapterConfig extends DAppAdapterConfig<ExtendedDappProps> {
  // Additional properties related to IPFS
  ipfsConfig: typeof ipfsConfig;
  ethereumRpcUrl: string; // Add ethereumRpcUrl property

}


const currentUser = useAuth().state.user; // Get the current user using the useAuth hook


let dappAdapterConfig: DAppAdapterConfig<ExtendedDappProps>;

if (currentUser) {
  // Ensure that currentUser is properly structured according to DappProps['currentUser']
  const currentUserForDapp: DappProps['currentUser'] = {
    id: currentUser.id, // Assign the user's ID
    name: currentUser.username, // Assign the user's name
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


export class ExtendedDAppAdapter extends CustomDAppAdapter<ExtendedDappProps> {
  private ipfs: IPFS;
  private ethereumProvider: ethers.JsonRpcProvider;
  
  constructor(config: ExtendedDAppAdapterConfig) {
    super(config as DAppAdapterConfig<ExtendedDappProps>);

    // Initialize IPFS
    this.ipfs = new IPFS(config.ipfsConfig);

    // Initialize Ethereum provider
    this.ethereumProvider = new ethers.JsonRpcProvider(config.ethereumRpcUrl);
  }

  // Extend other methods as needed

  async storeFileOnIPFS(file: Buffer): Promise<string> {
    // Add the file to IPFS and get the hash
    const result = await this.ipfs.add(file);
    const ipfsHash = result[0].hash;

    // Store the IPFS hash on the Ethereum blockchain
    await this.storeIPFSHashOnEthereum(ipfsHash);

    return ipfsHash;
  }

  


  private async getConfigsData(): Promise<ExtendedDappProps> {
    // Get configuration data from your application
    // Get the current user using the useAuth hook
    const currentUser = useAuth().state.user;

    let dappAdapterConfig: DAppAdapterConfig<ExtendedDappProps>;

    if (currentUser) {
      // Ensure that currentUser is properly structured according to DappProps['currentUser']
      const currentUserForDapp: DappProps['currentUser'] = {
        id: currentUser.id, // Assign the user's ID
        name: currentUser.username, // Assign the user's name
        role: String(currentUser.role), // Assign the user's role
        teams: currentUser.teams, // Assign the user's teams
        projects: currentUser.projects, // Assign the user's projects
        teamMembers: currentUser.teamMembers, // Assign the user's team members
      };

      // Now you can use `currentUser` in your DAppAdapterConfig
      dappAdapterConfig = {
        // Other properties...
        dappProps: {
          // Include other DappProps configurations...
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
          documentSize: 'letter',
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
    return 
  }

  private async storeIPFSHashOnEthereum(ipfsHash: string): Promise<void> {
    // Connect to Ethereum wallet (you may need to handle user authentication)
    const config = this.getConfig();
  
    // Ensure that the Ethereum private key is available in the config
    if (!config.dappProps.fluenceConfig.ethereumPrivateKey) {
      throw new Error('Ethereum private key is missing in the configuration');
    }
  
    const privateKey = config.dappProps.fluenceConfig.ethereumPrivateKey;
    const wallet = new ethers.Wallet(privateKey, this.ethereumProvider);
  
    // Retrieve contract address and ABI from environment variables
    const contractAddress = process.env.CONTRACT_ADDRESS; // Replace with your contract address from .env
    const contractABI: any[] = JSON.parse(process.env.CONTRACT_ABI || '[]'); // Replace with your contract ABI from .env
  
    // Check if contract address is provided
    if (!contractAddress) {
      throw new Error('Contract address is missing in the configuration');
    }

    // Connect to the contract
    const contract = new ethers.Contract(contractAddress, contractABI, wallet);
  
    // Call the Ethereum contract function to store IPFS hash
    await contract.storeIPFSHash(ipfsHash);

    // The function should return void, so we don't return anything here
    return;
  }




// Check if extendedProps is defined before using it
if (extendedProps: { systemApiData: any; userApiData: any; }) {
  // Use extendedProps here
  // For example:
  console.log(extendedProps.systemApiData);
  console.log(extendedProps.userApiData);
} else {
  console.error('Failed to fetch configs data');
}

  
}

// Usage example
const baseConfig = {
  appName: "Extended Project Management App",
  appVersion: "2.0",
  ethereumRpcUrl: "https://your-ethereum-rpc-url",
  dappProps: {} as ExtendedDappProps,
};

const extendedConfig: ExtendedDAppAdapterConfig = {
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

