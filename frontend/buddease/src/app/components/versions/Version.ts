// Version.ts
class Version {
    versionNumber: string;
  
    constructor(versionNumber: string) {
      this.versionNumber = versionNumber;
    }
  
    getVersionNumber(): string {
      return this.versionNumber;
    }
  }
  
  export default Version;
  