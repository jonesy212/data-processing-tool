// FileType.ts
import fs from "fs";
// Define enums for file categories and types
enum FileCategory {
  Component = "Component",
  Redux = "Redux",
  MobX = "MobX",
  API = "API",
  Utility = "Utility",
  Config = "Config",
  Test = "Test",
  Documentation = "Documentation",
  Design = "Design",
  Multimedia = "Multimedia",
  Configuration = "Configuration",
  Analytics = "Analytics",
  Localization = "Localization",
  SmartContract = "SmartContract",
  Bytecode = "Bytecode",
  EthereumPackage = "EthereumPackage", // Ethereum package files
  JWT = "JWT", // JSON Web Token files
  BlockchainData = "BlockchainData", // Blockchain data files
  CryptoKey = "key", // Crypto key files
  Wallet = "wallet", // Wallet files
  Hash = "hash", // Cryptographic hash files
  MerkleProof = "proof", // Merkle tree proof files
  ENS = "ens", // Ethereum Name Service files
}
// Define enums for file types
enum FileType {
  UI = "UI",
  Actions = "Actions",
  Saga = "Saga",
  Slice = "Slice",
  API = "API",
  Service = "Service",
  Dashboard = "Dashboard",
  Page = "Page",
  Data = "Data",
  Configs = "Configs",
}

// Define the list of features and their associated file categories
interface FeatureFiles {
  [feature: string]: FileCategory[];
}

// Define function to generate file categories for a feature
function generateFileCategories(categories: FileCategory[]): FileCategory[] {
  const fileCategories: FileCategory[] = [
    FileCategory.Component,
    FileCategory.Redux,
    FileCategory.API,
    FileCategory.MobX,
    FileCategory.Utility,
    FileCategory.Test,
    FileCategory.Documentation,
    FileCategory.Design,
    FileCategory.Multimedia,
    FileCategory.Configuration,
    FileCategory.Analytics,
    FileCategory.Localization,
    // Add more file categories as needed
  ];

  categories.forEach((category) => {
    fileCategories.push(category);
  });

  return fileCategories;
}

// Define file categories for the Task feature
const taskFileCategories: FileCategory[] = generateFileCategories([
  FileCategory.Utility,
]);

// Define file categories for the Project feature
const projectFileCategories: FileCategory[] = generateFileCategories([]);

// Define file categories for the Product feature
const productFileCategories: FileCategory[] = generateFileCategories([]);

// Define file categories for the User feature
const userFileCategories: FileCategory[] = generateFileCategories([]);

// Define the list of features and their associated file categories
const featureFiles: FeatureFiles = {
  User: userFileCategories,
  Task: taskFileCategories,
  Project: projectFileCategories,
  Product: productFileCategories,
};

// Utility function to check if all required files are present for a feature
function checkFeatureFiles(feature: string): boolean {
  const requiredCategories = featureFiles[feature];
  if (!requiredCategories) return false;

  for (const category of requiredCategories) {
    const extensions = fileExtensions[category];
    if (!extensions) return false;

    const filesFound = extensions.some((ext) =>
      fs.existsSync(`path/to/${feature}.${ext}`)
    );
    if (!filesFound) return false;
  }

  return true;
}

// Example usage:
const feature = "User";
const filesComplete = checkFeatureFiles(feature);
console.log(`Files for feature "${feature}" are complete: ${filesComplete}`);

// Define a mapping of file names to their corresponding categories and types
const fileMapping: {
  [key: string]: { category: FileCategory; type: FileType };
} = {
  UserComponent: { category: FileCategory.Component, type: FileType.UI },
  UserUI: { category: FileCategory.Component, type: FileType.UI },
  UserList: { category: FileCategory.Component, type: FileType.UI },
  UserActions: { category: FileCategory.Redux, type: FileType.Actions },
  UserSaga: { category: FileCategory.Redux, type: FileType.Saga },
  UserSlice: { category: FileCategory.Redux, type: FileType.Slice },
  UserAPI: { category: FileCategory.Redux, type: FileType.API },
  UserService: { category: FileCategory.MobX, type: FileType.Service },
  UserForm: { category: FileCategory.Component, type: FileType.UI },
    UserProfile: { category: FileCategory.Component, type: FileType.UI },
  ProjectDetails: {category: FileCategory.Component, type: FileType.UI},
  UserDetails: { category: FileCategory.Component, type: FileType.UI },
  UserCard: { category: FileCategory.Component, type: FileType.UI },
  UserListActions: { category: FileCategory.Component, type: FileType.Actions },
  RootSagas: { category: FileCategory.Redux, type: FileType.Saga },
  RootStores: { category: FileCategory.Redux, type: FileType.Slice },
  RootLayout: { category: FileCategory.Component, type: FileType.UI },
  RootStoreComponent: { category: FileCategory.Component, type: FileType.UI },
  UserStore: { category: FileCategory.MobX, type: FileType.Service },
};

// Define the user structure by specifying the required file types
const userStructure: FileType[] = [
  FileType.UI,
  FileType.Actions,
  FileType.Saga,
  FileType.Slice,
  FileType.API,
  FileType.Service,
];

const fileExtensions: Record<FileCategory, string[]> = {
  Component: ["tsx"],
  Redux: ["ts"],
  MobX: ["ts"],
  API: ["ts"],
  Utility: ["ts"],
  Config: ["ts"],
  Test: ["ts", "tsx"],
  Documentation: ["md", "pdf"],
  Design: ["xd", "fig", "sketch"],
  Multimedia: [
    "png",
    "jpg",
    "jpeg",
    "gif",
    "svg",
    "mp4",
    "avi",
    "mov",
    "wav",
    "mp3",
  ],
  Configuration: ["json", "yaml", "yml"],
  Analytics: ["csv", "xls", "xlsx"],
  Localization: ["json", "po", "pot"],
  SmartContract: ["sol"], // Solidity smart contract files
  Bytecode: ["evm"], // Ethereum Virtual Machine bytecode files
  EthereumPackage: ["ethpkg"], // Ethereum package files
  JWT: ["jwt"], // JSON Web Token files
  BlockchainData: ["blk"], // Blockchain data files
  CryptoKey: ["key"], // Crypto key files
  Wallet: ["wallet"], // Wallet files
  Hash: ["hash"], // Cryptographic hash files
  MerkleProof: ["proof"], // Merkle tree proof files
  ENS: ["ens"], // Ethereum Name Service files
};

// Function to dynamically check for files related to the user structure
function checkUserFiles(files: string[]): void {
  const userFiles: string[] = [];

  // Iterate through the provided files and check if they match the user structure
  files.forEach((fileName) => {
    const fileInfo = fileMapping[fileName];
    if (fileInfo && userStructure.includes(fileInfo.type)) {
      userFiles.push(fileName);
    }
  });

  // Output the files related to the user structure
  console.log("User-related files:");
  console.log(userFiles);
}

// Example usage:
const files: string[] = [
  "UserComponent",
  "UserUI",
  "UserList",
  "UserActions",
  "UserSaga",
  "UserSlice",
  "UserAPI",
  "UserService",
  "UserForm",
  "UserProfile",
  "UserDetails",
  "UserCard",
  "UserListActions",
  "RootSagas",
  "RootStores",
  "RootLayout",
  "RootStoreComponent",
  "UserStore",
];

checkUserFiles(files);
