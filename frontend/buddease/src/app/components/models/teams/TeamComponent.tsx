// src/components/Teams/TeamComponent.tsx

import teamService from '@/app/services/teamService';
import React, { useEffect, useState } from 'react';
import { Team as BackendTeam } from './Team';

interface TeamComponentProps {
  teamId: string;
}

const TeamComponent: React.FC<TeamComponentProps> = ({ teamId }) => {
  const [loading, setLoading] = useState(false);
  const [team, setTeam] = useState<BackendTeam | null>(null);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);

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
      <h1>{team.teamName}</h1>
      {/* Render other team details as needed */}
    </div>
  );
};

export default TeamComponent;
