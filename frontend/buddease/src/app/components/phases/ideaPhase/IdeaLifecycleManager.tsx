// IdeaLifecycleManager.tsx
import React, { useState } from 'react';
import ConceptDevelopment from '../../users/userJourney/ConceptDevelopment';
import IdeaValidation from '../../users/userJourney/IdeaValidation';
import ProofOfConcept from '../../users/userJourney/ProofOfConcept';
import { IdeaLifecyclePhase } from './IdeaLifecyclePhase';


const IdeaLifecycleManager: React.FC = () => {
  const [currentPhase, setCurrentPhase] = useState<IdeaLifecyclePhase>(IdeaLifecyclePhase.CONCEPT_DEVELOPMENT);

  const handlePhaseTransition = (nextPhase: IdeaLifecyclePhase) => {
    // Add logic for transitioning to the next phase
    setCurrentPhase(nextPhase);
  };

  return (
    <div>
      {currentPhase === IdeaLifecyclePhase.CONCEPT_DEVELOPMENT && <ConceptDevelopment />}
      {currentPhase === IdeaLifecyclePhase.IDEA_VALIDATION && <IdeaValidation />}
      {currentPhase === IdeaLifecyclePhase.PROOF_OF_CONCEPT && <ProofOfConcept />}
      {/* Add more phases as needed */}
    </div>
  );
};

export default IdeaLifecycleManager;
