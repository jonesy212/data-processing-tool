import React, { useState } from 'react';
import RandomWalkVisualization from './RandomWalkVisualization';
import { TeamData } from './TeamData'; // Assuming the location of TeamData file

const TeamManagementApp: React.FC = () => {
  const [teamData, setTeamData] = useState<TeamData>({
    // Initialize teamData object with default values
    id: 1,
    teamName: "Development Team",
    description: "A team focused on software development",
    members: [],
    projects: [],
    creationDate: new Date(),
    isActive: true,
    leader: null,
    progress: null,
    collaborationTools: {
      audio: false,
      video: false,
      text: false,
      realTime: false
    },
    globalCollaboration: {
      isEnabled: false,
      communicationChannels: [],
      collaborationPlatforms: []
    },
    collaborationPreferences: {} // Initialize with empty collaboration preferences
  });

  // Function to update teamData with the generated random walk
  const updateTeamDataWithRandomWalk = (randomWalk: number[]) => {
    setTeamData(prevTeamData => ({
      ...prevTeamData,
      collaborationPreferences: {
        ...prevTeamData.collaborationPreferences,
        randomWalk: randomWalk // Assuming randomWalk is a property in CollaborationPreferences
      }
    }));
  };

  return (
    <div>
      {/* Team management app UI */}
      <h1>Team Management Application</h1>
      <RandomWalkVisualization updateTeamData={updateTeamDataWithRandomWalk} />
    </div>
  );
};

export default TeamManagementApp;
