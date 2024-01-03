import React, { useState } from 'react';
import useAsyncHookLinker from '../hooks/useAsyncHookLinker';
import { Phase } from './Phase';
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
      enable: () => {},
      disable: () => {},
      condition: () => {
        if (phase.hooks) { 
          return phase.hooks.condition();
        }
        return currentPhase?.name === phase.name;
      },
      asyncEffect: async () => {
        console.log('Phase condition met');
        
        setCurrentPhase(phase);

      },
    })
    ),
  });

  return <div>Phase Manager</div>;

  // Rest of component
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
