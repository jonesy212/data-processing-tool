// EndpointConfigManager.ts
// Automated endpoint configuration manager
import type { EndpointConfigurations } from '@/core/config/EndpointConfig';

class EndpointConfigManager {
  private configMap = new Map<string, any>();
  
  // Register all configurations in one place
  registerConfigs() {
    const configs = {
      // Core endpoints
      apiWebBase: apiWebBaseConfig,
      comments: commentsConfig,
      content: contentConfig,
      data: dataConfig,
      documents: documentsConfig,
      delegates: delegatesConfig,
      web: webConfig,
      sorting: sortingConfig,
      filtering: filteringConfig,
      highlights: highlightsConfig,
      logging: loggingConfig,
      news: newsConfig,
      notes: notesConfig,
      projects: projectsConfig,
      searching: searchingConfig,
      snapshots: snapshotsConfig,
      ui: uiConfig,
      version: versionConfig,
      tasks: tasksConfig,
      teams: teamsConfig,
      todos: todosConfig,
      users: usersConfig,

      // Additional endpoints
      auth: authConfig,
      blogs: blogsConfig,
      calendar: calendarConfig,
      chat: chatConfig,
      client: clientConfig,
      collaborationTools: collaborationToolsConfig,
      communication: communicationConfig,
      communityInteraction: communityInteractionConfig,
      crypto: cryptoConfig,
      dataProviders: dataProvidersConfig,
      dex: dexConfig,
      details: detailsConfig,
      donations: donationsConfig,
      drawing: drawingConfig,
      externalAuth: externalAuthConfig,
      feedback: feedbackConfig,
      files: filesConfig,
      realtime: realtimeConfig,
      freelancers: freelancersConfig,
      generators: generatorsConfig,
      globalCollaboration: globalCollaborationConfig,
      marker: markerConfig,
      moderators: moderatorsConfig,
      monetization: monetizationConfig,
      parameterCustomization: parameterCustomizationConfig,
      payment: paymentConfig,
      personas: personasConfig,
      phases: phasesConfig,
      projectManagement: projectManagementConfig,
      projectOwner: projectOwnerConfig,
      randomWalk: randomWalkConfig,
      registration: registrationConfig,
      reports: reportsConfig,
      security: securityConfig,
      stateGovCities: stateGovCitiesConfig,
      teamManagement: teamManagementConfig,
      theme: themeConfig,
      toolbar: toolbarConfig,
      trading: tradingConfig,
      userManagement: userManagementConfig,
      userRoles: userRolesConfig,
      userRolesNFT: userRolesNFTConfig,
      userSettings: userSettingsConfig,
      videos: videosConfig,
      database: databaseConfig,
      apiConfig: apiEndpointConfig,
      dev: devConfig,
      participants: participantsConfig,
      messages: messagesConfig,
      screenSharing: screenSharingConfig,
      dataAnalysis: dataAnalysisConfig,
      logs: logsConfig,
      batch: batchConfig,
    };

    Object.entries(configs).forEach(([key, config]) => {
      this.configMap.set(key, config);
    });
  }

  // Get all configurations as EndpointConfigurations
  getEndpointConfigurations(): EndpointConfigurations {
    const configs: any = {};
    this.configMap.forEach((value, key) => {
      configs[key] = value;
    });
    return configs as EndpointConfigurations;
  }

  // Get individual config exports
  getIndividualExports() {
    const exports: any = {};
    this.configMap.forEach((value, key) => {
      // Convert key to camelCase for export name (e.g., apiWebBase -> apiWebBaseConfig)
      const exportKey = `${key}Config`;
      exports[exportKey] = value;
    });
    return exports;
  }

  // Add new endpoint group dynamically
  addEndpointGroup(name: string, config: any) {
    this.configMap.set(name, config);
  }

  // Remove endpoint group
  removeEndpointGroup(name: string) {
    this.configMap.delete(name);
  }

  // List all available endpoint groups
  listEndpointGroups(): string[] {
    return Array.from(this.configMap.keys());
  }
}

// Initialize the manager
const endpointManager = new EndpointConfigManager();
endpointManager.registerConfigs();

// Export everything from the manager
export const endpointConfigurations = endpointManager.getEndpointConfigurations();
export const individualExports = endpointManager.getIndividualExports();

// Destructure individual exports for backward compatibility
export const {
  apiWebBaseConfig,
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
  communicationConfig,
  communityInteractionConfig,
  cryptoConfig,
  dataProvidersConfig,
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
  databaseConfig,
  apiEndpointConfig,
  devConfig,
  participantsConfig,
  messagesConfig,
  screenSharingConfig,
  dataAnalysisConfig,
  logsConfig,
  batchConfig,
} = individualExports;