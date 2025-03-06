// DynamicStoreGenerator.tsx
import * as path from 'path';
import { generateStores } from '../components/state/stores/StoreGenerator';

const srcPath = path.join(__dirname, 'src');

interface StoreMetadataEntry {
    name: string;
    components: string[];
}

const validateStoreMetadata = (metadata: StoreMetadataEntry[]) => {
    metadata.forEach(entry => {
        if (!entry.name || !entry.components || !Array.isArray(entry.components)) {
            throw new Error('Invalid storeMetadata entry: ' + JSON.stringify(entry));
        }
    });
};


// Analyze project structure and extract metadata
const storeMetadata = [
  { name: 'BrowserCompatibility', components: ['BrowserCheckStore'] },
  { name: 'AuthenticationStore', components: ['auth', 'auth_routes'] },
  { name: 'CompanyStore', components: ['company', 'company_recruiters'] },
  { name: 'UserStore', components: ['user'] },
  { name: 'TaskStore', components: ['task', 'task_history'] },
  { name: 'DatasetStore', components: ['dataset', 'handle_uploaded_dataset'] },
  { name: 'DashboardStore', components: ['dashboard'] },
  { name: 'LoggersStore', components: ['loggers', 'errorhandling'] },
  { name: 'RateLimitingStore', components: ['rate_limiting'] },
  { name: 'ConfigsStore', components: ['configs', 'jwt_config'] },
  { name: 'UserFeedbackStore', components: ['user', 'user_support'] },
  { name: 'TestingStore', components: ['testing', 'data_analysis', 'dataprocessing', 'datapreview'] },
  { name: 'PreprocessingStore', components: ['preprocessing', 'feature_engineering'] },
  { name: 'PermissionsStore', components: ['permissions'] },
  { name: 'SecurityStore', components: ['security'] },
  { name: 'SessionStore', components: ['session'] },
  { name: 'SystemUtilsStore', components: ['system_utils'] },
  { name: 'ScriptCommandsStore', components: ['script_commands'] },

  // Frontend MobX Stores
  { name: 'BrowserCheckStore', components: ['BrowserCompatibiity'] },
  { name: 'FeedbackLoopStore', components: ['FeedbackLoop'] },
  { name: 'LazyIconPropsStore', components: ['LazyIconProps'] },
  { name: 'NamingConventionsStore', components: ['NamingConventions'] },
  { name: 'ToolsStore', components: ['Tools'] },
  { name: 'ActionsStore', components: ['actions'] },
  { name: 'AuthStore', components: ['auth'] },
  { name: 'CardsStore', components: ['cards'] },
  { name: 'CommunicationsStore', components: ['communications'] },
  { name: 'ContainersStore', components: ['containers'] },
  { name: 'DashboardsStore', components: ['dashboards'] },
  { name: 'ListsStore', components: ['lists'] },
  { name: 'OnboardingStore', components: ['onboarding'] },
  { name: 'PromptsStore', components: ['prompts'] },
  { name: 'RoutingStore', components: ['routing'] },
  { name: 'StylingStore', components: ['styling'] },
  { name: 'SupportStore', components: ['support'] },
  { name: 'VersionsStore', components: ['versions'] }, 
    // Add more metadata entries as needed
];


// Call the validation function
validateStoreMetadata(storeMetadata);

// Generate stores based on metadata
generateStores(storeMetadata);
