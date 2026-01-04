PhaseActivity.ts
Activity tracking utility for phases
const ACTIVITY_STORAGE_KEY = 'phase-activity-tracker';

interface PhaseActivity {
  phaseName: string;
  lastActivityTime: number;
  activityCount: number;
}

export const getLastActivityTimeForPhase = (phaseName: string): number => {
  try {
    const storedData = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    const activities: PhaseActivity[] = storedData ? JSON.parse(storedData) : [];
    
    const phaseActivity = activities.find(activity => activity.phaseName === phaseName);
    
    if (phaseActivity) {
      return phaseActivity.lastActivityTime;
    }
    
    // If no activity found, return current time (phase just started)
    const currentTime = new Date().getTime();
    updatePhaseActivity(phaseName, currentTime);
    return currentTime;
    
  } catch (error) {
    console.error('Error reading phase activity:', error);
    return new Date().getTime(); // Fallback to current time
  }
};

Helper function to update phase activity
export const updatePhaseActivity = (phaseName: string, timestamp?: number): void => {
  try {
    const storedData = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    const activities: PhaseActivity[] = storedData ? JSON.parse(storedData) : [];
    
    const currentTime = timestamp || new Date().getTime();
    const existingIndex = activities.findIndex(activity => activity.phaseName === phaseName);
    
    if (existingIndex >= 0) {
      activities[existingIndex] = {
        ...activities[existingIndex],
        lastActivityTime: currentTime,
        activityCount: activities[existingIndex].activityCount + 1
      };
    } else {
      activities.push({
        phaseName,
        lastActivityTime: currentTime,
        activityCount: 1
      });
    }
    
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activities));
  } catch (error) {
    console.error('Error updating phase activity:', error);
  }
};

Function to record activity (call this whenever phase activity occurs)
export const recordPhaseActivity = (phaseName: string): void => {
  updatePhaseActivity(phaseName);
};