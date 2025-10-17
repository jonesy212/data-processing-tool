// endpointManager.ts
import { uiSettingsConfig } from '@/config/endpoints/uiSettingsConfig'
import { EndpointConfigurations } from '@/config/EndpointConfig';
import { analyticsConfig } from '@/config/endpoints/analyticsConfig';

import { searchOptions } from '@/app/pages/searches/SearchOptions';
import useSearchOptions from "@/app/pages/searches/useSearchOptions";
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


class EndpointConfigManager {
  private configMap = new Map<keyof EndpointConfigurations, any>();
  
  registerConfigs() {
    // Register ALL configs matching your EndpointConfigurations interface
    this.configMap.set('teams', teamsConfig);
    this.configMap.set('users', usersConfig);
    this.configMap.set('dev', devConfig);
    this.configMap.set('data', dataConfig);
    this.configMap.set('documents', documentsConfig);
    this.configMap.set('delegates', delegatesConfig);
    this.configMap.set('web', webConfig);
    this.configMap.set('sorting', sortingConfig);
    this.configMap.set('filtering', filteringConfig);
    this.configMap.set('highlights', highlightsConfig);
    this.configMap.set('logging', loggingConfig);
    this.configMap.set('news', newsConfig);
    this.configMap.set('notes', notesConfig);
    this.configMap.set('projects', projectsConfig);
    this.configMap.set('searching', searchingConfig);
    this.configMap.set('snapshots', snapshotsConfig);
    this.configMap.set('ui', uiConfig);
    this.configMap.set('version', versionConfig);
    this.configMap.set('tasks', tasksConfig);
    this.configMap.set('todos', todosConfig);
    this.configMap.set('auth', authConfig);
    this.configMap.set('blogs', blogsConfig);
    this.configMap.set('calendar', calendarConfig);
    this.configMap.set('chat', chatConfig);
    this.configMap.set('client', clientConfig);
    this.configMap.set('collaborationTools', collaborationToolsConfig);
    this.configMap.set('communication', communicationConfig);
    this.configMap.set('communityInteraction', communityInteractionConfig);
    this.configMap.set('crypto', cryptoConfig);
    this.configMap.set('dataProviders', dataProvidersConfig);
    this.configMap.set('dex', dexConfig);
    this.configMap.set('details', detailsConfig);
    this.configMap.set('donations', donationsConfig);
    this.configMap.set('drawing', drawingConfig);
    this.configMap.set('externalAuth', externalAuthConfig);
    this.configMap.set('feedback', feedbackConfig);
    this.configMap.set('files', filesConfig);
    this.configMap.set('realtime', realtimeConfig);
    this.configMap.set('freelancers', freelancersConfig);
    this.configMap.set('generators', generatorsConfig);
    this.configMap.set('globalCollaboration', globalCollaborationConfig);
    this.configMap.set('marker', markerConfig);
    this.configMap.set('moderators', moderatorsConfig);
    this.configMap.set('monetization', monetizationConfig);
    this.configMap.set('parameterCustomization', parameterCustomizationConfig);
    this.configMap.set('payment', paymentConfig);
    this.configMap.set('personas', personasConfig);
    this.configMap.set('phases', phasesConfig);
    this.configMap.set('projectManagement', projectManagementConfig);
    this.configMap.set('projectOwner', projectOwnerConfig);
    this.configMap.set('randomWalk', randomWalkConfig);
    this.configMap.set('registration', registrationConfig);
    this.configMap.set('reports', reportsConfig);
    this.configMap.set('security', securityConfig);
    this.configMap.set('stateGovCities', stateGovCitiesConfig);
    this.configMap.set('teamManagement', teamManagementConfig);
    this.configMap.set('theme', themeConfig);
    this.configMap.set('toolbar', toolbarConfig);
    this.configMap.set('trading', tradingConfig);
    this.configMap.set('userManagement', userManagementConfig);
    this.configMap.set('userRoles', userRolesConfig);
    this.configMap.set('userRolesNFT', userRolesNFTConfig);
    this.configMap.set('userSettings', userSettingsConfig);
    this.configMap.set('videos', videosConfig);
    this.configMap.set('database', databaseConfig);
    this.configMap.set('apiConfig', apiEndpointConfig);
    this.configMap.set('participants', participantsConfig);
    this.configMap.set('messages', messagesConfig);
    this.configMap.set('screenSharing', screenSharingConfig);
    this.configMap.set('dataAnalysis', dataAnalysisConfig);
    this.configMap.set('logs', logsConfig);
    this.configMap.set('batch', batchConfig);
    this.configMap.set('analytics', analyticsConfig);
    this.configMap.set('uiSettings', uiSettingsConfig);

    
    // Add any new ones here as you create them
  }

  getEndpointConfigurations(): EndpointConfigurations {
    const configs: Partial<EndpointConfigurations> = {};
    this.configMap.forEach((value, key) => {
      configs[key as keyof EndpointConfigurations] = value;
    });
    return configs as EndpointConfigurations;
  }

  // For adding new endpoint groups
  addEndpointGroup<T extends keyof EndpointConfigurations>(
    name: T, 
    config: EndpointConfigurations[T]
  ) {
    this.configMap.set(name, config);
  }

  listEndpointGroups(): string[] {
    return Array.from(this.configMap.keys());
  }
}

// Initialize and export
const endpointManager = new EndpointConfigManager();
endpointManager.registerConfigs();

export const endpointConfigurations = endpointManager.getEndpointConfigurations();
export { endpointManager };