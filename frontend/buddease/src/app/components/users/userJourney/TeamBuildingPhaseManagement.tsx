// TeamBuildingPhase.tsx
import React, { useState } from 'react';
import ConceptValidation from './ConceptValidation';
import RequirementsGathering from './RequirementsGathering';

export enum TeamBuildingPhase {
  REQUIREMENTS_GATHERING,
  CONCEPT_VALIDATION,
}

const TeamBuildingManager: React.FC = () => {
  const [currentPhase, setCurrentPhase] = useState<TeamBuildingPhase>(TeamBuildingPhase.REQUIREMENTS_GATHERING);

  const handlePhaseTransition = (nextPhase: TeamBuildingPhase) => {
    // Add logic for transitioning to the next phase
    setCurrentPhase(nextPhase);
  };

  return (
    <div>
      {currentPhase === TeamBuildingPhase.REQUIREMENTS_GATHERING && <RequirementsGathering />}
      {currentPhase === TeamBuildingPhase.CONCEPT_VALIDATION && <ConceptValidation />}
      {/* Add more phases as needed */}
    </div>
  );
};

export default TeamBuildingManager;
