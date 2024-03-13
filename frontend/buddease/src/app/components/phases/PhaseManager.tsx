import React, { useState } from "react";
import Stopwatch from "../calendar/Stopwatch";
import useAsyncHookLinker from "../hooks/useAsyncHookLinker";
import { Phase } from "./Phase";
// Function to get a phase component based on the selected phase name
function getPhaseComponent(selectedPhaseName: string): React.FC | undefined {
  const selectedPhase = genericLifecyclePhases.find(
    (phase) => phase.name === selectedPhaseName
  );
  return selectedPhase?.component;
}

// Reusable PhaseManager component
const PhaseManager: React.FC<{ phases: Phase[] }> = ({ phases }) => {
  const [currentPhase, setCurrentPhase] = useState<Phase | null>(null);




  const createPhases = () => {
    // Logic to create phases...
  
    // Example: Create an array of phase objects
    const newPhases: Phase[] = [
      {
        name: "Phase 1",
        startDate: new Date(),
        endDate: new Date(),
        component: () => <div>Phase 1 Component</div>,
        subPhases: [],
        hooks: {
          canTransitionTo: () => true,
          handleTransitionTo: () => {},
          resetIdleTimeout: () => Promise.resolve(),
          isActive: false,
        },
        duration: 1000,
        lessons: [],
      },
      {
        name: "Phase 2",
        startDate: new Date(),
        endDate: new Date(),
        component: () => <div>Phase 2 Component</div>,
        subPhases: [],
        hooks: {
          canTransitionTo: () => true,
          handleTransitionTo: () => {},
          resetIdleTimeout: () => Promise.resolve(),
          isActive: false,
        },
        duration: 1500,
        lessons: [],
      },
      // Add more phase objects as needed
    ];
  
    return newPhases;
  };
  



  const linker = useAsyncHookLinker({
    hooks: phases.map((phase) => ({
      ...phase.hooks,
      enable: () => {},
      disable: () => {},
      condition: () => {
        if (phase.hooks) {
          return phase.hooks.condition();
        }
        return currentPhase?.name === phase.name;
      },
      asyncEffect: async () => {
        console.log("Phase condition met");
        setCurrentPhase(phase);

        // Define cleanup logic
        const cleanup = () => {
          // Reset state
          setCurrentPhase(null);

          // Clear any timers or intervals if needed
          clearInterval(timer);
        };

        // Set up a timer as an example
        const timer = setInterval(() => {
          // Timer logic
        }, 1000);

        return cleanup; // Return the cleanup function
      },
      idleTimeoutId: null, // Add idleTimeoutId property
      startIdleTimeout: () => {}, // Add startIdleTimeout property
    })),
  });

  // Define a function to handle moving to the next hook
  const moveToNextHook = () => {
    linker.moveToNextHook();
  };

  const moveToPreviousHook = () => {
    linker.moveToPreviousHook(); // Assuming useAsyncHookLinker provides a moveToPreviousHook function
  };

  const CurrentPhaseComponent = currentPhase?.name
    ? getPhaseComponent(currentPhase?.name)
    : undefined;

  return (
    <div>
      Phase Manager
      <button onClick={moveToNextHook}>Move to Next Hook</button>
      <button onClick={moveToPreviousHook}>Move to Previous Hook</button>{" "}
      {/* Add this button */}
      <Stopwatch
        startDate={currentPhase?.startDate}
        endDate={currentPhase?.endDate}
      />{" "}
      {/* Include the Stopwatch component */}
      {CurrentPhaseComponent && <CurrentPhaseComponent />}{" "}
      {/* Render the current phase component */}
    </div>
  );
};

// Specific phase components
export const IdeaLifecyclePhase: React.FC = () => {
  // Implement the Idea Lifecycle phase component
  return <div>Idea Lifecycle Phase</div>;
};

// Define an array of phases
const genericLifecyclePhases: Phase[] = [
  {
    name: "Idea Lifecycle",
    startDate: new Date(),
    endDate: new Date(),
    component: () => <IdeaLifecyclePhase />,
    subPhases: [],
    hooks: {
      canTransitionTo: () => true,
      handleTransitionTo: () => {},
      resetIdleTimeout: function (): Promise<void> {
        this.resetIdleTimeout();
        return Promise.resolve();
      },
      isActive: false,
    },
    duration: 1000,
    lessons: ([] = []),
  },
  // Add more generic phases as needed
];

// Add more specific phase components as needed

export default PhaseManager;
