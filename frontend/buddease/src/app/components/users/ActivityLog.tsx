// ActivityLog.tsx
import { ActivityLogEntry } from "./UserSlice";
class ActivityLog {
  private entries: ActivityLogEntry[];

  constructor() {
    this.entries = [];
  }

  // Method to add a new entry to the activity log
  addEntry(entry: ActivityLogEntry): void {
    this.entries.push(entry);
  }

  // Method to retrieve all entries from the activity log
  getAllEntries(): ActivityLogEntry[] {
    return this.entries;
  }

  // Method to clear all entries from the activity log
  clearLog(): void {
    this.entries = [];
  }

  // Method to filter entries by activity type
  filterByActivity(activity: string): ActivityLogEntry[] {
    return this.entries.filter(entry => entry.activity === activity);
  }

  // Method to filter entries by timestamp range
  filterByTimestampRange(start: Date, end: Date): ActivityLogEntry[] {
    return this.entries.filter(entry => entry.timestamp >= start && entry.timestamp <= end);
  }

  // Other methods for managing the activity log can be added as needed
}

export { ActivityLog };
