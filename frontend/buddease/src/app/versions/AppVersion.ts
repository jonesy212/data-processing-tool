import getAppPath from '@/app/config/appStructure/appPath';
import { RootState } from "@/app/state/redux/slices/RootSlice";
import { DocumentTypeEnum } from "@/app/typings/documents";
import { getCurrentAppInfo } from '@/app/versions/VersionGenerator';
import FrontendStructure from "@/app/config/appStructure/FrontendStructure";
import BackendStructure from '@/app/server/database/BackendStructure';
import { VersionData } from "./VersionData";

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
  updateVersionNumber: (version: string) => void; // NEW
  getVersionNumber: () => string;  
}

//removed Versionabe from implements
class AppVersionImpl implements AppVersion {
  appName: string = "";
  releaseDate: string = "2023-04-20"; // Ensure releaseDate is typed as a string
  releaseNotes: string[] = [];

  minor: number = 0;
  major: number = 0;
  patch: number = 0;
  prerelease: boolean = true;
  build: number = 0;
  isDevBuild: boolean = false;

  frontendStructure: Promise<FrontendStructure<T, K>>;
  backendStructure: Promise<BackendStructure>;

  constructor(versionInfo: {
    appName: string;
    releaseDate: string;
    releaseNotes: string[];
  }) {
    this.appName = versionInfo.appName || "";
    this.releaseDate = versionInfo.releaseDate;
    this.releaseNotes = versionInfo.releaseNotes || [];
   
    // Parse version if provided
    if (versionInfo.versionNumber) {
    this.updateVersionNumber(versionInfo.versionNumber);
    }
    // Initialize structures
    this.frontendStructure = this.getFrontendStructure();
    this.backendStructure = this.getBackendStructure();
  }

  private async getFrontendStructure(): Promise<FrontendStructure<T, K>> {
    return Promise.resolve({
      id: 1,
      name: "Frontend",
      components: ["Header", "Footer", "Sidebar"],
      layout: "Grid",
      version: "1.0.0",
      description: "Frontend structure metadata",
      createdAt: new Date(),
      updatedAt: new Date(),
      isLatest: true,
      isPublished: true,
      publishedAt: new Date(),
      metadata: {},
      type: "UI",
      path: "/frontend",
      content: "<div>...</div>",
      draft: false,
      permissions: ["read", "write"],
      structureHash: "abc123",
      getStructureHash: () => "abc123",
      getStructure: () => "Structure Data",
      frontendVersions: ["1.0.0", "1.1.0"],
      getStructureAsArray: () => ["Component1", "Component2"],
      getStructureChecksum: () => "checksum123",
      major: this.major,
      minor: this.minor,
      patch: this.patch
    });
  }

  private async getBackendStructure(): Promise<BackendStructure> {
    const backendStructure = new BackendStructure("/backend/path", {});
    backendStructure.setStructureHash("exampleHash");

    const userRole: UserRole | undefined = getCurrentUserRole();
    const isAdmin: boolean = checkIfAdmin(userRole);

    return Promise.resolve({
      structureHash: backendStructure.getStructureHash(),
      version: "1.0.0",
      services: ["UserService", "AuthService"],
      databaseSchema: "v1.2",
      major: this.major,
      minor: this.minor,
      patch: this.patch,
      toSecureMetadata: backendStructure.toSecureMetadata(),
      sanitize: backendStructure.sanitize(userRole, isAdmin),
      getDatabaseSchema: () => "v1.2",
      getVersion: () => "1.0.0",
      getServices: () => ["UserService", "AuthService"],
      validateStructure: () => true,
      serializeStructure: () => "{}",
      compareStructures: (other: BackendStructure) => true,
      migrateStructure: async (newStructure: BackendStructure) => {},
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
    return `${this.major}.${this.minor}.${this.patch}.${this.build}`;
  }

  getVersionStringWithBuildNumber(buildNumber: number): string {
    return `${this.major}.${this.minor}.${this.patch}.${this.build}.${buildNumber}`;
  }


  getVersionNumber(): string {
    return `${this.major}.${this.minor}.${this.patch}`;
  }

  updateVersionNumber(version: string): void {
    const [major, minor, patch] = version.split(".").map(Number);
    if (major !== undefined) this.major = major;
    if (minor !== undefined) this.minor = minor;
    if (patch !== undefined) this.patch = patch;
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
    data: {} as VersionData<AppVersion>,
    frontend: {} as FrontendStructure<AppVersion>,
    backend: {} as BackendStructure,
  },
});

const { versionNumber } = getCurrentAppInfo();
const projectPath = getAppPath(versionNumber, appVersion);


// Define selector functions to extract appVersion and databaseVersion from the state
export const selectAppVersion = (state: RootState) =>
  state.versionManager.appVersion;
export const selectDatabaseVersion = (state: RootState) =>
  state.versionManager.databaseVersion;

// Update the appName
appVersion.updateAppName("NewApp");

// Get the current appName
const currentAppName = appVersion.getAppName();

// Update the appName
appVersion.updateAppName("NewApp");
const updatedAppName = appVersion.getAppName();

export { appVersion, currentAppName, updatedAppName };

export default AppVersionImpl;
