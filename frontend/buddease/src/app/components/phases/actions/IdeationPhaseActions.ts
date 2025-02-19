import IdeationPhase from '@/app/components/users/userJourney/IdeationPhase';
import { createAction } from "@reduxjs/toolkit";

export const IdeationPhaseActions = {
    // Ideation Phase Actions
  addPhase: createAction<typeof IdeationPhase>('addIdeationPhase'),
  
  updateIdeationPhase: createAction<{ id: string; newData: any }>("updateIdeationPhase"),
  deleteIdeationPhase: createAction<string>("deleteIdeationPhase"),
  // Ideation Phase Metadata Actions
  updateIdeationPhaseMetadata: createAction<{ id: string; newMetadata: any }>(
    "updateIdeationPhaseMetadata"
  ),
  // Notification Actions
  sendIdeationPhaseNotification: createAction<string>("sendIdeationPhaseNotification"),
  // Data Actions
  updateIdeationPhaseData: createAction<{ id: string; newData: any }>(
    "updateIdeationPhaseData"
  ),
  // Pagination Actions
  fetchIdeationPhaseSuccess: createAction<{ ideationPhase: any }>("fetchIdeationPhaseSuccess"),
  fetchIdeationPhaseFailure: createAction<{ error: string }>("fetchIdeationPhaseFailure"),
  fetchIdeationPhaseRequest: createAction("fetchIdeationPhaseRequest"),

  // Additional Actions Based on App Type
  // Collaboration Actions
  shareIdeationPhase: createAction<{ id: string; recipients: string[] }>("shareIdeationPhase"),
  // Analytics Actions
  analyzeIdeationPhase: createAction<string>("analyzeIdeationPhase"),
  // Recommendation Actions
  recommendIdeationPhase: createAction<{ id: string; recommendations: string[] }>(
    "recommendIdeationPhase"
  ),
  // Subscription Actions
  subscribeToIdeationPhase: createAction<string>("subscribeToIdeationPhase"),
  unsubscribeFromIdeationPhase: createAction<string>("unsubscribeFromIdeationPhase"),

  // Additional Ideation Phase Management Actions
  updateIdeationPhaseThumbnail: createAction<{ id: string; newThumbnail: string }>(
    "updateIdeationPhaseThumbnail"
  ),
  updateIdeationPhaseTitle: createAction<{ id: string; newTitle: string }>(
    "updateIdeationPhaseTitle"
  ),
  updateIdeationPhaseDescription: createAction<{ id: string; newDescription: string }>(
    "updateIdeationPhaseDescription"
  ),
  updateIdeationPhaseTags: createAction<{ id: string; newTags: string[] }>(
    "updateIdeationPhaseTags"
  ),
  updateIdeationPhaseLanguage: createAction<{ id: string; newLanguage: string }>(
    "updateIdeationPhaseLanguage"
  ),
  updateIdeationPhaseCategory: createAction<{ id: string; newCategory: string }>(
    "updateIdeationPhaseCategory"
  ),
  updateIdeationPhaseResolution: createAction<{ id: string; newResolution: string }>(
    "updateIdeationPhaseResolution"
  ),
  updateIdeationPhaseLicense: createAction<{ id: string; newLicense: string }>(
    "updateIdeationPhaseLicense"
  ),
  updateIdeationPhaseLocation: createAction<{ id: string; newLocation: string }>(
    "updateIdeationPhaseLocation"
  ),
  // Add more actions as needed
};
