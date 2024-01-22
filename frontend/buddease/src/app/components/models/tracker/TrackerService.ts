// TrackerService.ts
import { Tracker } from "./Tracker";

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

  // Add more methods as needed

  // Method to initiate tracking for all trackers
  startTrackingAll(): void {
    this.trackers.forEach((tracker) => {
      tracker.trackFileChanges();
      tracker.trackFolderChanges();
      // Add more tracking methods as needed
    });
  }
}

export { TrackerService };
