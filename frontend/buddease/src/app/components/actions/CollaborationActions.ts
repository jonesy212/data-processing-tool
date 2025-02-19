// CollaborationActions.ts

import { createAction } from '@reduxjs/toolkit';
import { CollaborationPreferences } from '../interfaces/settings/CollaborationPreferences';

// Collaboration actions
export const CollaborationActions = {

  fetchCollaboration: createAction<{id: string}>('collaboration/fetchCollaboration'),
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


  
  inviteCollaborator: createAction<{ collaboratorId: string }>('collaboration/inviteCollaborator'),
  inviteCollaboratorSuccess: createAction<string>('collaboration/inviteCollaboratorSuccess'),
  inviteCollaboratorFailure: createAction<string>('collaboration/inviteCollaboratorFailure'),
  removeInvitedCollaborator: createAction<{collaboratorId: string}>('collaboration/removeInivitedCollaborator'),
  // Other collaboration actions as needed
  addCollaboratorToProject: createAction<{ projectId: string, collaboratorId: string }>('collaboration/addCollaboratorToProject'),
  removeCollaboratorFromProject: createAction<{ projectId: string, collaboratorId: string }>('collaboration/removeCollaboratorFromProject'),
  assignRoleToCollaboratorInProject: createAction<{ projectId: string, collaboratorId: string, role: string }>('collaboration/assignRoleToCollaboratorInProject'),
  updateCollaborationNotes: createAction<{ projectId: string, notes: string }>('collaboration/updateCollaborationNotes'),
  shareDocument: createAction<{ documentId: string, collaborators: Collaborator[] }>('collaboration/shareDocument'),
  unshareDocument: createAction<{ documentId: string }>('collaboration/unshareDocument'),
  // Collaboration actions
  saveCollaborationPreferences: createAction<CollaborationPreferences>('collaboration/saveCollaborationPreferences')
};
