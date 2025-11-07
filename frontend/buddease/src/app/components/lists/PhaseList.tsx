import { observer } from "mobx-react-lite";
import React from "react";
import { Phase } from '@/app/models/phases/Phase';

/**
 * PhaseList Component
 * 
 * Responsibilities:
 * - Renders a list of project phases.
 * - Separates rendering logic for clarity and future enhancements.
 * - Provides a reusable component for displaying phases in dashboards or project views.
 * 
 * Integration:
 * - Can integrate with MobX store by passing phases as props (fallbacks can be added if needed).
 * - Observer pattern ensures reactive updates if phases are from a MobX observable array.
 */

interface PhaseListProps {
  phases?: Phase[]; // Optional: allows fallback to store or other source
}

const PhaseList: React.FC<PhaseListProps> = observer(({ phases = [] }) => {
  if (phases.length === 0) return <p>No phases available.</p>;

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
});

export default PhaseList;

/**
 * Usage Notes:
 * - Can accept optional phases prop; fallback to MobX store can be implemented if phases are observable.
 * - Observer ensures reactive rendering for future integration with MobX stores.
 * - Matches TaskList and ProjectList patterns for consistent component structure.
 */
