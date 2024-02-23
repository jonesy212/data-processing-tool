// TeamSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TeamManagerState {
  teams: string[]; // Assuming teams are identified by their names
  teamName: string;
}

const initialState: TeamManagerState = {
  teams: [],
  teamName: '',
};

export const useTeamManagerSlice = createSlice({
  name: 'teamManager',
  initialState,
  reducers: {
    updateTeamName: (state, action: PayloadAction<string>) => {
      state.teamName = action.payload;
    },

    addTeam: (state) => {
      const { teamName } = state;

      if (teamName.trim() === '') {
        console.error('Team name cannot be empty.');
        return;
      }

      state.teams.push(teamName);
      state.teamName = '';
    },

    removeTeam: (state, action: PayloadAction<string>) => {
      state.teams = state.teams.filter((team) => team !== action.payload);
    },
  },
});

// Export actions
export const { updateTeamName, addTeam, removeTeam } = useTeamManagerSlice.actions;

// Export selector for accessing the teams from the state
export const selectTeams = (state: { teams: TeamManagerState }) => state.teams.teams;

// Export reducer for the team entity slice
export default useTeamManagerSlice.reducer;
