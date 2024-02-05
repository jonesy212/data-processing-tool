import { createAction } from "@reduxjs/toolkit";

export const TeamCreationPhaseActions = {
    // General Team Creation Phase Actions
    updateTeamCreationPhase: createAction<{ id: number, newData: any }>("updateTeamCreationPhase"),
    deleteTeamCreationPhase: createAction<number>("deleteTeamCreationPhase"),
    createTeamCreationPhaseSuccess: createAction<{ data: any }>("createTeamCreationPhaseSuccess"),
    createTeamCreationPhaseFailure: createAction<{ error: string }>("createTeamCreationPhaseFailure"),
    // Other actions related to Team Creation Phase
    fetchTeamCreationPhaseRequest: createAction("fetchTeamCreationPhaseRequest"),
    addPhase: 
    // Add more actions as needed
};