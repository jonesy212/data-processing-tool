//TrackerService.ts
class TrackerService {
    private trackers: Tracker[] = [];
  
    addTracker(tracker: Tracker): void {
      this.trackers.push(tracker);
    }
  
    getTrackers(): Tracker[] {
      return this.trackers;
    }
  
    getTrackerByName(name: string): Tracker | undefined {
      return this.trackers.find((tracker) => tracker.name === name);
    }
  
    // Add more methods as needed
  }
  