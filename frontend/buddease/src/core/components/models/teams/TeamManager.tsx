TeamManager.tsx
import { TeamFull, createDefaultTeam } from '@/core/typings/teamTypes';
import React, { useState } from 'react'; // Import useState

Define emptyTeam or import it from teamTypes
const emptyTeam: TeamFull = {
  id: '',
  name: '',
  ownerId: '',
  members: [],
  createdAt: new Date(),
  updatedAt: new Date()
  // Add other required properties from TeamFull type
};

const TeamManager: React.FC = () => {
  const [currentTeam, setCurrentTeam] = useState<TeamFull>(emptyTeam);
  const [teams, setTeams] = useState<TeamFull[]>([]);

  const createNewTeam = (name: string, ownerId: string) => {
    const newTeam = createDefaultTeam({ 
      name, 
      ownerId,
      members: [ownerId]
    });
    setTeams((prev: TeamFull[]) => [...prev, newTeam]); // Type the prev parameter
  };

  // Your component JSX
  return (
    <div>
      {/* Your JSX content here */}
      <h1>Team Manager</h1>
      <div>Current Team: {currentTeam.name}</div>
      <div>Total Teams: {teams.length}</div>
    </div>
  );
};

export default TeamManager;

In API calls (separate utility function)
export const fetchTeam = async (teamId: string): Promise<TeamFull> => {
  const response = await api.get(`/teams/${teamId}`);
  return createDefaultTeam(response.data);
};