// TeamActions.ts

import { createAction } from "@reduxjs/toolkit";
import { Team } from "../models/teams/Team";
import { Member } from "../models/teams/TeamMembers";

export const TeamActions = {
  // Standard actions
  addTeam: createAction<Team>("addTeam"),
  addTeamSuccess: createAction<{ team: Team }>("addTeamSuccess"),
  removeTeam: createAction<number>("removeTeam"),
  updateTeam: createAction<{ teamId: number, team: Team, newName?: string }>("updateTeam"), // Adjusted
  validateTeam: createAction<Team>("validateTeam"),
  createTeam: createAction<Team>("createTeam"),
  fetchTeamsRequest: createAction("fetchTeamsRequest"),
  fetchTeamsByMemberId: createAction<{
    memberId: string,
    teams: string[],
  }>("fetchTeamsByMemberId"),
  fetchTeamsSuccess: createAction<{ teams: Team[] }>("fetchTeamsSuccess"),
  fetchTeamsFailure: createAction<{ error: string }>("fetchTeamsFailure"),
  fetchApiDataSuccess: createAction<{ data: Team[] }>("fetchApiDataSuccess"),
  // Additional actions for updating teams
  updateTeamSuccess: createAction<{ team: Team }>("updateTeamSuccess"),
  updateTeamsSuccess: createAction<{ teams: Team[] }>("updateTeamsSuccess"),
  updateTeamFailure: createAction<{ error: string }>("updateTeamFailure"),
  
  // Additional actions for removing teams
  removeTeamSuccess: createAction<number>("removeTeamSuccess"),
  removeTeamsSuccess: createAction<{ teams: Team[] }>("removeTeamsSuccess"),
  removeTeamFailure: createAction<{ error: string }>("removeTeamFailure"),

  // Additional actions for updating team members
  addMemberToTeam: createAction<{ teamId: number, member: Member }>("addMemberToTeam"),
  removeMemberFromTeam: createAction<{ teamId: number, memberId: string }>("removeMemberFromTeam"),
  updateMemberRole: createAction<{ teamId: number, memberId: string, newRole: string }>("updateMemberRole"),

  // Batch actions for fetching
  batchFetchTeamsRequest: createAction("batchFetchTeamsRequest"),
  batchFetchTeamsSuccess: createAction<{ teams: Team[] }>("batchFetchTeamsSuccess"),
  batchFetchTeamsFailure: createAction<{ error: string }>("batchFetchTeamsFailure"),

  // Batch actions for updating
  batchUpdateTeamsRequest: createAction<{ ids: number[], newNames: string[] }>("batchUpdateTeamsRequest"),
  batchUpdateTeamsSuccess: createAction<{ teams: Team[] }>("batchUpdateTeamsSuccess"),
  batchUpdateTeamsFailure: createAction<{ error: string }>("batchUpdateTeamsFailure"),

  // Batch actions for removing
  batchRemoveTeamsRequest: createAction<number[]>("batchRemoveTeamsRequest"),
  batchRemoveTeamsSuccess: createAction<number[]>("batchRemoveTeamsSuccess"),
  batchRemoveTeamsFailure: createAction<{ error: string }>("batchRemoveTeamsFailure"),

  // Other team-related actions
  archiveTeam: createAction<number>("archiveTeam"),
  restoreTeam: createAction<number>("restoreTeam"),
  // Add more actions as needed
};
