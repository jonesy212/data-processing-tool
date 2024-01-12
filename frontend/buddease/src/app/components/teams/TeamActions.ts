// TeamActions.tsx
import { createAction } from "@reduxjs/toolkit";
import { Team } from "../models/teams/Team";

export const TeamActions = {
  addTeam: createAction<Team>("addTeam"),
  removeTeam: createAction<number>("removeTeam"),
  updateTeam: createAction<{ id: number; updatedTeam: Partial<Team> }>("updateTeam"),
  fetchTeamsRequest: createAction("fetchTeamsRequest"),
  fetchTeamsSuccess: createAction<{ teams: Team[] }>("fetchTeamsSuccess"),
  fetchTeamsFailure: createAction<{ error: string }>("fetchTeamsFailure"),
  // Add more actions as needed
};
