import { allLifecyclePhases } from '@/app/components/phases/lifecycles';
import React from 'react';

const IdeaLifecycleComponent: React.FC = () => {
  return (
    <div>
      <h2>All Phases</h2>
      {allLifecyclePhases.map((phase) => (
        <div key={phase.name}>
          <h3>{phase.name}</h3>
          <p>Start Date: {phase.startDate.toDateString()}</p>
          <p>End Date: {phase.endDate.toDateString()}</p>
          {/* Render other phase details as needed */}
        </div>
      ))}
    </div>
  );
};

export default IdeaLifecycleComponent;
