// ProjectManagementActions.ts
import { BaseData, Data } from '@/app/components/models/data/Data';
import { createAction } from "@reduxjs/toolkit";
import { CustomSnapshotData } from '../snapshots';
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';


export const ProjectManagementActions = <
  T extends  BaseData<any> = BaseData<any, any>, 
  K extends T = T,
  ExcludedFields extends Data<T> = never,
  S extends CustomSnapshotData<T, K> = CustomSnapshotData<T, K>,  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
>() => ({
  // Tenant-related actions
  addTenantToProject: createAction<{ projectId: number, tenantId: number }>("addTenantToProject"),
  removeTenantFromProject: createAction<{ projectId: number, tenantId: number }>("removeTenantFromProject"),
  assignTenantManager: createAction<{ projectId: number, tenantId: number, managerId: number }>("assignTenantManager"),


  startNewProject: createAction("startNewProject"),
  addTeamMember: createAction<{ projectId: string, memberId: string }>("addTeamMember"),
  updateProjectStatus: createAction<{ projectId: string, status: string }>("updateProjectStatus"),

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


  // Resource Allocation and Tracking
  assignResourceToTask: createAction<{ taskId: number, resourceId: number }>("assignResourceToTask"),
  trackResourceUtilization: createAction("trackResourceUtilization"),
  requestAdditionalResources: createAction<{ projectId: number, resourceType: string, quantity: number }>("requestAdditionalResources"),

  // Budget Management
  createProjectBudget: createAction<{ projectId: number, budgetAmount: number }>("createProjectBudget"),
  trackExpenses: createAction<{ projectId: number, expenseDetails: any }>("trackExpenses"),
  approveExpense: createAction<{ expenseId: number, approverId: number }>("approveExpense"),

  // Risk Management
  identifyProjectRisks: createAction<{ projectId: number, riskDetails: any }>("identifyProjectRisks"),
  mitigateProjectRisks: createAction<{ riskId: number, mitigationPlan: string }>("mitigateProjectRisks"),
  updateRiskRegister: createAction<{ projectId: number, updatedRiskRegister: any[] }>("updateRiskRegister"),

  // Quality Assurance
  defineQualityStandards: createAction<{ projectId: number, standards: any[] }>("defineQualityStandards"),
  conductQualityReview: createAction<{ projectId: number, reviewDetails: any }>("conductQualityReview"),
  implementActionPlan: createAction<{ actionId: number, actionDetails: any }>("implementActionPlan"),

  // Stakeholder Communication
  sendProjectUpdates: createAction<{ projectId: number, updateContent: string }>("sendProjectUpdates"),
  scheduleProjectMeeting: createAction<{ projectId: number, meetingDetails: any }>("scheduleProjectMeeting"),
  facilitateDiscussion: createAction<{ discussionId: number, discussionContent: string }>("facilitateDiscussion"),

  // Task Automation
  automateTask: createAction<{ taskId: number, automationDetails: any }>("automateTask"),
  implementWorkflowAutomation: createAction("implementWorkflowAutomation"),
  integrateEnterpriseSystems: createAction("integrateEnterpriseSystems"),

  // Reporting and Analytics
  generateProjectReports: createAction<{ projectId: number, reportType: string }>("generateProjectReports"),
  analyzeProjectData: createAction<{ projectId: number, analysisType: string }>("analyzeProjectData"),
  provideRealTimeAnalytics: createAction("provideRealTimeAnalytics"),

  // Document Management
  manageProjectDocumentation: createAction<{ projectId: number, documentDetails: any }>("manageProjectDocumentation"),
  versionControlDocuments: createAction<{ documentId: number, versionDetails: any }>("versionControlDocuments"),
  collaborateOnDocuments: createAction<{ documentId: number, collaborationDetails: any }>("collaborateOnDocuments"),

  // Integration with Enterprise Systems
  connectWithERP: createAction<{ projectId: number, erpDetails: any }>("connectWithERP"),
  syncWithCRM: createAction<{ projectId: number, crmDetails: any }>("syncWithCRM"),
  integrateWithHRSystem: createAction<{ projectId: number, hrDetails: any }>("integrateWithHRSystem"),

  // Security and Compliance
  implementRBAC: createAction("implementRBAC"),
  ensureCompliance: createAction("ensureCompliance"),
  conductSecurityAudit: createAction("conductSecurityAudit"),

  // Continuous Improvement
  captureLessonsLearned: createAction<{ projectId: number, lessonsLearned: any[] }>("captureLessonsLearned"),
  implementFeedbackMechanism: createAction("implementFeedbackMechanism"),
  conductPostProjectReview: createAction<{ projectId: number, reviewDetails: any }>("conductPostProjectReview"),

  // Vendor and Contract Management
  manageVendorContracts: createAction<{ projectId: number, contractDetails: any }>("manageVendorContracts"),
  monitorVendorPerformance: createAction<{ projectId: number, performanceDetails: any }>("monitorVendorPerformance"),
  negotiateContractRenewal: createAction<{ contractId: number, renewalDetails: any }>("negotiateContractRenewal"),

  // Change Management
  manageScopeChanges: createAction<{ projectId: number, changeDetails: any }>("manageScopeChanges"),
  assessChangeImpact: createAction<{ projectId: number, changeDetails: any }>("assessChangeImpact"),
  communicateChangePlan: createAction<{ projectId: number, changeDetails: any }>("communicateChangePlan"),

  
});
