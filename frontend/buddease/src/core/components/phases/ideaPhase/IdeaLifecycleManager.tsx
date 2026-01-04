IdeaLifecycleManager.tsx
import { IdeaLifecyclePhase } from '@/core/models/phases/PhaseManager';
import ConceptDevelopment from '@/core/users/userJourney/ConceptDevelopment';
import IdeaValidation from '@/core/users/userJourney/IdeaValidation';
import ProofOfConcept from '@/core/users/userJourney/ProofOfConcept';
import React, { useState } from 'react';


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
