import React, { useState } from 'react';
import RandomWalkVisualization from '../../hooks/userInterface/RandomWalkVisualization';
import { CollaborationPreferences } from '../../interfaces/settings/CollaborationPreferences';
import TeamData from './TeamData';

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
      realTime: false,
    },
    globalCollaboration: {
      isEnabled: false,
      communicationChannels: [],
      collaborationPlatforms: [],
    },
    collaborationPreferences: {} as CollaborationPreferences, // Initialize with empty collaboration preferences
  });

  // Function to update teamData with the generated random walk
  const updateTeamDataWithRandomWalk = (randomWalk: number[]) => {
    setTeamData((prevTeamData) => {
      return {
        ...prevTeamData,
        collaborationPreferences: {
          ...prevTeamData.collaborationPreferences,
          randomWalk,
        },
      };
    });
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
