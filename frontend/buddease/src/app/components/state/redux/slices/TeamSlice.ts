import { CollaborationPreferences } from "@/app/components/interfaces/settings/CollaborationPreferences";
import TeamData from "@/app/components/models/teams/TeamData";
import { Project } from "@/app/components/projects/Project";
import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "../ReducerGenerator";
import { RootState } from "./RootSlice";

interface TeamManagerState {
  teams: TeamData[]; // Updated to store TeamData objects instead of just team names
  teamName: string;
}

const initialState: TeamManagerState = {
  teams: [],
  teamName: "",
};

export const useTeamManagerSlice = createSlice({
  name: "teamManager",
  initialState,
  reducers: {
    updateTeamName: (state, action: PayloadAction<string>) => {
      state.teamName = action.payload;
    },

    addTeam: (state, action: PayloadAction<TeamData>) => {
      const { teamName } = action.payload;
      if (!teamName?.trim()) {
        console.error("Team name cannot be empty.");
        return;
      }
      if (state.teams.some((team) => team.teamName === teamName)) {
        console.error("Team name already exists.");
        return;
      }
      state.teams.push(action.payload);
      state.teamName = "";
    },

    removeTeam: (state, action: PayloadAction<string>) => {
      const teamIndex = state.teams.findIndex(
        (team) => team.teamName === action.payload
      );
      if (teamIndex !== -1) {
        state.teams.splice(teamIndex, 1);
      } else {
        console.error("Team not found.");
      }
    },

    updateTeamDetails: (
      state,
      action: PayloadAction<WritableDraft<TeamData>>
    ) => {
      const { teamName } = action.payload;
      const teamIndex = state.teams.findIndex(
        (team) => team.teamName === teamName
      );
      if (teamIndex !== -1) {
        state.teams[teamIndex] = action.payload;
      } else {
        console.error("Team not found.");
      }
    },

    updateTeamDescriptions: (state, action: PayloadAction<TeamData>) => {
      const { teamName, description } = action.payload;
      const teamIndex = state.teams.findIndex(
        (team) => team.teamName === teamName
      );
      if (teamIndex !== -1) {
        state.teams[teamIndex].description = description;
      } else {
        console.error("Team not found.");
      }
    },

    getTeamData: (state, action: PayloadAction<TeamData>) => {
      const { teamName } = action.payload;
      const teamData = state.teams.find((team) => team.teamName === teamName);
      console.log(teamData);
    },

    createTeam: (state, action: PayloadAction<TeamData>) => {
      const { teamName } = action.payload;
      const teamData = state.teams.find((team) => team.teamName === teamName);
      console.log(teamData);
    },

    clearTeams: (state) => {
      state.teams = [];
    },

    selectTeam: (state, action: PayloadAction<string>) => {
      const teamIndex = state.teams.findIndex(
        (team) => team.teamName === action.payload
      );
      if (teamIndex !== -1) {
        state.teams[teamIndex].isSelected = true;
      } else {
        console.error("Team not found.");
      }
    },

    reorderTeams: (state, action: PayloadAction<TeamData[]>) => {
      const teams = action.payload;
      state.teams = teams;
    },

    toggleTeamActivation: (state, action: PayloadAction<string>) => {
      const teamIndex = state.teams.findIndex(
        (team) => team.teamName === action.payload
      );
      if (teamIndex !== -1) {
        state.teams[teamIndex].isActive = !state.teams[teamIndex].isActive;
      } else {
        console.error("Team not found.");
      }
    },

    // Assigning and removing members
    assignMemberToTeam: (state, action: PayloadAction<string>) => {
      const teamIndex = state.teams.findIndex(
        (team) => team.teamName === action.payload
      );
      if (teamIndex !== -1) {
        state.teams[teamIndex].isMember = true; // Set member status to true
      } else {
        console.error("Team not found.");
      }
    },

    removeMemberFromTeam: (state, action: PayloadAction<string>) => {
      const teamIndex = state.teams.findIndex(
        (team) => team.teamName === action.payload
      );
      if (teamIndex !== -1) {
        state.teams[teamIndex].isMember = false; // Set member status to false
      } else {
        console.error("Team not found.");
      }
    },

    setTeamLeader: (state, action: PayloadAction<string>) => {
      const teamIndex = state.teams.findIndex(
        (team) => team.teamName === action.payload
      );
      if (teamIndex !== -1) {
        state.teams[teamIndex].isLeader = true; // Set leader status to true
      } else {
        console.error("Team not found.");
      }
    },

    //  Update team project list
    updateTeamProjectList: (
      state,
      action: PayloadAction<{
        teamName: string;
        projects: WritableDraft<Project[]>;
      }>
    ) => {
      const { teamName, projects } = action.payload;
      const teamIndex = state.teams.findIndex(
        (team) => team.teamName === teamName
      );
      if (teamIndex !== -1) {
        state.teams[teamIndex].projects = projects;
      } else {
        console.error("Team not found.");
      }
    },

    // Update team collaboration tools
    updateTeamCollaborationTools: (
      state,
      action: PayloadAction<{
        teamName: string;
        tools: WritableDraft<{
          audio: boolean;
          video: boolean;
          text: boolean;
          realTime: boolean;
        }>;
      }>
    ) => {
      const { teamName, tools } = action.payload;
      const teamIndex = state.teams.findIndex(
        (team) => team.teamName === teamName
      );
      if (teamIndex !== -1) {
        state.teams[teamIndex].collaborationTools = tools;
      } else {
        console.error("Team not found.");
      }
    },

    // Update team global collaboration
    updateTeamGlobalCollaboration: (
      state,
      action: PayloadAction<{ teamName: string; isGlobal: boolean }>
    ) => {
      const { teamName, isGlobal } = action.payload;
      const teamIndex = state.teams.findIndex(
        (team) => team.teamName === teamName
      );
      if (teamIndex !== -1) {
        state.teams[teamIndex].isGlobal = isGlobal;
      } else {
        console.error("Team not found.");
      }
    },

    selectParticipants: (state) => {
      return selectParticipants(state);
    },

    // Update team collaboration preferences
    updateTeamCollaborationPreferences: (
      state,
      action: PayloadAction<{
        teamName: string;
        preferences: WritableDraft<CollaborationPreferences>;
      }>
    ) => {
      const { teamName, preferences } = action.payload;
      const teamIndex = state.teams.findIndex(
        (team) => team.teamName === teamName
      );
      if (teamIndex !== -1) {
        state.teams[teamIndex].collaborationPreferences = preferences;
      } else {
        console.error("Team not found.");
      }
    },
  },
});

// Export actions
export const {
  // Basic team management actions
  updateTeamName,
  addTeam,
  removeTeam,
  updateTeamDetails,
  updateTeamDescriptions,
  getTeamData,
  createTeam,
  selectParticipantData,

  // Advanced team management actions
  clearTeams,
  selectTeam,
  reorderTeams,
  toggleTeamActivation,

  // Team member management actions
  assignMemberToTeam,
  removeMemberFromTeam,
  setTeamLeader: setTeamLeader,
  assignMemberToTeam: assignMember,
  removeMemberFromTeam: removeMember,
  updateTeamProjectList: updateProjects,
  updateTeamCollaborationTools: updateCollaborationTools,
  updateTeamGlobalCollaboration: updateGlobalCollaboration,
  updateTeamCollaborationPreferences: updateCollaborationPreferences,
} = useTeamManagerSlice.actions;

// Export selector for accessing the teams from the state
export const selectTeams = (state: { teams: TeamManagerState }) =>
  state.teams.teams;


export const selectParticipantData = (state: RootState) =>
  state.collaborationManager.participantData;


// Example selector using createSelector
export const selectParticipants = createSelector(
  selectParticipantData,
  (participantData) => participantData
);
// Export reducer for the team entity slice
export default useTeamManagerSlice.reducer;




