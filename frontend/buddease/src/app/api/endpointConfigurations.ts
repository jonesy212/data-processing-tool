import useFiltering from '@/app/hooks/useFiltering';
import { BASE_URL } from '@/app/api/baseUrl'
import { searchOptions } from '@/app/pages/searches/SearchOptions';
import useSearchOptions from "@/app/pages/searches/useSearchOptions";
import { uiSettingsConfig } from '@/config/endpoints/uiSettingsConfig'
import { usersConfig } from '@/config/endpoints/usersConfig';
import { apiWebBaseConfig } from '@/config/endpoints/apiWebBaseConfig';
import { commentsConfig } from '@/config/endpoints/commentsConfig';
import { contentConfig } from '@/config/endpoints/contentConfig';
import { dataConfig } from '@/config/endpoints/dataConfig';
import { delegatesConfig } from '@/config/endpoints/delegatesConfig';
import { webConfig } from '@/config/endpoints/webConfig';
import { sortingConfig } from '@/config/endpoints/sortingConfig';
import { filteringConfig } from '@/config/endpoints/filteringConfig';
import { highlightsConfig } from '@/config/endpoints/highlightsConfig';
import { loggingConfig } from '@/config/endpoints/loggingConfig';
import { newsConfig } from '@/config/endpoints/newsConfig';
import { notesConfig } from '@/config/endpoints/notesConfig';
import { projectsConfig } from '@/config/endpoints/projectsConfig';
import { searchingConfig } from '@/config/endpoints/searchingConfig';
import { snapshotsConfig } from '@/config/endpoints/snapshotsConfig';
import { uiConfig } from '@/config/endpoints/uiConfig';
import { versionConfig } from '@/config/endpoints/versionConfig';
import { tasksConfig } from '@/config/endpoints/tasksConfig';
import { teamsConfig } from '@/config/endpoints/teamsConfig';
import { todosConfig } from '@/config/endpoints/todosConfig';

import { authConfig } from '@/config/endpoints/authConfig';
import { blogsConfig } from '@/config/endpoints/blogsConfig';
import { calendarConfig } from '@/config/endpoints/calendarConfig';
import { chatConfig } from '@/config/endpoints/chatConfig';
import { clientConfig } from '@/config/endpoints/clientConfig';
import { collaborationToolsConfig } from '@/config/endpoints/collaborationToolsConfig';
import { communicationConfig } from '@/config/endpoints/communicationConfig';
import { communityInteractionConfig } from '@/config/endpoints/communityInteractionConfig';
import { cryptoConfig } from '@/config/endpoints/cryptoConfig';
import { dataProvidersConfig } from '@/config/endpoints/dataProvidersConfig';
import { dexConfig } from '@/config/endpoints/dexConfig';
import { detailsConfig } from '@/config/endpoints/detailsConfig';
import { donationsConfig } from '@/config/endpoints/donationsConfig';

import { drawingConfig } from '@/config/endpoints/drawingConfig';
import { externalAuthConfig } from '@/config/endpoints/externalAuthConfig';
import { feedbackConfig } from '@/config/endpoints/feedbackConfig';
import { filesConfig } from '@/config/endpoints/filesConfig';
import { freelancersConfig } from '@/config/endpoints/freelancersConfig';
import { generatorsConfig } from '@/config/endpoints/generatorsConfig';
import { globalCollaborationConfig } from '@/config/endpoints/globalCollaborationConfig';
import { markerConfig } from '@/config/endpoints/markerConfig';
import { moderatorsConfig } from '@/config/endpoints/moderatorsConfig';
import { monetizationConfig } from '@/config/endpoints/monetizationConfig';
import { parameterCustomizationConfig } from '@/config/endpoints/parameterCustomizationConfig';
import { paymentConfig } from '@/config/endpoints/paymentConfig';
import { personasConfig } from '@/config/endpoints/personasConfig';
import { phasesConfig } from '@/config/endpoints/phasesConfig';
import { projectManagementConfig } from '@/config/endpoints/projectManagementConfig';
import { projectOwnerConfig } from '@/config/endpoints/projectOwnerConfig';
import { randomWalkConfig } from '@/config/endpoints/randomWalkConfig';
import { registrationConfig } from '@/config/endpoints/registrationConfig';
import { reportsConfig } from '@/config/endpoints/reportsConfig';
import { securityConfig } from '@/config/endpoints/securityConfig';
import { stateGovCitiesConfig } from '@/config/endpoints/stateGovCitiesConfig';
import { teamManagementConfig } from '@/config/endpoints/teamManagementConfig';
import { themeConfig } from '@/config/endpoints/themeConfig';
import { toolbarConfig } from '@/config/endpoints/toolbarConfig';
import { tradingConfig } from '@/config/endpoints/tradingConfig';
import { userManagementConfig } from '@/config/endpoints/userManagementConfig';
import { userRolesConfig } from '@/config/endpoints/userRolesConfig';
import { userRolesNFTConfig } from '@/config/endpoints/userRolesNFTConfig';
import { userSettingsConfig } from '@/config/endpoints/userSettingsConfig';
import { videosConfig } from '@/config/endpoints/videosConfig';
import { databaseConfig } from '@/config/endpoints/databaseConfig';
import { apiEndpointConfig } from '@/config/endpoints/apiEndpointConfig';
import { devConfig } from '@/config/endpoints/devConfig';
import { documentsConfig } from '@/config/endpoints/documentsConfig';
import { participantsConfig } from '@/config/endpoints/participantsConfig';
import { messagesConfig } from '@/config/endpoints/messagesConfig';
import { screenSharingConfig } from '@/config/endpoints/screenSharingConfig';
import { dataAnalysisConfig } from '@/config/endpoints/dataAnalysisConfig';
import { logsConfig } from '@/config/endpoints/logsConfig';
import { realtimeConfig } from '@/config/endpoints/realtimeConfig';
import { batchConfig } from '@/config/endpoints/batchConfig';
import { analyticsConfig } from '@/config/endpoints/analyticsConfig';

import { createMergedEndpoints } from '@/app/utils/endpointMerger';
import mergeConfigurations from '@/app/utils/mergeConfigurations';
import  createApiConfig from './ApiConfig';
import { EndpointConfig, EndpointConfigurations } from '@/config/EndpointConfig';

// Main endpoint configurations
export const endpointConfigurations: EndpointConfigurations = {
  analytics: analyticsConfig,
  apiConfig: apiEndpointConfig,
  apiWebBase: apiWebBaseConfig,
  dataAnalysis: dataAnalysisConfig,
  auth: authConfig,
  batch: batchConfig,
  blogs: blogsConfig,
  calendar: calendarConfig,
  chat: chatConfig,
  client: clientConfig,
  collaborationTools: collaborationToolsConfig,
  comments: commentsConfig,
  communication: communicationConfig,
  communityInteraction: communityInteractionConfig,
  content: contentConfig,
  crypto: cryptoConfig,
  data: dataConfig,
  database: databaseConfig,
  dataProviders: dataProvidersConfig,
  delegates: delegatesConfig,
  details: detailsConfig,
  dev: devConfig,
  dex: dexConfig,
  documents: documentsConfig,
  donations: donationsConfig,
  drawing: drawingConfig,
  externalAuth: externalAuthConfig,
  
  feedback: feedbackConfig,
  files: filesConfig,
  filtering: filteringConfig,
  
  freelancers: freelancersConfig,
  generators: generatorsConfig,
  globalCollaboration: globalCollaborationConfig,
  highlights: highlightsConfig,
  logging: loggingConfig,
  marker: markerConfig,
  messages: messagesConfig,
  moderators: moderatorsConfig,
  monetization: monetizationConfig,
  news: newsConfig,
  notes: notesConfig,
  payment: paymentConfig,
  parameterCustomization: parameterCustomizationConfig,
  participants: participantsConfig,
  personas: personasConfig,
  projects: projectsConfig,
  phases: phasesConfig,
  projectManagement: projectManagementConfig,
  projectOwner: projectOwnerConfig,
  randomWalk: randomWalkConfig,
  registration: registrationConfig,
  reports: reportsConfig,
  security: securityConfig,
  stateGovCities: stateGovCitiesConfig,
  sorting: sortingConfig,
  searching: searchingConfig,
  snapshots: snapshotsConfig,
  realtime: realtimeConfig,
  tasks: tasksConfig,
  teams: teamsConfig,
  teamManagement: teamManagementConfig,
  theme: themeConfig,
  toolbar: toolbarConfig,
  trading: tradingConfig,
  todos: todosConfig,
  ui: uiConfig,
  userManagement: userManagementConfig,
  userRoles: userRolesConfig,
  userRolesNFT: userRolesNFTConfig,
  userSettings: userSettingsConfig,
  videos: videosConfig,
  users: usersConfig,
  version: versionConfig,
  web: webConfig,

  screenSharing: screenSharingConfig,
  logs: logsConfig,
  uiSettings: uiSettingsConfig

};

// Export types

// Export individual configurations for selective imports
export {
  apiWebBaseConfig,
  apiEndpointConfig,
  batchConfig,
  communicationConfig,
  commentsConfig,
  contentConfig,
  dataConfig,
  documentsConfig,
  delegatesConfig,
  webConfig,
  sortingConfig,
  filteringConfig,
  highlightsConfig,
  loggingConfig,
  newsConfig,
  notesConfig,
  projectsConfig,
  searchingConfig,
  snapshotsConfig,
  uiConfig,
  versionConfig,
  tasksConfig,
  teamsConfig,
  todosConfig,
  usersConfig,
  realtimeConfig,
  authConfig,
  blogsConfig,
  calendarConfig,
  chatConfig,
  clientConfig,
  collaborationToolsConfig,
  communityInteractionConfig,
  cryptoConfig,
  dataProvidersConfig,
  dataAnalysisConfig,
  databaseConfig,
  devConfig,
  dexConfig,
  detailsConfig,
  donationsConfig,
  drawingConfig,
  externalAuthConfig,
  feedbackConfig,
  filesConfig,
  freelancersConfig,
  generatorsConfig,
  globalCollaborationConfig,
  markerConfig,
  moderatorsConfig,
  monetizationConfig,
  parameterCustomizationConfig,
  paymentConfig,
  personasConfig,
  phasesConfig,
  projectManagementConfig,
  projectOwnerConfig,
  randomWalkConfig,
  registrationConfig,
  reportsConfig,
  securityConfig,
  stateGovCitiesConfig,
  teamManagementConfig,
  themeConfig,
  toolbarConfig,
  tradingConfig,
  userManagementConfig,
  userRolesConfig,
  userRolesNFTConfig,
  userSettingsConfig,
  videosConfig,

  participantsConfig,
  messagesConfig,
  screenSharingConfig,
  logsConfig,
};

// Create merged endpoints
const updatedEndpoints = createMergedEndpoints(endpointConfigurations);

// Export endpoints alias
export const endpoints = updatedEndpoints;

// Create API config instance
export const apiConfig = new createApiConfig(endpointConfigurations, endpoints);



// Helper function to get endpoint info
export const getApiEndpoint = <T extends keyof EndpointConfigurations>(
  category: T,
  endpointKey: keyof EndpointConfigurations[T],
  ...params: any[]
) => {
  return apiConfig.getEndpointInfo(category, endpointKey, ...params);
};

// Helper function to get endpoint URL
export const getApiEndpointUrl = <T extends keyof EndpointConfigurations>(
  category: T,
  endpointKey: keyof EndpointConfigurations[T],
  ...params: any[]
) => {
  return apiConfig.getEndpointUrl(category, endpointKey, ...params);
};


const { handleFilterTasks } = useSearchOptions();
const { addFilter } = useFiltering(searchOptions);


export { updatedEndpoints }