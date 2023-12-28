// src/components/Teams/TeamComponent.tsx

import teamService from '@/app/services/teamService';
import React, { useEffect, useState } from 'react';
import { Team } from './Team';
 
interface TeamComponentProps {
  teamId: string;
}

const TeamComponent: React.FC<TeamComponentProps> = ({ teamId }) => {
  const [loading, setLoading] = useState(false);
  const [team, setTeam] = useState<Team | null>(null); // Use the 'Team' interface for strong typing

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);

        // Fetch team data using the service method
        const fetchedTeam = await teamService.getTeamById(teamId);

        setTeam(fetchedTeam);
      } catch (error) {
        console.error('Error fetching team data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [teamId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!team) {
    return <div>Team not found.</div>;
  }

  return (
    <div>
      <h1>{team.name}</h1>
      {/* Render other team details as needed */}
    </div>
  );
};

export default TeamComponent;
