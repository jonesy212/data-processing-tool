// PhaseStore.tsx
import { OnboardingPhase } from "@/app/pages/onboarding/OnboardingPhase";
import { makeAutoObservable } from "mobx";
import { useState } from "react";
import { Data } from "../../models/data/Data";
import { Todo } from "../../todos/Todo";
import SnapshotStore from "./SnapshotStore";
import { useNotification } from "@/app/components/support/NotificationContext";
import { UserData } from "../../users/User";

export interface PhaseStore {
  phases: Record<string, OnboardingPhase[]>;
  currentPhase: OnboardingPhase;
  setCurrentPhase: (phase: OnboardingPhase) => void;
  snapshotStore: SnapshotStore<Data | UserData>; // Type annotation added
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

  // Initialize SnapshotStore with type annotation
  const snapshotStore: SnapshotStore<Data | UserData> =
    new SnapshotStore({
      // Initialize snapshot store as needed
      initSnapshot: () => {
        return;
      },
      updateSnapshot: () => {},
      key: "",
      initialState: {} as Data | UserData, // Corrected the initial state type
      takeSnapshot: (data: Data | UserData) => { 
        snapshotStore.takeSnapshot(data);
      },
      getSnapshots: (data: Record<string, Data | UserData>) => {
        snapshotStore.getSnapshots(data);
      },
      clearSnapshot: {} as () => void,
      [Symbol.iterator]: function* (
        snapshot: string[]
      ): IterableIterator<[string, Data[]]> {
        const snapshots = snapshotStore.getSnapshots(snapshot);
        for (const snap of snapshots) {
          const dataItems: Data = Array.isArray(snap.data)
            ? snap.data[0]
            : snap.data; // Ensure snap.data is always an array of Data
          yield [snap.timestamp.toString(), [dataItems]]; // Wrap dataItems in an array to match the type Data[]
        }
      },
    });

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
      then: () => {},
      [phase]: [...phases[phase]],
      analysisType: "Phase Snapshot",
      analysisResults: [`Phase Results for ${dynamicConvention}`],
      // Add other properties as needed for Data
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
    snapshotStore,
    takePhaseSnapshot,
    // Add more methods or properties as needed
  };
};

export { usePhaseStore };
