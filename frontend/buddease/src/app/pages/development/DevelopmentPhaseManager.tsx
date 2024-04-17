// DevelopmentPhaseManager.tsx
import { DevelopementPhaseEnum } from '@/app/components/models/data/StatusType';
import { useState } from 'react';

const DevelopmentPhaseManager = () => {
  // State to track the current phase
  const [currentPhase, setCurrentPhase] = useState('Planning');

  // Function to handle phase change
  const handlePhaseChange = (phase:DevelopementPhaseEnum) => {
    setCurrentPhase(phase);
  };

  // Render different components based on the current phase
  return (
    <div>
      <h1>Development Phase Manager</h1>
      <p>Current Phase: {currentPhase}</p>
      <p>Current Phase: {currentPhase}</p>
      <button onClick={() => handlePhaseChange(DevelopementPhaseEnum.Planning)}>Planning Phase</button>
      <button onClick={() => handlePhaseChange(DevelopementPhaseEnum.Development)}>Development Phase</button>
      <button onClick={() => handlePhaseChange(DevelopementPhaseEnum.Testing)}>Testing Phase</button>
      <button onClick={() => handlePhaseChange(DevelopementPhaseEnum.Deployment)}>Deployment Phase</button>
 </div>
  );
};

export default DevelopmentPhaseManager;
