// PhaseStore.tsx
import { OnboardingPhase } from "@/app/pages/onboarding/OnboardingPhase";
import { makeAutoObservable } from "mobx";
import { useState } from "react";
import { Data } from "../../models/data/Data";
import { Todo } from "../../todos/Todo";
import SnapshotStore, { Snapshot, snapshotStore } from "./SnapshotStore";
import { useNotification } from "@/app/components/support/NotificationContext";
import { UserData } from "../../users/User";
import { VideoData } from "../../video/Video";

export interface PhaseStore {
  phases: Record<string, OnboardingPhase[]>;
  currentPhase: OnboardingPhase;
  setCurrentPhase: (phase: OnboardingPhase) => void;
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
      analysisType: "Phase Snapshot",
      analysisResults: [`Phase Results for ${dynamicConvention}`],
      phase: null,
      videoData: {} as VideoData
    };

    snapshotStore.takeSnapshot(phaseSnapshot);
    setPhases((prevPhases) => ({
      ...prevPhases,
      [phase]: [...phases[phase]],
    }));
  };

  // Add more methods or properties as needed

  makeAutoObservable({
    phases,
    currentPhase,
    setCurrentPhase,
    snapshotStore,
    takePhaseSnapshot,
    // Add more methods or properties as needed
  });

  return {
    phases,
    currentPhase,
    setCurrentPhase,
    takePhaseSnapshot,
    // Add more methods or properties as needed
  };
};

export { usePhaseStore };
