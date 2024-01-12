// useTeamManagement.ts
import { useEffect } from 'react';
import { Team } from '../models/teams/Team'; // Assuming you have a Team model
import { useTeamManagerStore } from '../state/stores/TeamStore'; // Update with your actual store

const useTeamManagement = () => {
  const teamManagerStore = useTeamManagerStore(); // Update with your actual store

  useEffect(() => {
    teamManagerStore.fetchTeamsRequest();

    const fetchTeams = async () => {
      try {
        const response = await fetch('/api/teams'); // Adjust the API endpoint
        const teamsData = await response.json();
        teamManagerStore.fetchTeamsSuccess({ teams: teamsData.teams });
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };

    fetchTeams();
  }, []);

  const addTeam = async (newTeam: Omit<Team, 'id'>) => {
    try {
      const response = await fetch('/api/teams', { // Adjust the API endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTeam),
      });

      if (response.ok) {
        const createdTeam: Team = await response.json();
        teamManagerStore.addTeamSuccess({ team: createdTeam });
      } else {
        console.error('Failed to add team:', response.statusText);
      }
    } catch (error) {
      console.error('Error adding team:', error);
    }
  };

  // Add more methods as needed

  return { teamManagerStore, addTeam };
};

export default useTeamManagement;
