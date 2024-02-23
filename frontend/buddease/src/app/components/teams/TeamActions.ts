// TeamActions.tsx
import { createAction } from "@reduxjs/toolkit";
import { Team } from "../models/teams/Team";

export const TeamActions = {
  addTeam: createAction<Team>("addTeam"),
  addTeamSuccess: createAction<{ team: Team }>("addTeamSuccess"),
  addTeamFailure: createAction<{ error: string }>("addTeamFailure"),

  removeTeamSuccess: createAction<number>("removeTeamSuccess"),
  removeTeamFailureremoveTeamFailure: createAction<{ error: string }>("removeTeamFailure"),
  removeTeamFailure: createAction<{ error: string }>("removeTeamFailure"),
  removeTeam: createAction<number>("removeTeam"),
  updateTeam: createAction<{ id: number; updatedTeam: Partial<Team> }>("updateTeam"),

  fetchTeamRequest: createAction<{ id: number }>("fetchTeamRequest"),
  fetchTeamSuccess: createAction<{ team: Team }>("fetchTeamSuccess"),
  fetchTeamFailure: createAction<{ error: string }>("fetchTeamFailure"),
  
  updateTeams: createAction<{teams: Team[], updatedTeams: Partial<Team>[] }>("updateTeams"),
  updateTeamRequest: createAction<{ id: number; updatedTeam: Partial<Team> }>("updateTeamRequest"),
  updateTeamSuccess: createAction<{ teamId: number; updatedTeam: Team }>("updateTeamSuccess"),
  updateTeamFailure: createAction<{ error: string }>("updateTeamFailure"),

  //  batch actions
  fetchTeamsRequest: createAction("fetchTeamsRequest"),
  fetchTeamsSuccess: createAction<{ teams: Team[] }>("fetchTeamsSuccess"),
  fetchTeamsFailure: createAction<{ error: string }>("fetchTeamsFailure"),
  
  updateTeamsRequest: createAction<{ updatedTeams: Partial<Team>[] }>("updateTeamsRequest"),
  updateTeamsSuccess: createAction<{ updatedTeams: Team[] }>("updateTeamsSuccess"),
  updateTeamsFailure: createAction<{ error: string }>("updateTeamsFailure"),

  // Add more actions as needed
};
