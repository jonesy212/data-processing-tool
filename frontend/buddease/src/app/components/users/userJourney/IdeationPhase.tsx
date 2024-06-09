import { useEffect } from 'react';
import React from "react";

// Example: Idea Phase Hook
const useIdeationPhase = () => {
  useEffect(() => {
    // Add logic for the Idea phase
    console.log('Idea Phase Hook triggered');
    // Perform actions specific to the Idea phase

    return () => {
      // Cleanup logic for the Idea phase
      console.log('Cleanup for Idea Phase Hook');
    };
  }, []);
};


const useIdeaCreationPhase = () => {
  useEffect(() => {
    // Add logic for the Idea Creation phase
    console.log('Idea Creation Phase Hook triggered');
    // Perform actions specific to the Idea Creation phase

    return () => {
      // Cleanup logic for the Idea Creation phase
      console.log('Cleanup for Idea Creation Phase Hook');
    };
  }, []);
};

const IdeationPhase = ({ phaseName, onTransition }: { phaseName: string; onTransition: any }) => {
  // Use the corresponding phase hook based on the phaseName
  switch (phaseName) {
    case 'Idea':
      useIdeationPhase();
      break;
    case 'IdeaCreation':
        useIdeaCreationPhase();
        break
    case 'ConceptDevelopment':
      useIdeationPhase();
      break;
    case 'FurtherConceptDetails':
      // You can add another hook if needed
      break;
      // Add more cases for other phases as needed
      default:
        break;
  }

  return (
    <div>
      <h3>{phaseName} Phase</h3>
      {/* Render content specific to the Idea phase */}
      {phaseName === 'Idea' && (
        <div>
          {/* Add components or content specific to the Idea phase */}
          <p>Content for the Idea phase</p>
        </div>
      )}
      {/* Render content specific to the Idea Creation phase */}
      {phaseName === 'IdeaCreation' && (
        <div>
          {/* Add components or content specific to the Idea Creation phase */}
          <p>Content for the Idea Creation phase</p>
        </div>
      )}
      {/* Render content specific to the Ideation phase */}
      {phaseName === 'ConceptDevelopment' && (
        <div>
          {/* Add components or content specific to the Concept Development sub-phase */}
          <p>Content for the Concept Development sub-phase</p>
        </div>
      )}
      {phaseName === 'FurtherConceptDetails' && (
        <div>
          {/* Add components or content specific to the Further Concept Details sub-phase */}
          <p>Content for the Further Concept Details sub-phase</p>
        </div>
      )}
      {/* Add more conditional rendering for other sub-phases as needed */}
    </div>
  );
};

export default IdeationPhase;

















