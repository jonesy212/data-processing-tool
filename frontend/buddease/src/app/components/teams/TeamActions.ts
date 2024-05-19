// TeamActions.tsx
import { createAction } from "@reduxjs/toolkit";
import { Team } from "../models/teams/Team";
import { UserRole } from "../users/UserRole";

export const TeamActions = {
  addTeam: createAction<Team>("addTeam"),
  addTeamSuccess: createAction<{ team: Team }>("addTeamSuccess"),
  addTeamFailure: createAction<{ error: string }>("addTeamFailure"),
  createTeam: createAction<Team>("createTeam"),
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
  
  updateTeamRole: createAction<{teamId: number; roleId: string; roleName: UserRole["role"]; roleDescription: string;}>("updateTeamRole"),
  updateTeamRoles: createAction<{teamId: number[]; roleId: string; roleNames: UserRole[]; roleDescriptiond: string;}>("updateTeamRole"),
  manageTeamRoles: createAction<{ teamId: number, role: UserRole }>("manageTeamRoles"),
  updateCallback: createAction<{ error: string }>("updateCallback"),
  //  batch actions
  fetchTeamsRequest: createAction("fetchTeamsRequest"),
  fetchTeamsSuccess: createAction<{teams: Team[] }>("fetchTeamsSuccess"),
  fetchTeamsFailure: createAction<{ error: string }>("fetchTeamsFailure"),
  fetchApiDataSuccess: createAction<{ data: Team[] }>("fetchApiDataSuccess"),
  
  updateTeamsRequest: createAction<{ updatedTeams: Partial<Team>[] }>("updateTeamsRequest"),
  updateTeamsSuccess: createAction<{ updatedTeams: Team[] }>("updateTeamsSuccess"),
  updateTeamsFailure: createAction<{ error: string }>("updateTeamsFailure"),


   // Additional Actions Matching Provided Pattern
   clearTeams: createAction<void>('teamManager/clearTeams'),
   selectTeam: createAction<string>('teamManager/selectTeam'),
   reorderTeams: createAction<string[]>('teamManager/reorderTeams'),
   toggleTeamActivation: createAction<string>('teamManager/toggleTeamActivation'),
 
   // Additional actions
  setTeamLeader: createAction<{ teamId: number; memberId: number }>("setTeamLeader"),
  assignMember: createAction<{ teamId: number; memberId: number }>("assignMember"),
  removeMember: createAction<{ teamId: number; memberId: number }>("removeMember"),

  // Add more actions as needed
};
