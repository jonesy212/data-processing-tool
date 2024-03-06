import crypto from 'crypto';

class Version {
  versionNumber: string;
  appVersion: string;
  constructor(versionInfo: { versionNumber: string , appVersion: string}) {
    this.versionNumber = versionInfo.versionNumber;
    this.appVersion = versionInfo.appVersion;
  }

  getVersionNumber(): string {
    return this.versionNumber;
  }

  updateVersionNumber(newVersionNumber: string): void { 
    this.versionNumber = newVersionNumber;
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

  // Method to generate a hash based on the version number

  // Updated generateHash method to include appVersion as a parameter
  generateHash(appVersion: string): string {
    const hash = crypto.createHash('sha256');
    hash.update(this.versionNumber);
    // Include appVersion in hash generation
    hash.update(appVersion);
    return hash.digest('hex');
  }

  

}

export default Version;
