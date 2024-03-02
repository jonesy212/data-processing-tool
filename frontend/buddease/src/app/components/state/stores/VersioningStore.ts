// VersioningStore.ts
import { makeAutoObservable } from "mobx";

interface VersionItem {
  id: string;
  versionNumber: string;
  description: string;
}

interface VersioningStore {
  versions: VersionItem[];
  currentVersion: string;
  
  constructor(): void;
  addVersion(versionNumber: string, description: string): void;
  removeVersion(versionId: string): void;
  setCurrentVersion(versionNumber: string): void;
}

class VersioningStoreClass implements VersioningStore {
  versions: VersionItem[] = [];
  currentVersion: string = "";

  constructor() {
    makeAutoObservable(this);
  }
  
    ["constructor"](): void {
        throw new Error("Method not implemented.");
    }

  addVersion(versionNumber: string, description: string): void {
    const newVersion: VersionItem = {
      id: Date.now().toString(),
      versionNumber: versionNumber,
      description: description,
    };
    this.versions.push(newVersion);
  }

  removeVersion(versionId: string): void {
    this.versions = this.versions.filter((version) => version.id !== versionId);
  }

  setCurrentVersion(versionNumber: string): void {
    this.currentVersion = versionNumber;
  }
}

const useVersioningStore = (): VersioningStore => {
  return new VersioningStoreClass();
};

export { useVersioningStore };
export type { VersionItem };

