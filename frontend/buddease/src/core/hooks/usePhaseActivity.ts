usePhaseActivity.ts
import { syncActivities } from "@/core/state/redux/slices/phaseActivitySlice";
import { phaseActivityStore } from "@/core/state/stores/PhaseActivityStore";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export const usePhaseActivity = () => {
  const dispatch = useDispatch();

  // Sync MobX store with Redux on mount and changes
  useEffect(() => {
    // Initial sync
    dispatch(syncActivities(phaseActivityStore.activities));

    // Set up reaction to sync when MobX store changes
    const disposeReaction = phaseActivityStore.autorun(() => {
      dispatch(syncActivities(phaseActivityStore.activities));
    });

    return () => {
      disposeReaction();
    };
  }, [dispatch]);

  // Return MobX store methods with Redux integration
  return {
    // MobX store methods
    getLastActivityTime: phaseActivityStore.getLastActivityTime.bind(phaseActivityStore),
    recordActivity: phaseActivityStore.recordActivity.bind(phaseActivityStore),
    getPhaseStats: phaseActivityStore.getPhaseStats.bind(phaseActivityStore),
    clearActivities: phaseActivityStore.clearActivities.bind(phaseActivityStore),
    getPhaseNames: phaseActivityStore.getPhaseNames.bind(phaseActivityStore),
    getTotalActivityCount: phaseActivityStore.getTotalActivityCount.bind(phaseActivityStore),
    
    // Direct store access
    store: phaseActivityStore
  };
};

// Standalone function for use outside components
export const getLastActivityTimeForPhase = (phaseName: string): number => {
  return phaseActivityStore.getLastActivityTime(phaseName);
};

export const recordPhaseActivity = (phaseName: string): void => {
  phaseActivityStore.recordActivity(phaseName);
};