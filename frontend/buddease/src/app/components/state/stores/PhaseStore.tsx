// PhaseStore.tsx
import { OnboardingPhase } from "@/app/pages/onboarding/OnboardingPhase";
import { makeAutoObservable } from "mobx";
import { useState } from "react";
import SnapshotStore from "./SnapshotStore";

export interface PhaseStore {
  phases: Record<string, OnboardingPhase[]>;
  currentPhase: OnboardingPhase;
  setCurrentPhase: (phase: OnboardingPhase) => void;
  snapshotStore: SnapshotStore<Record<string, OnboardingPhase[]>>;
  takePhaseSnapshot: (phase: OnboardingPhase) => void;
  // Add more methods or properties as needed
}

const usePhaseStore = (): PhaseStore => {
  const [phases, setPhases] = useState<Record<string, OnboardingPhase[]>>({
    // Initialize phases as needed
  });
  const [currentPhase, setCurrentPhase] = useState<OnboardingPhase>(OnboardingPhase.WELCOME);

  // Initialize SnapshotStore
  const snapshotStore = new SnapshotStore<Record<string, OnboardingPhase[]>>({});

  // Method to take a snapshot of the current phase
  const takePhaseSnapshot = (phase: OnboardingPhase) => {
    // Ensure the phase exists in the phases
    if (!phases[phase]) {
      console.error(`Phase ${phase} does not exist.`);
      return;
    }

    // Create a snapshot of the current phases for the specified phase
    const phaseSnapshot = { [phase]: [...phases[phase]] };

    // Store the snapshot in the SnapshotStore
    snapshotStore.takeSnapshot(phaseSnapshot);

    // Use setPhases to update the phases state
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
    snapshotStore,
    takePhaseSnapshot,
    // Add more methods or properties as needed
  };
};

export { usePhaseStore };
