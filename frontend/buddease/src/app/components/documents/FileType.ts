// FileTypeEnum.ts
import useErrorHandling from "../hooks/useErrorHandling";
import { CalendarLogger } from "../logging/Logger";

// Define enums for file categories and types
export enum FileCategory {
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
  CryptoKey = "CryptoKey", // Crypto key files
  Wallet = "Wallet", // Wallet files
  Hash = "Hash", // Cryptographic hash files
  MerkleProof = "MerkleProof", // Merkle tree proof files
  ENS = "ENS", // Ethereum Name Service files
}

// Define enums for file types
export enum FileTypeEnum {
  UI = "UI",
  Actions = "Actions",
  Saga = "Saga",
  Slice = "Slice",
  API = "API",
  Service = "Service",
  Dashboard = "Dashboard",
  Document = "Document",
  Page = "Page",
  Data = "Data",
  Configs = "Configs",
  DataVersionsConfig = "DataVersionsConfig",
  FrontendStructure = "FrontendStructure",
  UserSettings = "UserSettings",
  UnknownType = "UnknownType",
  PDF = "pdf",
  MD = "md",
  Image = "image",
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
// Define file categories for the Todo feature
const todoFileCategories: FileCategory[] = generateFileCategories([
  FileCategory.Utility,
]);
// Define file categories for the Project feature
const projectFileCategories: FileCategory[] = generateFileCategories([]);

// Define file categories for the Product feature
const productFileCategories: FileCategory[] = generateFileCategories([]);

// Define file categories for the User feature
const userFileCategories: FileCategory[] = generateFileCategories([]);

// Define file categories for the Calendar feature
const calendarFileCategories: FileCategory[] = generateFileCategories([]);
// Define the list of features and their associated file categories
const featureFiles: FeatureFiles = {
  User: userFileCategories,
  Task: taskFileCategories,
  Todo: taskFileCategories,
  Project: projectFileCategories,
  Product: productFileCategories,
  Calendar: calendarFileCategories,
};
// Utility function to check if all required files are present for a feature
async function checkFeatureFiles(
  feature: string,
  fileExists: (path: string) => Promise<boolean>
): Promise<boolean> {
  const requiredCategories = featureFiles[feature];
  if (!requiredCategories) return false;

  for (const category of requiredCategories) {
    const extensions = fileExtensions[category];
    if (!extensions) return false;

    const filesFound = await Promise.all(
      extensions.map(
        async (ext) => await fileExists(`path/to/${feature}.${ext}`)
      )
    );
    if (!filesFound.some((found) => found)) return false;
  }

  return true;
}

// Define a function to check if a file exists
const fileExists = async (path: string): Promise<boolean> => {
  const { handleError } = useErrorHandling(); // Accessing the handleError function from the useErrorHandling hook
  try {
    // Make a fetch request to the file URL
    const response = await fetch(path, { method: "HEAD" });

    // Check if the response status is OK (200)
    if (response.ok) {
      // Log the successful event using CalendarLogger
      CalendarLogger.logCalendarEvent("File exists", "uniqueID", "eventID");
    } else {
      // Log the failure event using CalendarLogger
      CalendarLogger.logCalendarEvent(
        "File does not exist",
        "uniqueID",
        "eventID"
      );
    }

    return response.ok;
  } catch (error: any) {
    // Handle any errors that occur during the fetch request
    // Log the error using the generic error handler
    handleError(error);

    // Return false to indicate that the file does not exist (since we couldn't verify)
    return false;
  }
};

// Example usage:
const feature = "User";
const filesComplete = checkFeatureFiles(feature, fileExists);
console.log(`Files for feature "${feature}" are complete: ${filesComplete}`);

// Define a mapping of file names to their corresponding categories and types
const fileMapping: {
  [key: string]: { category: FileCategory; type: FileTypeEnum };
} = {
  UserComponent: { category: FileCategory.Component, type: FileTypeEnum.UI },
  UserUI: { category: FileCategory.Component, type: FileTypeEnum.UI },
  UserList: { category: FileCategory.Component, type: FileTypeEnum.UI },
  UserActions: { category: FileCategory.Redux, type: FileTypeEnum.Actions },
  UserSaga: { category: FileCategory.Redux, type: FileTypeEnum.Saga },
  UserSlice: { category: FileCategory.Redux, type: FileTypeEnum.Slice },
  UserAPI: { category: FileCategory.Redux, type: FileTypeEnum.API },
  UserService: { category: FileCategory.MobX, type: FileTypeEnum.Service },
  UserForm: { category: FileCategory.Component, type: FileTypeEnum.UI },
  UserProfile: { category: FileCategory.Component, type: FileTypeEnum.UI },
  ProjectDetails: { category: FileCategory.Component, type: FileTypeEnum.UI },
  UserDetails: { category: FileCategory.Component, type: FileTypeEnum.UI },
  UserCard: { category: FileCategory.Component, type: FileTypeEnum.UI },
  UserListActions: {
    category: FileCategory.Component,
    type: FileTypeEnum.Actions,
  },
  RootSagas: { category: FileCategory.Redux, type: FileTypeEnum.Saga },
  RootStores: { category: FileCategory.Redux, type: FileTypeEnum.Slice },
  RootLayout: { category: FileCategory.Component, type: FileTypeEnum.UI },
  RootStoreComponent: {
    category: FileCategory.Component,
    type: FileTypeEnum.UI,
  },
  UserStore: { category: FileCategory.MobX, type: FileTypeEnum.Service },
};

// Define the user structure by specifying the required file types
const userStructure: FileTypeEnum[] = [
  FileTypeEnum.UI,
  FileTypeEnum.Actions,
  FileTypeEnum.Saga,
  FileTypeEnum.Slice,
  FileTypeEnum.API,
  FileTypeEnum.Service,
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


export {fileMapping}