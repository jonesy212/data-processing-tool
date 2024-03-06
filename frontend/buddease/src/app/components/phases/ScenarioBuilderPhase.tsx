// ScenarioBuilderPhase.tsx
import React, { useEffect } from 'react';
import { useTeamBuildingPhase } from '../hooks/phaseHooks/CollaborationPhaseHooks';
import TeamBuildingPhase from '../projects/TeamBuildingPhase';

interface ScenarioBuilderPhaseProps {
  startPhase: () => void;
  endPhase: () => void;
}

const ScenarioBuilderPhase: React.FC<ScenarioBuilderPhaseProps> = ({
  startPhase,
  endPhase,
}) => {
  const { phases, setCurrentPhase, takePhaseSnapshot } = usePhaseStore();
  const { isActive } = useTeamBuildingPhase();

  useEffect(() => {
    const initScenarioBuilderPhase = async () => {
      try {
        // Initialize the Scenario Builder Phase

        // Example: Fetch data or perform actions specific to the Scenario Builder Phase
        console.log('Initializing Scenario Builder Phase');

        // Your logic specific to the Scenario Builder Phase
      } catch (error) {
        console.error('Error initializing Scenario Builder Phase:', error);
        // Handle errors or log them as needed
      }
    };

    initScenarioBuilderPhase();

    // Return cleanup function
    return () => {
      // Add cleanup logic if needed when the component unmounts or when the phase ends
      console.log('Cleaning up Scenario Builder Phase');
    };
  }, [startPhase, endPhase]);

  const handleSnapshot = () => {
    // Take a snapshot of the current phase
    takePhaseSnapshot(phases[currentPhase]);
  };

  return (
    <div>
      {isActive && (
        <div>
          <h2>Scenario Builder Phase</h2>
          {/* Render additional UI components or features specific to the Scenario Builder Phase */}
          <button onClick={handleSnapshot}>Take Snapshot</button>
          {/* Add more UI components as needed */}
        </div>
      )}
      {/* Render TeamBuildingPhase component */}
      <TeamBuildingPhase startPhase={startPhase} endPhase={endPhase} />
    </div>
  );
};

export default ScenarioBuilderPhase;
