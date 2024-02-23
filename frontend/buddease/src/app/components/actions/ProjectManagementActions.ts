// ProjectManagementActions.ts
import { createAction } from "@reduxjs/toolkit";

export const ProjectManagementActions = {


    //nft actions
  // Development Services Actions
  fetchDevelopers: createAction("fetchDevelopers"),
  bidOnProject: createAction<{ projectId: number, bidAmount: number }>("bidOnProject"),
  batchProjectSubmission: createAction<{ projects: any[] }>("batchProjectSubmission"),

  // Global Collaboration Features Actions
  integrateCommunicationTools: createAction("integrateCommunicationTools"),
  shareProjectResources: createAction<{ projectId: number, resources: any[] }>("shareProjectResources"),
  implementWhiteboardingTool: createAction("implementWhiteboardingTool"),

  // Phases-based Project Management Framework Actions
  addPreLaunchPhase: createAction("addPreLaunchPhase"),
  trackMilestones: createAction<{ projectId: number, milestones: any[] }>("trackMilestones"),
  integrateAIProjectInsights: createAction("integrateAIProjectInsights"),

  // Data Analysis and Insights Actions
  integrateAnalyticsTools: createAction("integrateAnalyticsTools"),
  implementPredictiveAnalytics: createAction("implementPredictiveAnalytics"),
  analyzeSentiment: createAction("analyzeSentiment"),

  // Community Involvement Actions
  implementCommunityVoting: createAction("implementCommunityVoting"),
  organizeCommunityChallenges: createAction("organizeCommunityChallenges"),
  implementRewardSystem: createAction("implementRewardSystem"),

  // Monetization Opportunities Actions
  setupMarketplace: createAction("setupMarketplace"),
  introduceSubscriptionModel: createAction("introduceSubscriptionModel"),
  implementRevenueSharing: createAction("implementRevenueSharing"),

  // NFTActions
  mintNFT: createAction<{ tokenId: number, metadata: any }>("mintNFT"),
  transferNFT: createAction<{ tokenId: number, recipient: string }>("transferNFT"),
  burnNFT: createAction<{ tokenId: number }>("burnNFT"),
};
