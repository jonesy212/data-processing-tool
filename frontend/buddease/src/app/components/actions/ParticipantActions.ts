import { Participant } from "@/app/pages/management/ParticipantManagementPage";
import { createAction } from "@reduxjs/toolkit";

// ParticipantActions.ts
export const ParticipantActions = {
  // Standard actions
  setParticipants: createAction<Participant[]>("setParticipants"),
  addParticipant: createAction<Participant>("addParticipant"),
  updateParticipant: createAction<Participant>("updateParticipant"),
  removeParticipant: createAction<string>("removeParticipant"),
  
  // Fetch participant actions
  fetchParticipants: createAction("fetchParticipants"),
  fetchParticipantsSuccess: createAction<{ participants: Participant[] }>("fetchParticipantsSuccess"),
  fetchParticipantsFailure: createAction<{ error: string }>("fetchParticipantsFailure"),
  
  // Additional actions for specific updates
  updateParticipantName: createAction<{ id: string, newName: string }>("updateParticipantName"),
  updateParticipantRole: createAction<{ id: string, newRole: string }>("updateParticipantRole"),
  // Add more specific update actions as needed
  
  // Additional actions for specific removals
  removeParticipantSuccess: createAction<string>("removeParticipantSuccess"),
  removeParticipantFailure: createAction<{ error: string }>("removeParticipantFailure"),
};