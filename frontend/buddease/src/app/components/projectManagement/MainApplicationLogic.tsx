// MainApplicationLogic.tsx
import React, { useEffect, useState } from 'react';
import projectPhaseService from './ProjectPhaseService.ts';

const MainApplicationLogic: React.FC = () => {
  const [projectPhase, setProjectPhase] = useState<string>('');

  useEffect(() => {
    const fetchProjectPhase = async () => {
      try {
        const phase = await projectPhaseService.fetchProjectPhaseFromBackend();
        setProjectPhase(phase);
      } catch (error) {
        console.error('Error fetching project phase:', error);
      }
    };

    // Fetch project phase on component mount
    fetchProjectPhase();

    // Optionally, set up periodic or event-triggered updates

    // Cleanup on component unmount
    return () => {
      // Cleanup logic if needed
    };
  }, []); // Empty dependency array to run the effect only once on mount

  // Render UI based on the project phase
  return (
    <div>
      <h1>Project Phase: {projectPhase}</h1>
      {/* Render other components based on the project phase */}
    </div>
  );
};

export default MainApplicationLogic;
