// IdeationPhaseComponent.tsx
import React from 'react';

interface IdeationPhaseComponentProps {
  phaseName: string;
  phaseDescription: string;
  onPhaseComplete: () => void;
}

const IdeationPhaseComponent: React.FC<IdeationPhaseComponentProps> = ({
  phaseName,
  phaseDescription,
  onPhaseComplete
}) => {
  return (
    <div>
      <h2>{phaseName}</h2>
      <p>{phaseDescription}</p>
      <button onClick={onPhaseComplete}>Complete Phase</button>
    </div>
  );
};

export default IdeationPhaseComponent;
