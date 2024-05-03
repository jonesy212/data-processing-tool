// AppVersion.ts

import { API_VERSION_HEADER } from "@/app/configs/AppConfig";
import Version from "./Version";
import { RootState } from "../state/redux/slices/RootSlice";
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
    appName: string;
    versionNumber: string;
    appVersion: string;
    releaseDate: string;
    releaseNotes: string[];
  }) {
    super(versionInfo);
    // Initialize additional fields
    this.appName = versionInfo.appName;
    this.releaseDate = versionInfo.releaseDate;
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



// Example usage
// Create an instance of AppVersionImpl
export const appVersion = new AppVersionImpl({
  appName: 'MyApp',
  versionNumber: '1.0.0',
  appVersion: 'v1',
  releaseDate: '2024-03-07',
  releaseNotes: ['Initial release'],
});


// Get the current appName
const currentAppName = appVersion.getAppName(); // Returns 'MyApp'

// Update the appName
appVersion.updateAppName('NewApp');
const updatedAppName = appVersion.getAppName(); // Returns 'NewApp'
export {updatedAppName, currentAppName};