import { DocumentData } from "../../documents/DocumentBuilder";
import { Phase } from "../../phases/Phase"

//Tracker.ts
export interface Tracker {
    id: string
    name: string
    phases: Phase[]
    trackFileChanges: (file: DocumentData) => void;
    trackFolderChanges: () => void;
    getName: (trackerName:) => string;
    // Add more properties as needed
}
  
  
class TrackerClass implements Tracker {
    id: string;
    name: string;
  
    constructor(id: string, name: string) {
      this.id = id;
      this.name = name;
    }
  
    trackFileChanges(file: DocumentData): void {
      // Implement file tracking logic here
      console.log(`Tracking changes for file: ${file.title}`);
    }
  
    trackFolderChanges(): void {
      // Implement folder tracking logic here
      console.log("Tracking changes for folder.");
    }
  }
  
  export default TrackerClass;