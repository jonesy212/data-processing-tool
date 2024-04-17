// IdeaCreationPhase.tsx
import React from 'react';
import { setCurrentPhase } from '../../hooks/phaseHooks/EnhancePhase';
import { Idea } from '../Ideas';
import { IdeaCreationPhase } from '@/app/components/users/userJourney/IdeaCreationPhase';

export enum IdeaCreationPhaseEnum {
  CREATE_IDEA,
  REVIEW_IDEA,
  SUGGESTIONS,

}
interface IdeaFormProps {
  onSubmit: (idea: any) => void;
  onTransition: (idea: any) => void;
}


const handlePhaseTransition = (nextPhase: IdeaCreationPhase) => {
  // Add logic for transitioning to the next phase
  setCurrentPhase(nextPhase);
};
const IdeaCreationPhaseManager: React.FC<IdeaFormProps> = ({
  onSubmit,
  onTransition
}) => {
  // Implementation logic for Idea Creation phase
  return (
    <div>
      <h3>Idea Creation Phase</h3>
      {/* Add components or content specific to the Idea Creation phase */}
      <p>Content for the Idea Creation phase</p>
    </div>
  );
};

export default IdeaCreationPhaseManager;
