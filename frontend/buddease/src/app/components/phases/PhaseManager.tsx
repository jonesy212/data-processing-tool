import React, { useState } from 'react';
import useAsyncHookLinker from '../hooks/useAsyncHookLinker';
import { Phase } from './ideaPhase/Phase';

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

  const linker = useAsyncHookLinker({
    hooks: phases.map((phase) => ({
      ...phase.hooks,
      condition: () => phase.hooks.canTransitionTo("canTransitionTo"),
      asyncEffect: async () => {
        await phase.hooks.handleTransitionTo("handleTransitionTo");
      },
    })),
  });

  const handlePhaseTransition = (
    event: React.MouseEvent<HTMLButtonElement>,
    nextPhase: Phase
  ) => {
    if (currentPhase) {
      linker.moveToNextHook();

      // Determine the next phase
      const nextPhaseIndex = phases.findIndex((phase) => phase === nextPhase);
      const hasNextPhase =
        nextPhaseIndex !== -1 && nextPhaseIndex < phases.length - 1;

      // Add type guard to handle null case
      if (hasNextPhase) {
        setCurrentPhase(phases[nextPhaseIndex + 1]);
      } else {
        console.warn(`No next phase after ${currentPhase?.name}`);
      }
    }
  };

  return (
    <div>
      {currentPhase &&
        getPhaseComponent(currentPhase.name) &&
        React.createElement(getPhaseComponent(currentPhase.name)!)}

      <button
        onClick={(event) =>
          currentPhase && handlePhaseTransition(event, currentPhase)
        }
      >
        Next Phase
      </button>
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
    name: 'Idea Lifecycle',
    startDate: new Date,
    endDate: new Date,
    component: () => <IdeaLifecyclePhase />,
    subPhases: [],
    hooks: {
      canTransitionTo: () => true,
      handleTransitionTo: () => {},
    },
  },
  // Add more generic phases as needed
];

// Add more specific phase components as needed

export default PhaseManager;
