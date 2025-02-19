import { useEffect } from 'react';
import {Team} from '../models/teams/Team';
import { useTeamManagerStore } from '../state/stores/TeamStore';
import { useDispatch } from 'react-redux';
import { AxiosError } from 'axios'; // Assuming Axios is used for API calls
import { handleApiError } from '@/app/api/ApiLogs';
import { TeamActions } from "@/app/components/actions/TeamActions";

const useTeamManagement = () => {
  const dispatch = useDispatch();
  const teamManagerStore = useTeamManagerStore();

  useEffect(() => {
    dispatch(TeamActions.fetchTeamsRequest());

    const fetchTeams = async () => {
      try {
        const response = await fetch('/api/teams');
        const teamsData = await response.json();
        dispatch(TeamActions.fetchTeamsSuccess({ teams: teamsData.teams }));
      } catch (error) {
        const errorMessage = "Failed to fetch teams";
        handleApiError(error as AxiosError<unknown>, errorMessage);
      }
    };

    fetchTeams();
  }, [dispatch]);

  const addNewTeam = async (newTeamData: Omit<Team, 'id'>) => {
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTeamData),
      });

      if (response.ok) {
        const createdTeam: Team = await response.json();
        dispatch(TeamActions.addTeamSuccess({ team: createdTeam }));
      } else {
        const errorMessage = "Failed to add team";
        handleApiError(new Error(await response.text()), errorMessage);
      }
    } catch (error) {
      const errorMessage = "Error adding team";
      handleApiError(error as AxiosError<unknown>, errorMessage);
    }
  };

  return { teamManagerStore, addNewTeam };
};

export default useTeamManagement;
