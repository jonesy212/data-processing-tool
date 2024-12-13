import BackendStructure, {
  backend,
  backendStructure,
} from "@/app/configs/appStructure/BackendStructure";
import { getCurrentAppInfo } from '@/app/components/versions/VersionGenerator';
import { API_VERSION_HEADER } from "@/app/configs/AppConfig";
import { RootState } from "../state/redux/slices/RootSlice";
import Version from "./Version";
import { DocumentTypeEnum } from "../documents/DocumentGenerator";
import FrontendStructure, { frontend } from "@/app/configs/appStructure/FrontendStructure";
import { VersionData } from "./VersionData";
import getAppPath from 'appPath';
import { globalState } from 'mobx/dist/internal';


interface Versionable {
  getVersionString: () => string;
  getVersionNumber?: () => string; // Optional, if not needed in all implementations
  getVersionStringWithBuildNumber: (buildNumber: number) => string;
  releaseDate: string;
  releaseNotes: string[];
  addReleaseNotes: (notes: string) => void;
  getReleaseDate: () => string;
  getReleaseNotes: () => string[];
}


// Extend the common interface in the AppVersion interface
interface AppVersion extends Versionable {
  appName: string;
  major: number;
  minor: number;
  patch: number;
  prerelease: boolean;
  build: number;
  isDevBuild: boolean;
  updateAppName: (name: string) => void;
  getAppName: () => string;
}

// Define selector functions to extract appVersion and databaseVersion from the state
export const selectAppVersion = (state: RootState) =>
  state.versionManager.appVersion;
export const selectDatabaseVersion = (state: RootState) =>
  state.versionManager.databaseVersion;


const { versionNumber } = getCurrentAppInfo();
const projectPath = getAppPath(versionNumber, appVersion);

// Implement the AppVersion interface
class AppVersionImpl implements AppVersion, Versionable {
  appName: string = "";
  releaseDate: string = "2023-04-20"; // Ensure releaseDate is typed as a string
  releaseNotes: string[] = [];

  minor: number = 0;
  major: number = 0;
  patch: number = 0;
  prerelease: boolean = true;
  build: number = 0;
  isDevBuild: boolean = false;



  frontendStructure: Promise<FrontendStructure>;
  backendStructure: Promise<BackendStructure>;

  constructor(versionInfo: {
    id: number;
    appName: string;
    versionNumber: string;
    checksum: string;
    appVersion: string;
    releaseDate: string;
    releaseNotes: string[];
    creator: {
      id: number;
      name: string;
    };
    content: string;
    data: any;
    name: string;
    url: string;
    versionHistory: any;
    draft: boolean;
    userId: string;
    documentId: string;
    parentId: string;
    parentType: string;
    parentVersion: string;
    parentTitle: string;
    parentContent: string;
    parentName: string;
    parentUrl: string;
    parentChecksum: string;
    parentMetadata: {};
    parentAppVersion: string;
    parentVersionNumber: string;
    documentType: DocumentTypeEnum;
    documentName: string;
    documentDescription: string;
    documentTags: [];
    documentStatus: string;
    documentVisibility: string;
    documentCreatedAt: Date;
    documentUpdatedAt: Date;
    description: string;

    createdAt: Date;
    updatedAt: Date;
    isLatest: boolean;
    isPublished: boolean;
    publishedAt: Date | null;
    source: string;
    status: string;
    workspaceId: string;
    workspaceName: string;
    workspaceType: string;
    workspaceUrl: string;
    workspaceViewers: string[];
    workspaceAdmins: string[];
    workspaceMembers: string[];
    workspaceRoles: string[];

    workspacePermissions: string[];
    workspaceSettings: {};
    workspaceMetadata: {};
    workspaceCreator: {
      id: number;
      name: string;
    };
    workspaceCreatedAt: string;
    workspaceUpdatedAt: string;
    workspaceArchivedAt: string;
    workspaceDeletedAt: string;
    workspaceVersion: string;
    workspaceVersionHistory: string[] | null;
    metadata: {
      author: string;
      timestamp: string | Date;
    };
    buildNumber: string;
    versions: {
      data: VersionData;
      frontend: FrontendStructure;
      backend: BackendStructure;
    };
  }) {
    this.appName = versionInfo.appName ? versionInfo.appName : "";
    this.releaseDate = versionInfo.releaseDate;
    this.releaseNotes = versionInfo.releaseNotes;
     this.frontendStructure = this.getFrontendStructure();
     this.backendStructure = this.getBackendStructure();
  
  }

  // Example function to retrieve FrontendStructure (returns a promise)
  private getFrontendStructure(): Promise<FrontendStructure> {
    return Promise.resolve({

      id: 0,
      name: "",
      components: ["Header", "Footer", "Sidebar"],
      layout: "Grid",
      version: "1.0.0",
      versions: {
        backend: backend,
        frontend: frontend
      },
      versionData: {},
  
      description: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      isLatest: false,
      isPublished: false,
      publishedAt: null,
      metadata: {},
      type: "",
      path: "",
      content: "",
      draft: "",
      permissions: "",
      structureHash: "",
      getStructureHash: "",
      getStructure: "",
      frontendVersions: "",
      getStructureAsArray: "",
      getStructureChecksum: "",
      major: "", 
      minor: "",
      patch: "",
      backend: backendStructure,
      frontend: this.frontendStructure,
    });
  }

  // Example function to retrieve BackendStructure (returns a promise)
  private getBackendStructure(): Promise<BackendStructure> {
    const backendStructure = new BackendStructure(projectPath, globalState);
    backendStructure.setStructureHash("exampleHash");

    return Promise.resolve({
      // #structureHash,
      toSecureMetadata, sanitize,
      major: 1, minor: 0, patch: 0,
      services: ["UserService", "AuthService"],
      databaseSchema: "v1.2",
      version: "1.0.0",
      structureHash: "",
      globalState: {},
      setDatabaseSchema: (schema: string) => {},
      getDatabaseSchema: () => "v1.2",
      addService: (service: string) => {},
      removeService: (service: string) => {},
      updateVersion: (version: string) => {},
      getVersion: () => "1.0.0",
      getServices: () => ["UserService", "AuthService"],
      validateStructure: () => true,
      serializeStructure: () => "",
      deserializeStructure: (serialized: string) => {},
      compareStructures: (other: BackendStructure) => true,
      migrateStructure: (newStructure: BackendStructure) => Promise.resolve(),
      setServices: "",
      getStructure: "",
      getStructureAsArray: "",
      traverseDirectoryPublic: "",
      getStructureHash: "",
      setStructureHash: "",
      updateStructureHash: "",
      getStructureHashAndUpdateIfNeeded: "",
      backendVersions: "",
    });
  }
  getAppName(): string {
    return this.appName;
  }

  updateAppName(newAppName: string): void {
    this.appName = newAppName;
  }

  addReleaseNotes(notes: string): void {
    this.releaseNotes.push(notes);
  }

  getReleaseDate(): string {
    return this.releaseDate;
  }

  getReleaseNotes(): string[] {
    return this.releaseNotes;
  }

  getVersionString(): string {
    const versionString = `${this.major}.${this.minor}.${this.patch}.${this.build}`;
    const apiVersionHeader = API_VERSION_HEADER
      ? `- API Version: ${API_VERSION_HEADER}`
      : "";
    return `${versionString} ${apiVersionHeader}`;
  }

  getVersionStringWithBuildNumber(buildNumber: number): string {
    return `${this.major}.${this.minor}.${this.patch}.${this.build}.${buildNumber}`;
  }
}

export { AppVersionImpl as AppVersion };

// Define the appVersion object with the correct structure
const appVersion: AppVersion = new AppVersionImpl({
  id: 1,
  appName: "MyApp",
  versionNumber: "1.0.0",
  checksum: "",
  appVersion: "v1",
  releaseDate: "2024-03-07",
  releaseNotes: ["Initial release"],
  creator: {
    id: 1,
    name: "Admin",
  },
  content: "Version 1.0.0 released",
  data: null,
  name: "",
  url: "",
  versionHistory: null,
  metadata: {
    author: "Admin",
    timestamp: "2024-03-07",
  },
  buildNumber: "0",
  draft: false,
  userId: "0",
  documentId: "0",
  parentId: "0",
  parentType: "",
  parentVersionNumber: "",
  parentVersion: "",
  parentTitle: "",
  parentContent: "",
  parentName: "",
  parentUrl: "",
  parentChecksum: "",
  parentMetadata: {},
  parentAppVersion: "",
  documentType: DocumentTypeEnum.APP_VERSION,
  documentName: "",
  documentDescription: "",
  documentTags: [],
  documentStatus: "",
  workspaceId: "",
  workspaceType: "",
  workspaceMembers: [],
  workspaceRoles: [],
  workspacePermissions: [],
  workspaceSettings: {},
  workspaceMetadata: {},
  workspaceCreator: {
    id: 0,
    name: "",
  },
  workspaceCreatedAt: "",
  workspaceUpdatedAt: "",
  workspaceArchivedAt: "",
  workspaceDeletedAt: "",
  workspaceVersion: "",
  workspaceVersionHistory: null,
  documentVisibility: "",
  documentCreatedAt: new Date(),
  documentUpdatedAt: new Date(),
  description: "",
  createdAt: new Date(), // Add createdAt property
  updatedAt: new Date(), // Add updatedAt property
  isLatest: true, // Add isLatest property
  isPublished: false, // Add isPublished property
  publishedAt: null, // Add publishedAt property
  source: "", // Add source property
  status: "", // Add status property
  workspaceName: "", // Add workspaceName property
  workspaceUrl: "", // Add workspaceUrl property
  workspaceViewers: [], // Add workspaceViewers property
  workspaceAdmins: [], // Add workspaceAdmins property
  versions: {
    data: {} as VersionData,
    frontend: {} as FrontendStructure,
    backend: {} as BackendStructure,
  },
});

// Update the appName
appVersion.updateAppName("NewApp");

// Get the current appName
const currentAppName = appVersion.getAppName();

// Update the appName
appVersion.updateAppName("NewApp");
const updatedAppName = appVersion.getAppName();

export { currentAppName, updatedAppName , appVersion};

export default AppVersionImpl;
