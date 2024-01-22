// CommunicationActions.ts
import { createAction } from "@reduxjs/toolkit";

export const CommunicationActions = {
  // Standard actions
  startCommunication: createAction<string>("startCommunication"),
  endCommunication: createAction<string>("endCommunication"),
  collaborate: createAction<string>("collaborate"),

  // Batch actions for communication
  batchStartCommunication: createAction<string[]>("batchStartCommunication"),
  batchEndCommunication: createAction<string[]>("batchEndCommunication"),
  batchCollaborate: createAction<string[]>("batchCollaborate"),

  // Actions for handling communication requests
  startCommunicationRequest: createAction<string>("startCommunicationRequest"),
  endCommunicationRequest: createAction<string>("endCommunicationRequest"),
  collaborateRequest: createAction<string>("collaborateRequest"),

  // Actions for communication successes
  startCommunicationSuccess: createAction<string>("startCommunicationSuccess"),
  endCommunicationSuccess: createAction<string>("endCommunicationSuccess"),
  collaborateSuccess: createAction<string>("collaborateSuccess"),

  // Actions for communication failures
  startCommunicationFailure: createAction<{ id: string; error: string }>(
    "startCommunicationFailure"
  ),
  endCommunicationFailure: createAction<{ id: string; error: string }>(
    "endCommunicationFailure"
  ),
  collaborateFailure: createAction<{ id: string; error: string }>(
    "collaborateFailure"
  ),

  // Actions for batch communication failures
  batchStartCommunicationFailure: createAction<{ error: string }>(
    "batchStartCommunicationFailure"
  ),
  batchStartCommunicationSuccess: createAction<string[]>(
    "batchStartCommunicationSuccess"
  ),

  batchEndCommunicationFailure: createAction<{ error: string }>(
    "batchEndCommunicationFailure"
  ),
  batchEndCommunicationSuccess: createAction<{ error: string }>(
    "batchEndCommunicationSuccess"
  ),
  batchCollaborateFailure: createAction<{ error: string }>(
    "batchCollaborateFailure"
  ),
  // Add more actions as needed
};

export type CommunicationActionTypes = ReturnType<
  (typeof CommunicationActions)[keyof typeof CommunicationActions]
>;
