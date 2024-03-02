// common/CommonPersonaActions.ts
import { createAction } from "@reduxjs/toolkit";

export const CommonPersonaActions = {
  // General Actions
  updateItem: createAction<{ id: number, newData: any }>("updateItem"),
  deleteItem: createAction<number>("deleteItem"),
  createItemSuccess: createAction<any>("createItemSuccess"),
  createItemFailure: createAction<{ error: string }>("createItemFailure"),

  changePersona: createAction<any>("changePersona"),
  // Search Actions
  searchSuccess: createAction<{ results: any[] }>("searchSuccess"),
  searchRequest: createAction<{ searchTerm: string }>("searchRequest"),
  searchFailure: createAction<{ error: string }>("searchFailure"),

  // Bulk Actions
  batchCreate: createAction<any[]>("batchCreate"),
  batchDelete: createAction<number[]>("batchDelete"),
  batchDeleteSuccess: createAction<number[]>("batchDeleteSuccess"),
  batchDeleteFailure: createAction<{ error: string }>("batchDeleteFailure"),

  // Fetch Actions
  fetchSuccess: createAction<{ data: any[] }>("fetchSuccess"),
  fetchRequest: createAction("fetchRequest"),
  fetchFailure: createAction<{ error: string }>("fetchFailure"),

  // Update Actions
  updateSuccess: createAction<{ data: any }>("updateSuccess"),
  updateRequest: createAction<{ updatedData: any }>("updateRequest"),
  updateFailure: createAction<{ error: string }>("updateFailure"),

  // Notification Actions
  sendNotification: createAction<string>("sendNotification"),


  // Music Persona Actions
  joinMusicDiscussion: createAction("joinMusicDiscussion"),
  contributeToMusicProject: createAction("contributeToMusicProject"),

  // Film Persona Actions
  joinFilmDiscussion: createAction("joinFilmDiscussion"),
  contributeToFilmProject: createAction("contributeToFilmProject"),

  // Art Persona Actions
  joinArtDiscussion: createAction("joinArtDiscussion"),
  contributeToArtProject: createAction("contributeToArtProject"),

  // Casual User Actions
  participateInCasualDiscussion: createAction("participateInCasualDiscussion"),

  // Project Manager Persona Actions
  createProject: createAction("createProject"),
  assignTasks: createAction("assignTasks"),
  communicateWithTeam: createAction("communicateWithTeam"),

  // Developer Persona Actions
  codeAndDevelop: createAction("codeAndDevelop"),
  collaborateOnCodingTasks: createAction("collaborateOnCodingTasks"),

  // Influencer Persona Actions
  engageWithAudience: createAction("engageWithAudience"),
  collaborateOnPartnerships: createAction("collaborateOnPartnerships"),




  // Collaboration Actions
  initiateAudioCall: createAction<{ userId: string }>("initiateAudioCall"),
  initiateVideoCall: createAction<{ userId: string }>("initiateVideoCall"),
  initiateTextChat: createAction<{ userId: string }>("initiateTextChat"),
  shareProjectResources: createAction<{ projectId: string, resources: any[] }>("shareProjectResources"),

  // Project Management Actions
  trackMilestoneProgress: createAction<{ milestoneId: string, progress: number }>("trackMilestoneProgress"),
  submitBetaFeedback: createAction<{ feedback: string }>("submitBetaFeedback"),
  analyzeProjectData: createAction("analyzeProjectData"),

  // Community Involvement Actions
  voteOnFeatureRequest: createAction<{ featureId: string, vote: 'up' | 'down' }>("voteOnFeatureRequest"),
  participateInHackathon: createAction("participateInHackathon"),
  earnCommunityRewards: createAction<{ rewardType: string, amount: number }>("earnCommunityRewards"),

  // Monetization Actions
  showcaseProjectInMarketplace: createAction<{ projectId: string }>("showcaseProjectInMarketplace"),
  subscribeToPremiumFeatures: createAction("subscribeToPremiumFeatures"),
  shareRevenueWithContributors: createAction<{ contributorId: string, revenue: number }>("shareRevenueWithContributors"),


};
