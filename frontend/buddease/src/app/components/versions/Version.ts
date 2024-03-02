// Version.ts
class Version {
  versionNumber: string;

  constructor(versionInfo: { versionNumber: string }) {
    this.versionNumber = versionInfo.versionNumber;
  }

  getVersionNumber(): string {
    return this.versionNumber;
  }

  // Method to compare two versions
  compare(otherVersion: Version): number {
    const currentParts = this.versionNumber.split('.').map(part => parseInt(part, 10));
    const otherParts = otherVersion.versionNumber.split('.').map(part => parseInt(part, 10));

    for (let i = 0; i < currentParts.length; i++) {
      if (currentParts[i] > otherParts[i]) return 1;
      if (currentParts[i] < otherParts[i]) return -1;
    }

    return 0;
  }

  // Method to parse a version string into an array of version parts
  parse(): number[] {
    return this.versionNumber.split('.').map(part => parseInt(part, 10));
  }

  // Method to check if the version is valid
  isValid(): boolean {
    const versionParts = this.versionNumber.split('.');
    return versionParts.every(part => /^\d+$/.test(part));
  }
}

export default Version;
