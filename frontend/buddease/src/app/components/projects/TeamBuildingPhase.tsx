// TeamBuildingPhase.tsx
import React, { useEffect } from "react";
import { useTeamBuildingPhase } from "../hooks/phaseHooks/CollaborationPhaseHooks";

interface TeamBuildingPhaseProps {
  startPhase: () => void;
  endPhase: () => void;
}

const TeamBuildingPhase: React.FC<TeamBuildingPhaseProps> = ({
  startPhase,
  endPhase,
}) => {
  const {isActive, toggleActivation} = useTeamBuildingPhase()
  useEffect(() => {
    const initTeamBuildingPhase = async () => {
      try {
        // Add logic to initialize the Team Building Phase

        // Example: Fetch data or perform actions specific to the Team Building Phase
        console.log("Initializing Team Building Phase");

        // Your logic specific to the Team Building Phase
      } catch (error) {
        console.error("Error initializing Team Building Phase:", error);
        // Handle errors or log them as needed
      }
    };

    initTeamBuildingPhase();

    // Return cleanup function
    return () => {
      // Add cleanup logic if needed when the component unmounts or when the phase ends
      console.log("Cleaning up Team Building Phase");
    };
  }, [startPhase, endPhase]);

  return (
    <div>
      {isActive && (
        <div>
          {/* Additional UI components or features specific to the Team Building Phase */}
          <p>Team Building Phase is active!</p>
          {/* Add more UI components as needed */}
        </div>
      )}
    </div>
  );
};

export default TeamBuildingPhase;
