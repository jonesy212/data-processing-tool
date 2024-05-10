// Version.ts
import { AppStructureItem } from '@/app/configs/appStructure/AppStructure';
import BackendStructure from '@/app/configs/appStructure/BackendStructure';
import FrontendStructure from '@/app/configs/appStructure/FrontendStructure';
import crypto from 'crypto';
import getAppPath from '../../../../appPath';
import { Data } from '../models/data/Data';

class Version {
  name: string;
  url: string;
  versionNumber: string;
  appVersion: string;
  id: number; // Add id property
  content: string; // Add content property
  frontendStructure: Promise<AppStructureItem[]>; // Change type to AppStructureItem[]
  backendStructure: Promise<AppStructureItem[]>; // Change type to AppStructureItem[]
  data: Data[]

  getVersion: () => {}
  private structure: Record<string, AppStructureItem[]> = {}
  private mergeStructures(baseStructure: AppStructureItem[], additionalStructure: AppStructureItem[]): AppStructureItem[] {
    // Deep copy the base structure to avoid mutation
    const mergedStructure = JSON.parse(JSON.stringify(baseStructure));

    // Loop through the additional structure
    additionalStructure.forEach((item) => {
      // Find if the item exists in the base structure
      const existingItem = mergedStructure.find((baseItem:any) => baseItem.id === item.id);

      if (existingItem) {
        // Merge properties from the additional structure item
        Object.assign(existingItem, item);
      } else {
        // If the item doesn't exist in the base structure, add it
        mergedStructure.push(item);
      }
    });

    return mergedStructure;
  }




  constructor(versionInfo: {
    id: number;
    versionNumber: string;
    appVersion: string;
    content: string;
    data: Data[]; // Add data property to constructor parameter
    name: string; // Add name property to constructor parameter
    url: string; // Add url property to constructor parameter
  }) {
    this.id = versionInfo.id;
    this.versionNumber = versionInfo.versionNumber;
    this.appVersion = versionInfo.appVersion;
    this.content = versionInfo.content;
    this.data = versionInfo.data;
    this.name = versionInfo.name;
    this.url = versionInfo.url;
    this.getVersion = async () => { 
      const frontendStructure = await this.frontendStructure;
      const backendStructure = await this.backendStructure;

      // Merge frontend and backend structures
      const mergedStructure = this.mergeStructures(
        frontendStructure,
        backendStructure
      );

      // Generate hash of the merged structure
      const hash = crypto
        .createHash('sha256')
        .update(JSON.stringify(mergedStructure))
        .digest('hex');

      return hash;
    }
    
 // Assuming FrontendStructure provides a method to get the structure as an array
 const frontendStructureInstance = new FrontendStructure(getAppPath(this.versionNumber, this.appVersion));
    this.frontendStructure = frontendStructureInstance.getStructureAsArray(); // Adjust this according to the method in FrontendStructure
    const backendStructureInsatnce = new BackendStructure(getAppPath(this.versionNumber, this.appVersion));
    this.backendStructure = backendStructureInsatnce.getStructureAsArray(); // Adjust this according to the method in BackendStructure
 }

private async generateStructureHash(): Promise<string> {
  // Wait for the resolution of the promise
  const frontendStructure = await this.frontendStructure;
  
  return crypto
    .createHash("sha1")
    .update(JSON.stringify(frontendStructure))
    .digest("hex");
}



  mergeAndHashStructures(additionalStructure: AppStructureItem[]): string {
    // Merge the additional structure with the existing structure
    const mergedStructure = this.mergeStructures(this.structure.items, additionalStructure);
    
    // Generate hash for the merged structure
    return this.hashStructure(mergedStructure);
  }

  getVersionNumber(): string {
    return this.versionNumber;
  }

  updateVersionNumber(newVersionNumber: string): void { 
    this.versionNumber = newVersionNumber;
  }


  static create(versionInfo: {
    id: number;
    versionNumber: string;
    appVersion: string;
    content: string;
    data: Data[];
    name: string;
    url: string;
  }): Version {
    return new Version(versionInfo);
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
 
  generateHash(appVersion: string): string {
    const hash = crypto.createHash('sha256');
    hash.update(this.versionNumber);
    // Include appVersion in hash generation
    hash.update(appVersion);
    return hash.digest('hex');
  }

  // Method to check if the version is newer than another
  isNewer(otherVersion: Version): boolean {
    return this.compare(otherVersion) === 1;
  }

  hashStructure(structure: AppStructureItem[]): string {
    return crypto
      .createHash("sha1")
      .update(JSON.stringify(structure))
      .digest("hex");
  }

  // Method to get structure hash
  getStructureHash(): Promise<string> {
    return this.generateStructureHash();
  }

  // Method to retrieve version content
  getContent(): string {
    return this.content;
  }

  // Method to set version content
  setContent(content: string): void {
    this.content = content;
  }
  getStructure?(): Record<string, AppStructureItem[]> {
    return this.structure;
  }

}

export default Version;
