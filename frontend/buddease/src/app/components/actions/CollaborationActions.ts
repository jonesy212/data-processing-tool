// CollaborationActions.ts
// collaboration/CollaborationActions.ts

import { createAction } from '@reduxjs/toolkit';

// Collaboration actions
export const CollaborationActions = {
  fetchCollaborationRequest: createAction('collaboration/fetchCollaborationRequest'),
  fetchCollaborationSuccess: createAction<{ collaborationData: any }>('collaboration/fetchCollaborationSuccess'),
  fetchCollaborationFailure: createAction<{ error: string }>('collaboration/fetchCollaborationFailure'),

  // Additional collaboration actions
  startCollaborationSession: createAction('collaboration/startCollaborationSession'),
  endCollaborationSession: createAction('collaboration/endCollaborationSession'),
  inviteToCollaborate: createAction<string[]>('collaboration/inviteToCollaborate'),
  acceptCollaborationInvite: createAction<string>('collaboration/acceptCollaborationInvite'),
  declineCollaborationInvite: createAction<string>('collaboration/declineCollaborationInvite'),

  // Actions related to collaboration tools
  openCollaborationTool: createAction<string>('collaboration/openCollaborationTool'),
  closeCollaborationTool: createAction<string>('collaboration/closeCollaborationTool'),
  updateCollaborationSettings: createAction<{ settings: any }>('collaboration/updateCollaborationSettings'),

  // Other collaboration actions as needed
};
