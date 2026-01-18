// PhaseActivityStore.ts
import { makeAutoObservable, reaction } from "mobx";

export interface PhaseActivity {
  lastActivityTime: number;
  activityCount: number;
  phaseName: string;
}

export class PhaseActivityStore {
  activities: Map<string, PhaseActivity> = new Map();

  constructor() {
    makeAutoObservable(this);

    // Log activity changes for debugging
    reaction(
      () => this.activities.size,
      () => console.log("Phase activities updated:", this.activities)
    );
  }

  // Get last activity time for a phase
  getLastActivityTime(phaseName: string): number {
    const activity = this.activities.get(phaseName);
    
    if (activity) {
      return activity.lastActivityTime;
    }
    
    // Initialize if not exists
    const currentTime = new Date().getTime();
    this.initializePhase(phaseName, currentTime);
    return currentTime;
  }

  // Record new activity for a phase
  recordActivity(phaseName: string): void {
    const currentTime = new Date().getTime();
    const existingActivity = this.activities.get(phaseName);
    
    if (existingActivity) {
      this.activities.set(phaseName, {
        ...existingActivity,
        lastActivityTime: currentTime,
        activityCount: existingActivity.activityCount + 1
      });
    } else {
      this.initializePhase(phaseName, currentTime);
    }
  }

  // Get phase statistics
  getPhaseStats(phaseName: string): PhaseActivity {
    const activity = this.activities.get(phaseName);
    const currentTime = new Date().getTime();
    
    return activity || {
      phaseName,
      lastActivityTime: currentTime,
      activityCount: 0
    };
  }

  // Initialize a new phase
  private initializePhase(phaseName: string, timestamp: number): void {
    this.activities.set(phaseName, {
      phaseName,
      lastActivityTime: timestamp,
      activityCount: 1
    });
  }

  // Clear all activities
  clearActivities(): void {
    this.activities.clear();
  }

  // Get all phase names
  getPhaseNames(): string[] {
    return Array.from(this.activities.keys());
  }

  // Get total activity count across all phases
  getTotalActivityCount(): number {
    return Array.from(this.activities.values()).reduce(
      (total, activity) => total + activity.activityCount, 
      0
    );
  }
}

// Export singleton instance
export const phaseActivityStore = new PhaseActivityStore();