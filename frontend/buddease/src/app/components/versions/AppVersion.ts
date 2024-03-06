// AppVersion.ts

import Version from "./Version";

class AppVersion extends Version {
  private releaseDate: string;
  private releaseNotes: string[];

  constructor(versionInfo: {
    versionNumber: string;
    appVersion: string;
    releaseDate: string; // Add release date field
    releaseNotes: string[]; // Add release notes field
  }) {
    super(versionInfo);
    // Initialize additional fields
    this.releaseDate = versionInfo.releaseDate;
    this.releaseNotes = versionInfo.releaseNotes;
  }

  // Additional methods to track changes and updates
  addReleaseNotes(notes: string) {
    this.releaseNotes.push(notes);
  }

  // Getters for additional fields
  getReleaseDate() {
    return this.releaseDate;
  }

  getReleaseNotes() {
    return this.releaseNotes;
  }
}

export { AppVersion };
