// TrackerService.ts
import type { DocumentData } from "@/core/documents/editing/DocumentBuilder";
import Tracker from "./Tracker";

class TrackerService {
  private trackers: Tracker[] = [];

  addTracker(tracker: Tracker): void {
    this.trackers.push(tracker);
  }

  getTrackers(): Tracker[] {
    return this.trackers;
  }

  getTrackerByName(name: string): Tracker | undefined {
    return this.trackers.find((tracker) => tracker.getName() === name);
  }

  
  // Method to initiate tracking for all trackers
  startTrackingAll(file: DocumentData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
    this.trackers.forEach((tracker: Tracker) => {
      tracker.trackFileChanges(file);
      tracker.trackFolderChanges();
      // Add more tracking methods as needed
    });
  }
}

export { TrackerService };
