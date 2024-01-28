import React from 'react';
import { lifecyclePhases } from './path-to-phases-file';  // Update with the correct path

const IdeaLifecycleComponent: React.FC = () => {
  // Render Idea Lifecycle phases
  return (
    <div>
      <h2>Idea Lifecycle Phases</h2>
      {lifecyclePhases.map((phase) => (
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
