endpointConfigurations.ts
import { apiWebBaseConfig } from '@/core/config/endpoints/apiWebBaseConfig';
import { commentsConfig } from '@/core/config/endpoints/commentsConfig';
import { contentConfig } from '@/core/config/endpoints/contentConfig';
import { dataConfig } from '@/core/config/endpoints/dataConfig';
import { delegatesConfig } from '@/core/config/endpoints/delegatesConfig';
import { filteringConfig } from '@/core/config/endpoints/filteringConfig';
import { highlightsConfig } from '@/core/config/endpoints/highlightsConfig';
import { loggingConfig } from '@/core/config/endpoints/loggingConfig';
import { newsConfig } from '@/core/config/endpoints/newsConfig';
import { notesConfig } from '@/core/config/endpoints/notesConfig';
import { projectsConfig } from '@/core/config/endpoints/projectsConfig';
import { searchingConfig } from '@/core/config/endpoints/searchingConfig';
import { snapshotsConfig } from '@/core/config/endpoints/snapshotsConfig';
import { sortingConfig } from '@/core/config/endpoints/sortingConfig';
import { tasksConfig } from '@/core/config/endpoints/tasksConfig';
import { teamsConfig } from '@/core/config/endpoints/teamsConfig';
import { todosConfig } from '@/core/config/endpoints/todosConfig';
import { uiConfig } from '@/core/config/endpoints/uiConfig';
import { uiSettingsConfig } from '@/core/config/endpoints/uiSettingsConfig';
import { usersConfig } from '@/core/config/endpoints/usersConfig';
import { versionConfig } from '@/core/config/endpoints/versionConfig';
import { webConfig } from '@/core/config/endpoints/webConfig';

import { authConfig } from '@/core/config/endpoints/authConfig';
import { blogsConfig } from '@/core/config/endpoints/blogsConfig';
import { calendarConfig } from '@/core/config/endpoints/calendarConfig';
import { categoryConfig } from '@/core/config/endpoints/categoryConfig';
import { chatConfig } from '@/core/config/endpoints/chatConfig';
import { clientConfig } from '@/core/config/endpoints/clientConfig';
import { collaborationToolsConfig } from '@/core/config/endpoints/collaborationToolsConfig';
import { communicationConfig } from '@/core/config/endpoints/communicationConfig';
import { communityInteractionConfig } from '@/core/config/endpoints/communityInteractionConfig';
import { cryptoConfig } from '@/core/config/endpoints/cryptoConfig';
import { dataProvidersConfig } from '@/core/config/endpoints/dataProvidersConfig';
import { detailsConfig } from '@/core/config/endpoints/detailsConfig';
import { dexConfig } from '@/core/config/endpoints/dexConfig';
import { donationsConfig } from '@/core/config/endpoints/donationsConfig';

import ApiConfig from '@/core/api/ApiConfigService';
import { EndpointConfigurations } from '@/core/config/EndpointConfig';
import { analyticsConfig } from '@/core/config/endpoints/analyticsConfig';
import { apiEndpointConfig } from '@/core/config/endpoints/apiEndpointConfig';
import { batchConfig } from '@/core/config/endpoints/batchConfig';
import { dataAnalysisConfig } from '@/core/config/endpoints/dataAnalysisConfig';
import { databaseConfig } from '@/core/config/endpoints/databaseConfig';
import { devConfig } from '@/core/config/endpoints/devConfig';
import { documentsConfig } from '@/core/config/endpoints/documentsConfig';
import { drawingConfig } from '@/core/config/endpoints/drawingConfig';
import { externalAuthConfig } from '@/core/config/endpoints/externalAuthConfig';
import { feedbackConfig } from '@/core/config/endpoints/feedbackConfig';
import { filesConfig } from '@/core/config/endpoints/filesConfig';
import { freelancersConfig } from '@/core/config/endpoints/freelancersConfig';
import { generatorsConfig } from '@/core/config/endpoints/generatorsConfig';
import { globalCollaborationConfig } from '@/core/config/endpoints/globalCollaborationConfig';
import { logsConfig } from '@/core/config/endpoints/logsConfig';
import { markerConfig } from '@/core/config/endpoints/markerConfig';
import { messagesConfig } from '@/core/config/endpoints/messagesConfig';
import { moderatorsConfig } from '@/core/config/endpoints/moderatorsConfig';
import { monetizationConfig } from '@/core/config/endpoints/monetizationConfig';
import { parameterCustomizationConfig } from '@/core/config/endpoints/parameterCustomizationConfig';
import { participantsConfig } from '@/core/config/endpoints/participantsConfig';
import { paymentConfig } from '@/core/config/endpoints/paymentConfig';
import { personasConfig } from '@/core/config/endpoints/personasConfig';
import { phasesConfig } from '@/core/config/endpoints/phasesConfig';
import { projectManagementConfig } from '@/core/config/endpoints/projectManagementConfig';
import { projectOwnerConfig } from '@/core/config/endpoints/projectOwnerConfig';
import { randomWalkConfig } from '@/core/config/endpoints/randomWalkConfig';
import { realtimeConfig } from '@/core/config/endpoints/realtimeConfig';
import { registrationConfig } from '@/core/config/endpoints/registrationConfig';
import { reportsConfig } from '@/core/config/endpoints/reportsConfig';
import { screenSharingConfig } from '@/core/config/endpoints/screenSharingConfig';
import { securityConfig } from '@/core/config/endpoints/securityConfig';
import { stateGovCitiesConfig } from '@/core/config/endpoints/stateGovCitiesConfig';
import { teamManagementConfig } from '@/core/config/endpoints/teamManagementConfig';
import { themeConfig } from '@/core/config/endpoints/themeConfig';
import { toolbarConfig } from '@/core/config/endpoints/toolbarConfig';
import { tradingConfig } from '@/core/config/endpoints/tradingConfig';
import { userManagementConfig } from '@/core/config/endpoints/userManagementConfig';
import { userRolesConfig } from '@/core/config/endpoints/userRolesConfig';
import { userRolesNFTConfig } from '@/core/config/endpoints/userRolesNFTConfig';
import { userSettingsConfig } from '@/core/config/endpoints/userSettingsConfig';
import { videosConfig } from '@/core/config/endpoints/videosConfig';
import { createMergedEndpoints } from '@/utils/endpointMerger';
import { buildUrl } from '@/utils/urlBuilder';

Main endpoint configurations
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

Export individual configurations for selective imports
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
    themeConfig, todosConfig, toolbarConfig, tradingConfig,
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

Merge endpoints and keep strong typing
export const endpoints = createMergedEndpoints(endpointConfigurations);

Create API config instance with typed endpoints
export const apiConfig = new ApiConfig(
  endpointConfigurations, 
  endpoints
);

Factory function for custom ApiConfig instances
export const createApiConfig = (
  configurations: EndpointConfigurations,
  endpoints: EndpointConfigurations
): ApiConfig => {
  return new ApiConfig(configurations, endpoints);
};


export const getValidatedEndpoint = <T extends keyof EndpointConfigurations>(
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

Also update getApiEndpointUrl to use the same helper
export const getApiEndpointUrl = <T extends keyof EndpointConfigurations>(
  category: T,
  endpointKey: keyof EndpointConfigurations[T],
  params?: Record<string, any>
): string => {
  const endpoint = getValidatedEndpoint(category, endpointKey);
  return buildUrl(endpoint, params);
};

Export default API instance
export default apiConfig;