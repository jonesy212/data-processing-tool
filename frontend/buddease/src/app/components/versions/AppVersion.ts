// AppVersion.ts

import { API_VERSION_HEADER } from "@/app/configs/AppConfig";
import { RootState } from "../state/redux/slices/RootSlice";
import Version from "./Version";
// Define the AppVersion interface without access modifiers
// Define selector functions to extract appVersion and databaseVersion from the state
export const selectAppVersion = (state: RootState) => state.versionManager.appVersion;
export const selectDatabaseVersion = (state: RootState) => state.versionManager.databaseVersion;

interface AppVersion {
  appName: string;
  major: number;
  minor: number;
  patch: number;
  build: number;
  isDevBuild: boolean;
  getVersionString: () => string;
  getVersionNumber: () => string;
  getVersionStringWithBuildNumber: (buildNumber: number) => string;
  // Properties without access modifiers
  releaseDate: string;
  releaseNotes: string[];

  addReleaseNotes: (notes: string) => void;
  getReleaseDate: () => string;
  getReleaseNotes: () => string[];
  updateAppName: (name: string) => void;
  getAppName: () => string;
}

// Implement the AppVersion interface
class AppVersionImpl extends Version implements AppVersion {
  appName: string ='';
  releaseDate: string;
  releaseNotes: string[];

  // Initialize additional fields
  minor: number = 0;
  major: number = 0;
  patch: number = 0;
  build: number = 0;
  isDevBuild: boolean = false;

  constructor(versionInfo: {
    id: number;
    appName: string;
    versionNumber: string;
    appVersion: string;
    releaseDate: Date;
    releaseNotes: string[];
    creator: {
      id: number;
      name: string;
    };
    content: string;
    data: any;
  }) {
    super(versionInfo);
    // Initialize additional fields
    this.appName = versionInfo.appName;
    this.releaseDate = new Date(versionInfo.releaseDate).toString()
    this.releaseNotes = versionInfo.releaseNotes;
  }

   // Method to retrieve the appName
   getAppName(): string {
    return this.appName;
  }

  // Method to update the appName
  updateAppName(newAppName: string): void {
    this.appName = newAppName;
  }

  addReleaseNotes(notes: string) {
    this.releaseNotes.push(notes);
  }

  getReleaseDate() {
    return this.releaseDate;
  }

  getReleaseNotes() {
    return this.releaseNotes;
  }

  // Implement getVersionString method
  getVersionString() {
    // Integrate API_VERSION_HEADER here
    const versionString = `${this.major}.${this.minor}.${this.patch}.${this.build}`;
    const apiVersionHeader = API_VERSION_HEADER ? `- API Version: ${API_VERSION_HEADER}` : ''; // Check if API_VERSION_HEADER is defined
    return `${versionString} ${apiVersionHeader}`;
  }


  // Implement getVersionStringWithBuildNumber method
  getVersionStringWithBuildNumber(buildNumber: number) {
    // Implement getVersionStringWithBuildNumber logic here
    return `${this.major}.${this.minor}.${this.patch}.${this.build}.${buildNumber}`;
  }

}

export { AppVersionImpl as AppVersion };


// Define the appVersion object with the correct structure
const appVersion: AppVersion = new AppVersionImpl({
  id: 1,
  appName: 'MyApp',
  versionNumber: '1.0.0',
  appVersion: 'v1',
  releaseDate: new Date('2024-03-07'),
  releaseNotes: ['Initial release'],
  creator: {
    id: 1,
    name: 'Admin'
  },
  content: 'Version 1.0.0 released',
  data: null,
  
});
 
// Update the appName
appVersion.updateAppName('NewApp');
 

// Get the current appName
const currentAppName = appVersion.getAppName(); // Returns 'MyApp'

// Update the appName
appVersion.updateAppName('NewApp');
const updatedAppName = appVersion.getAppName(); // Returns 'NewApp'
export { currentAppName, updatedAppName };

export default AppVersionImpl