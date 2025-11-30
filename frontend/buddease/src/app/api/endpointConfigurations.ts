// endpointConfigurations.ts
import { apiWebBaseConfig } from '@/app/config/endpoints/apiWebBaseConfig';
import { commentsConfig } from '@/app/config/endpoints/commentsConfig';
import { contentConfig } from '@/app/config/endpoints/contentConfig';
import { dataConfig } from '@/app/config/endpoints/dataConfig';
import { delegatesConfig } from '@/app/config/endpoints/delegatesConfig';
import { filteringConfig } from '@/app/config/endpoints/filteringConfig';
import { highlightsConfig } from '@/app/config/endpoints/highlightsConfig';
import { loggingConfig } from '@/app/config/endpoints/loggingConfig';
import { newsConfig } from '@/app/config/endpoints/newsConfig';
import { notesConfig } from '@/app/config/endpoints/notesConfig';
import { projectsConfig } from '@/app/config/endpoints/projectsConfig';
import { searchingConfig } from '@/app/config/endpoints/searchingConfig';
import { snapshotsConfig } from '@/app/config/endpoints/snapshotsConfig';
import { sortingConfig } from '@/app/config/endpoints/sortingConfig';
import { tasksConfig } from '@/app/config/endpoints/tasksConfig';
import { teamsConfig } from '@/app/config/endpoints/teamsConfig';
import { todosConfig } from '@/app/config/endpoints/todosConfig';
import { uiConfig } from '@/app/config/endpoints/uiConfig';
import { uiSettingsConfig } from '@/app/config/endpoints/uiSettingsConfig';
import { usersConfig } from '@/app/config/endpoints/usersConfig';
import { versionConfig } from '@/app/config/endpoints/versionConfig';
import { webConfig } from '@/app/config/endpoints/webConfig';

import { authConfig } from '@/app/config/endpoints/authConfig';
import { blogsConfig } from '@/app/config/endpoints/blogsConfig';
import { calendarConfig } from '@/app/config/endpoints/calendarConfig';
import { categoryConfig } from '@/app/config/endpoints/categoryConfig';
import { chatConfig } from '@/app/config/endpoints/chatConfig';
import { clientConfig } from '@/app/config/endpoints/clientConfig';
import { collaborationToolsConfig } from '@/app/config/endpoints/collaborationToolsConfig';
import { communicationConfig } from '@/app/config/endpoints/communicationConfig';
import { communityInteractionConfig } from '@/app/config/endpoints/communityInteractionConfig';
import { cryptoConfig } from '@/app/config/endpoints/cryptoConfig';
import { dataProvidersConfig } from '@/app/config/endpoints/dataProvidersConfig';
import { detailsConfig } from '@/app/config/endpoints/detailsConfig';
import { dexConfig } from '@/app/config/endpoints/dexConfig';
import { donationsConfig } from '@/app/config/endpoints/donationsConfig';

import ApiConfig from '@/app/api/ApiConfigService';
import { EndpointConfigurations } from '@/app/config/EndpointConfig';
import { analyticsConfig } from '@/app/config/endpoints/analyticsConfig';
import { apiEndpointConfig } from '@/app/config/endpoints/apiEndpointConfig';
import { batchConfig } from '@/app/config/endpoints/batchConfig';
import { dataAnalysisConfig } from '@/app/config/endpoints/dataAnalysisConfig';
import { databaseConfig } from '@/app/config/endpoints/databaseConfig';
import { devConfig } from '@/app/config/endpoints/devConfig';
import { documentsConfig } from '@/app/config/endpoints/documentsConfig';
import { drawingConfig } from '@/app/config/endpoints/drawingConfig';
import { externalAuthConfig } from '@/app/config/endpoints/externalAuthConfig';
import { feedbackConfig } from '@/app/config/endpoints/feedbackConfig';
import { filesConfig } from '@/app/config/endpoints/filesConfig';
import { freelancersConfig } from '@/app/config/endpoints/freelancersConfig';
import { generatorsConfig } from '@/app/config/endpoints/generatorsConfig';
import { globalCollaborationConfig } from '@/app/config/endpoints/globalCollaborationConfig';
import { logsConfig } from '@/app/config/endpoints/logsConfig';
import { markerConfig } from '@/app/config/endpoints/markerConfig';
import { messagesConfig } from '@/app/config/endpoints/messagesConfig';
import { moderatorsConfig } from '@/app/config/endpoints/moderatorsConfig';
import { monetizationConfig } from '@/app/config/endpoints/monetizationConfig';
import { parameterCustomizationConfig } from '@/app/config/endpoints/parameterCustomizationConfig';
import { participantsConfig } from '@/app/config/endpoints/participantsConfig';
import { paymentConfig } from '@/app/config/endpoints/paymentConfig';
import { personasConfig } from '@/app/config/endpoints/personasConfig';
import { phasesConfig } from '@/app/config/endpoints/phasesConfig';
import { projectManagementConfig } from '@/app/config/endpoints/projectManagementConfig';
import { projectOwnerConfig } from '@/app/config/endpoints/projectOwnerConfig';
import { randomWalkConfig } from '@/app/config/endpoints/randomWalkConfig';
import { realtimeConfig } from '@/app/config/endpoints/realtimeConfig';
import { registrationConfig } from '@/app/config/endpoints/registrationConfig';
import { reportsConfig } from '@/app/config/endpoints/reportsConfig';
import { screenSharingConfig } from '@/app/config/endpoints/screenSharingConfig';
import { securityConfig } from '@/app/config/endpoints/securityConfig';
import { stateGovCitiesConfig } from '@/app/config/endpoints/stateGovCitiesConfig';
import { teamManagementConfig } from '@/app/config/endpoints/teamManagementConfig';
import { themeConfig } from '@/app/config/endpoints/themeConfig';
import { toolbarConfig } from '@/app/config/endpoints/toolbarConfig';
import { tradingConfig } from '@/app/config/endpoints/tradingConfig';
import { userManagementConfig } from '@/app/config/endpoints/userManagementConfig';
import { userRolesConfig } from '@/app/config/endpoints/userRolesConfig';
import { userRolesNFTConfig } from '@/app/config/endpoints/userRolesNFTConfig';
import { userSettingsConfig } from '@/app/config/endpoints/userSettingsConfig';
import { videosConfig } from '@/app/config/endpoints/videosConfig';
import { createMergedEndpoints } from '@/utils/endpointMerger';
import { EndpointDefinition } from '@/app/config/EndpointConfig'
import { buildUrl } from '@/utils/urlBuilder';

// Main endpoint configurations
export const endpointConfigurations: EndpointConfigurations = {
  analytics: analyticsConfig,
  apiConfig: apiEndpointConfig,
  apiWebBase: apiWebBaseConfig,
  auth: authConfig,
  batch: batchConfig,
  blogs: blogsConfig,
  calendar: calendarConfig,
  categories: categoryConfig,
  categoriesEndpoints: categoryConfig, 
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
  dataAnalysis: dataAnalysisConfig,
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
  logs: logsConfig,
  marker: markerConfig,
  messages: messagesConfig,
  moderators: moderatorsConfig,
  monetization: monetizationConfig,
  news: newsConfig,
  notes: notesConfig,
  parameterCustomization: parameterCustomizationConfig,
  participants: participantsConfig,
  payment: paymentConfig,
  personas: personasConfig,
  phases: phasesConfig,
  projectManagement: projectManagementConfig,
  projectOwner: projectOwnerConfig,
  projects: projectsConfig,
  randomWalk: randomWalkConfig,
  realtime: realtimeConfig,
  registration: registrationConfig,
  reports: reportsConfig,
  screenSharing: screenSharingConfig,
  searching: searchingConfig,
  security: securityConfig,
  snapshots: snapshotsConfig,
  sorting: sortingConfig,
  stateGovCities: stateGovCitiesConfig,
  tasks: tasksConfig,
  teamManagement: teamManagementConfig,
  teams: teamsConfig,
  theme: themeConfig,
  toolbar: toolbarConfig,
  todos: todosConfig,
  trading: tradingConfig,
  ui: uiConfig,
  uiSettings: uiSettingsConfig,
  userManagement: userManagementConfig,
  userRoles: userRolesConfig,
  userRolesNFT: userRolesNFTConfig,
  users: usersConfig,
  userSettings: userSettingsConfig,
  version: versionConfig,
  videos: videosConfig,
  web: webConfig,
};

// Export individual configurations for selective imports
export {
  analyticsConfig,
  apiEndpointConfig,
  apiWebBaseConfig,
  authConfig,
  batchConfig,
  blogsConfig,
  calendarConfig,
  categoryConfig,
  chatConfig,
  clientConfig,
  collaborationToolsConfig,
  commentsConfig,
  communicationConfig,
  communityInteractionConfig,
  contentConfig,
  cryptoConfig,
  dataAnalysisConfig,
  databaseConfig,
  dataConfig,
  dataProvidersConfig,
  delegatesConfig,
  detailsConfig,
  devConfig,
  dexConfig,
  documentsConfig,
  donationsConfig,
  drawingConfig,
  externalAuthConfig,
  feedbackConfig,
  filesConfig,
  filteringConfig,
  freelancersConfig,
  generatorsConfig,
  globalCollaborationConfig,
  highlightsConfig,
  loggingConfig,
  logsConfig,
  markerConfig,
  messagesConfig,
  moderatorsConfig,
  monetizationConfig,
  newsConfig,
  notesConfig,
  parameterCustomizationConfig,
  participantsConfig,
  paymentConfig,
  personasConfig,
  phasesConfig,
  projectManagementConfig,
  projectOwnerConfig,
  projectsConfig,
  randomWalkConfig,
  realtimeConfig,
  registrationConfig,
  reportsConfig,
  screenSharingConfig,
  searchingConfig,
  securityConfig,
  snapshotsConfig,
  sortingConfig,
  stateGovCitiesConfig,
  tasksConfig,
  teamManagementConfig,
  teamsConfig,
  themeConfig,
  toolbarConfig,
  todosConfig,
  tradingConfig,
  uiConfig,
  uiSettingsConfig,
  userManagementConfig,
  userRolesConfig,
  userRolesNFTConfig,
  usersConfig,
  userSettingsConfig,
  versionConfig,
  videosConfig,
  webConfig
};

// Merge endpoints and keep strong typing
export const endpoints = createMergedEndpoints(endpointConfigurations);

// Create API config instance with typed endpoints
export const apiConfig = new ApiConfig(
  endpointConfigurations, 
  endpoints
);

// Factory function for custom ApiConfig instances
export const createApiConfig = (
  configurations: EndpointConfigurations,
  endpoints: EndpointConfigurations
): ApiConfig => {
  return new ApiConfig(configurations, endpoints);
};


const getValidatedEndpoint = <T extends keyof EndpointConfigurations>(
  category: T,
  endpointKey: keyof EndpointConfigurations[T]
): EndpointDefinition => {
  // Single type assertion here
  const typedEndpoints = endpoints as EndpointConfigurations;
  const categoryEndpoints = typedEndpoints[category];
  
  if (!categoryEndpoints) {
    throw new Error(`Category '${String(category)}' not found in endpoints`);
  }
  
  const endpoint = categoryEndpoints[endpointKey];
  if (!endpoint) {
    throw new Error(`Endpoint '${String(endpointKey)}' not found in category '${String(category)}'`);
  }
  
  return endpoint;
};


export const getApiEndpoint = <T extends keyof EndpointConfigurations>(
  category: T,
  endpointKey: keyof EndpointConfigurations[T],
  params?: Record<string, any>
) => {
  const endpoint = getValidatedEndpoint(category, endpointKey);
  const url = buildUrl(endpoint, params);
  
  return {
    url,
    config: typeof endpoint === 'function' ? endpoint(params) : endpoint,
    original: endpoint
  };
};

// Also update getApiEndpointUrl to use the same helper
export const getApiEndpointUrl = <T extends keyof EndpointConfigurations>(
  category: T,
  endpointKey: keyof EndpointConfigurations[T],
  params?: Record<string, any>
): string => {
  const endpoint = getValidatedEndpoint(category, endpointKey);
  return buildUrl(endpoint, params);
};

// Export default API instance
export default apiConfig;