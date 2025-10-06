// components/PhaseList.tsx
import { Phase } from '@/phases/Phase';
import React from 'react';

interface PhaseListProps {
  phases: Phase[];
}

const PhaseList: React.FC<PhaseListProps> = ({ phases }) => {
  return (
    <div>
      <h2>Phase List</h2>
      <ul>
        {phases.map((phase: Phase) => (
          <li key={phase.name}>
            {phase.name} - {phase.startDate.toDateString()} to {phase.endDate.toDateString()}
            {/* Display other phase properties if needed */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PhaseList;
