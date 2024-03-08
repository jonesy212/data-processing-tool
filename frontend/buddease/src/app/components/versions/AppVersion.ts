// AppVersion.ts

import Version from "./Version";

// Define the AppVersion interface without access modifiers
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
    // Implement getVersionString logic here
    return `${this.major}.${this.minor}.${this.patch}.${this.build}`;
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
const appVersion = new AppVersionImpl({
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
