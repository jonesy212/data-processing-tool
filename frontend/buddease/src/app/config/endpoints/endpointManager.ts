// endpointManager.ts
import { uiSettingsConfig } from '@/app/config/endpoints/uiSettingsConfig'
import { EndpointConfigurations } from '@/app/config/EndpointConfig';
import { analyticsConfig } from '@/app/config/endpoints/analyticsConfig';

import { searchOptions } from '@/app/pages/searches/SearchOptions';
import useSearchOptions from "@/app/pages/searches/useSearchOptions";
import { usersConfig } from '@/app/config/endpoints/usersConfig';
import { apiWebBaseConfig } from '@/app/config/endpoints/apiWebBaseConfig';
import { commentsConfig } from '@/app/config/endpoints/commentsConfig';
import { contentConfig } from '@/app/config/endpoints/contentConfig';
import { dataConfig } from '@/app/config/endpoints/dataConfig';
import { delegatesConfig } from '@/app/config/endpoints/delegatesConfig';
import { webConfig } from '@/app/config/endpoints/webConfig';
import { sortingConfig } from '@/app/config/endpoints/sortingConfig';
import { filteringConfig } from '@/app/config/endpoints/filteringConfig';
import { highlightsConfig } from '@/app/config/endpoints/highlightsConfig';
import { loggingConfig } from '@/app/config/endpoints/loggingConfig';
import { newsConfig } from '@/app/config/endpoints/newsConfig';
import { notesConfig } from '@/app/config/endpoints/notesConfig';
import { projectsConfig } from '@/app/config/endpoints/projectsConfig';
import { searchingConfig } from '@/app/config/endpoints/searchingConfig';
import { snapshotsConfig } from '@/app/config/endpoints/snapshotsConfig';
import { uiConfig } from '@/app/config/endpoints/uiConfig';
import { versionConfig } from '@/app/config/endpoints/versionConfig';
import { tasksConfig } from '@/app/config/endpoints/tasksConfig';
import { teamsConfig } from '@/app/config/endpoints/teamsConfig';
import { todosConfig } from '@/app/config/endpoints/todosConfig';

import { authConfig } from '@/app/config/endpoints/authConfig';
import { blogsConfig } from '@/app/config/endpoints/blogsConfig';
import { calendarConfig } from '@/app/config/endpoints/calendarConfig';
import { chatConfig } from '@/app/config/endpoints/chatConfig';
import { clientConfig } from '@/app/config/endpoints/clientConfig';
import { collaborationToolsConfig } from '@/app/config/endpoints/collaborationToolsConfig';
import { communicationConfig } from '@/app/config/endpoints/communicationConfig';
import { communityInteractionConfig } from '@/app/config/endpoints/communityInteractionConfig';
import { cryptoConfig } from '@/app/config/endpoints/cryptoConfig';
import { dataProvidersConfig } from '@/app/config/endpoints/dataProvidersConfig';
import { dexConfig } from '@/app/config/endpoints/dexConfig';
import { detailsConfig } from '@/app/config/endpoints/detailsConfig';
import { donationsConfig } from '@/app/config/endpoints/donationsConfig';

import { drawingConfig } from '@/app/config/endpoints/drawingConfig';
import { externalAuthConfig } from '@/app/config/endpoints/externalAuthConfig';
import { feedbackConfig } from '@/app/config/endpoints/feedbackConfig';
import { filesConfig } from '@/app/config/endpoints/filesConfig';
import { freelancersConfig } from '@/app/config/endpoints/freelancersConfig';
import { generatorsConfig } from '@/app/config/endpoints/generatorsConfig';
import { globalCollaborationConfig } from '@/app/config/endpoints/globalCollaborationConfig';
import { markerConfig } from '@/app/config/endpoints/markerConfig';
import { moderatorsConfig } from '@/app/config/endpoints/moderatorsConfig';
import { monetizationConfig } from '@/app/config/endpoints/monetizationConfig';
import { parameterCustomizationConfig } from '@/app/config/endpoints/parameterCustomizationConfig';
import { paymentConfig } from '@/app/config/endpoints/paymentConfig';
import { personasConfig } from '@/app/config/endpoints/personasConfig';
import { phasesConfig } from '@/app/config/endpoints/phasesConfig';
import { projectManagementConfig } from '@/app/config/endpoints/projectManagementConfig';
import { projectOwnerConfig } from '@/app/config/endpoints/projectOwnerConfig';
import { randomWalkConfig } from '@/app/config/endpoints/randomWalkConfig';
import { registrationConfig } from '@/app/config/endpoints/registrationConfig';
import { reportsConfig } from '@/app/config/endpoints/reportsConfig';
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
import { databaseConfig } from '@/app/config/endpoints/databaseConfig';
import { apiEndpointConfig } from '@/app/config/endpoints/apiEndpointConfig';
import { devConfig } from '@/app/config/endpoints/devConfig';
import { documentsConfig } from '@/app/config/endpoints/documentsConfig';
import { participantsConfig } from '@/app/config/endpoints/participantsConfig';
import { messagesConfig } from '@/app/config/endpoints/messagesConfig';
import { screenSharingConfig } from '@/app/config/endpoints/screenSharingConfig';
import { dataAnalysisConfig } from '@/app/config/endpoints/dataAnalysisConfig';
import { logsConfig } from '@/app/config/endpoints/logsConfig';
import { realtimeConfig } from '@/app/config/endpoints/realtimeConfig';
import { batchConfig } from '@/app/config/endpoints/batchConfig';


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