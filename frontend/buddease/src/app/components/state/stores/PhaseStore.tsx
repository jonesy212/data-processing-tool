// PhaseStore.tsx
import { useNotification } from "@/app/components/support/NotificationContext";
import { makeAutoObservable } from "mobx";
import { useState } from "react";
import { Data } from "../../models/data/Data";
import { snapshotStore } from "../../snapshots/SnapshotStore";
import { VideoData } from "../../video/Video";
import { OnboardingPhase } from "@/app/pages/personas/UserJourneyManager";
import { AnalysisTypeEnum } from "../../projects/DataAnalysisPhase/AnalysisType";

export interface PhaseStore {
  phases: Record<string, OnboardingPhase[]>;
  currentPhase: OnboardingPhase;
  lastActivityTimes: Record<string, number>;
  setCurrentPhase: (phase: OnboardingPhase) => void;
  updateLastActivityTime: (phase: string) => void;
  getLastActivityTime: (phase: string) => number;
  takePhaseSnapshot: (phase: OnboardingPhase) => void;
  // Add more methods or properties as needed
}

const { notify } = useNotification(); // Destructure notify from useNotification

const usePhaseStore = (): PhaseStore => {
  const [phases, setPhases] = useState<Record<string, OnboardingPhase[]>>({
    // Initialize phases as needed
  });
  const [currentPhase, setCurrentPhase] = useState<OnboardingPhase>(
    OnboardingPhase.WELCOME
  );
  const [lastActivityTimes, setLastActivityTimes] = useState<Record<string, number>>({});

  // Method to set the current phase and update the activity time
  const handleSetCurrentPhase = (phase: OnboardingPhase) => {
    setCurrentPhase(phase);
    updateLastActivityTime(phase);
  };

  // Method to update the last activity time for a given phase
  const updateLastActivityTime = (phase: string) => {
    setLastActivityTimes((prevTimes) => ({
      ...prevTimes,
      [phase]: new Date().getTime(),
    }));
  };

  // Method to get the last activity time for a given phase
  const getLastActivityTime = (phase: string): number => {
    return lastActivityTimes[phase] || 0;
  };

  // Method to take a snapshot of the current phase
  const takePhaseSnapshot = (phase: OnboardingPhase) => {
    if (!phases[phase]) {
      console.error(`Phase ${phase} does not exist.`);
      return;
    }

    const dynamicConvention = `Dynamic Convention ${Math.floor(
      Math.random() * 100
    )}`;
    const phaseSnapshot: Data = {
      _id: `snapshotId-${dynamicConvention}`,
      id: `snapshotId-${dynamicConvention}`,
      title: `Snapshot for ${phase} (${dynamicConvention})`,
      status: "pending",
      isActive: true,
      tags: [],
      then: () => { },
      [phase]: [...phases[phase]],
      analysisType: AnalysisTypeEnum.SNAPSHOT,
      analysisResults: [`Phase Results for ${dynamicConvention}`],
      phase: null,
      videoData: {} as VideoData,
    };

    snapshotStore.takeSnapshot(phaseSnapshot);
    setPhases((prevPhases) => ({
      ...prevPhases,
      [phase]: [...phases[phase]],
    }));
  };

  makeAutoObservable({
    phases,
    currentPhase,
    lastActivityTimes,
    setCurrentPhase: handleSetCurrentPhase,
    updateLastActivityTime,
    getLastActivityTime,
    takePhaseSnapshot,
    // Add more methods or properties as needed
  });

  return {
    phases,
    currentPhase,
    lastActivityTimes,
    setCurrentPhase: handleSetCurrentPhase,
    updateLastActivityTime,
    getLastActivityTime,
    takePhaseSnapshot,
    // Add more methods or properties as needed
  };
};

export { usePhaseStore };
