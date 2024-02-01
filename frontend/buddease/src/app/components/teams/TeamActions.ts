// TeamActions.tsx
import { createAction } from "@reduxjs/toolkit";
import { Team } from "../models/teams/Team";

export const TeamActions = {
  addTeam: createAction<Team>("addTeam"),
  removeTeam: createAction<number>("removeTeam"),
  updateTeam: createAction<{ id: number; updatedTeam: Partial<Team> }>("updateTeam"),

  fetchTeamRequest: createAction<{ id: number }>("fetchTeamRequest"),
  fetchTeamSuccess: createAction<{ team: Team }>("fetchTeamSuccess"),
  fetchTeamFailure: createAction<{ error: string }>("fetchTeamFailure"),
  updateTeamSuccess: createAction<{ id: number; updatedTeam: Team }>("updateTeamSuccess"),
  updateTeamFailure: createAction<{ error: string }>("updateTeamFailure"),

  //  batch actions
  fetchTeamsRequest: createAction("fetchTeamsRequest"),
  fetchTeamsSuccess: createAction<{ teams: Team[] }>("fetchTeamsSuccess"),
  fetchTeamsFailure: createAction<{ error: string }>("fetchTeamsFailure"),
  
  updatTeamsRequest: createAction<{ updatedTeams: Partial<Team>[] }>("updateTeamsRequest"),
  updateTeamsSuccess: createAction<{ updatedTeams: Team[] }>("updateTeamsSuccess"),
  updateTeamsFailure: createAction<{ error: string }>("updateTeamsFailure"),

  // Add more actions as needed
};
