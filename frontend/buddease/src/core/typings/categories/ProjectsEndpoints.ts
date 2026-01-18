// ProjectsEndpoints.ts
import type { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';


export interface ProjectsEndpoints extends EndpointCategoryConfig {
  list: EndpointConfig;
  single: (projectId: number) => EndpointConfig;
  add: EndpointConfig;
  remove: (projectId: number) => EndpointConfig;
  update: (projectId: number) => EndpointConfig;
  tasks: (projectId: number) => EndpointConfig;
  members: (projectId: number) => EndpointConfig;
  phases: (projectId: number) => EndpointConfig;
  milestones: (projectId: number) => EndpointConfig;
  teams: (projectId: number) => EndpointConfig;
  identifyTeamNeeds: (projectId: number) => EndpointConfig;
  defineJobRoles: (projectId: number) => EndpointConfig;
  createJobDescriptions: (projectId: number) => EndpointConfig;
  advertisePositions: (projectId: number) => EndpointConfig;
  reviewApplications: (projectId: number) => EndpointConfig;
  conductInterviews: (projectId: number) => EndpointConfig;
  assessCulturalFit: (projectId: number) => EndpointConfig;
  checkReferences: (projectId: number) => EndpointConfig;
  coordinateSelectionProcess: (projectId: number) => EndpointConfig;
  onboardNewTeamMembers: (projectId: number) => EndpointConfig;
  brainstormProduct: (projectId: number) => EndpointConfig;
  launchProduct: (projectId: number) => EndpointConfig;
  analyzeData: (projectId: number) => EndpointConfig;
  rewardContributors: (projectId: number) => EndpointConfig;
  reinvestEarnings: (projectId: number) => EndpointConfig;
  buildCustomApp: (projectId: number) => EndpointConfig;
  meetProjectMetrics: (projectId: number) => EndpointConfig;
  generateRevenue: (projectId: number) => EndpointConfig;
  joinCommunityProject: (projectId: number) => EndpointConfig;
  promoteUnity: (projectId: number) => EndpointConfig;
  shareProjectProgress: (projectId: number) => EndpointConfig;
  celebrateMilestones: (projectId: number) => EndpointConfig;
  provideFeedback: (projectId: number) => EndpointConfig;
  inviteMembers: (projectId: number) => EndpointConfig;
  assignTasks: (projectId: number) => EndpointConfig;
  scheduleMeetings: (projectId: number) => EndpointConfig;
  shareResources: (projectId: number) => EndpointConfig;
  trackProgress: (projectId: number) => EndpointConfig;
  resolveConflicts: (projectId: number) => EndpointConfig;
  resolveBugs: (projectId: number) => EndpointConfig;
  conductSurveys: (projectId: number) => EndpointConfig;
  facilitateTraining: (projectId: number) => EndpointConfig;
  provideMentorship: (projectId: number) => EndpointConfig;
  ensureAccessibility: (projectId: number) => EndpointConfig;
  implementSecurityMeasures: (projectId: number) => EndpointConfig;
  ensurePrivacy: (projectId: number) => EndpointConfig;
  implementDataProtection: (projectId: number) => EndpointConfig;
}