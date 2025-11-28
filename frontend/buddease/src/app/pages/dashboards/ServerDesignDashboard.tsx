// ServerDesignDashboard.tsx
// ServerDesignDashboard.ts
import { DesignDashboardBaseProps } from '@/app/pages/dashboards/DesignDashboard';
import { ApiConfig } from '@/app/services/ConfigurationService';

import Documentation from "@/app/components/styling/Documentation";
import MainConfig from "@/app/config/MainConfig";
import UserPreferences from "@/app/config/UserPreferences";
import UserSettings from "@/app/config/UserSettings";
import DataVersionsConfig from "@/app/configs/DataVersionsConfig";
import BatchProcessingAndCache from "@/utils/BatchProcessingAndCache";
import React, { useEffect } from "react";

interface ServerDesignDashboardProps extends DesignDashboardBaseProps {
    // Server-specific props
    apiConfigs: ApiConfig[];
    onConfigUpdate: (configs: ApiConfig[]) => void;
    // Other server-only props...
}
  

import { BackendStructureWrapper } from '@/app/components/backend/BackendStructureWrapper';
import { selectApiConfigs } from '@/app/store/slices/apiConfigSlice';
import { getAppPath } from '@/app/utils/pathUtils';
import { useSelector } from 'react-redux';

interface ServerDesignDashboardProps extends DesignDashboardBaseProps {
  // Server-specific props
  apiConfigs?: ApiConfig[];
  onConfigUpdate?: (configs: ApiConfig[]) => void;
}

const ServerDesignDashboard: React.FC<ServerDesignDashboardProps> = ({
  backendStructure,
  frontendStructure,
}) => {
  // Server-specific state
  const versionNumber = backendConfig.versionNumber;
  const appVersion = backendConfig.appVersion;
  const apiConfigs = useSelector(selectApiConfigs);
  const backendStructureWrapper = new BackendStructureWrapper(
    getAppPath(versionNumber, appVersion)
  );

  // Server-specific initialization
  useEffect(() => {
    // Server-side initialization logic
    lazyLoadScriptConfig.configureScript();
  }, []);

  return (
    <>
      <h1>Server Design Dashboard</h1>

      {/* Server Configuration Components */}
      <BackendConfigComponent backendConfig={backendConfig} />
      <FrontendConfigComponent config={frontendConfig} />
      <ConfigurationServiceComponent apiConfigs={apiConfigs} />
      
      {/* Structure Viewers */}
      <FrontendStructureViewer frontendStructure={frontendStructure} />
      <BackendStructureViewer backendStructure={backendStructure} />

      {/* Server Management Components */}
      <ApiConfigComponent />
      <DataVersionsConfig dataPath="" />
      <DocumentBuilderConfigComponent config={{} as DocumentBuilderConfig} />
      <MainConfig
        frontendStructure={frontendStructure}
        backendStructure={backendStructure}
        frontendConfig={frontendConfig}
        backendConfig={backendConfig}
      />

      {/* Cache Management */}
      <CacheManager />
      <BatchProcessingAndCache />
      <AppCacheManagerBase />
      <CacheUtils />
      <CleanupUtil />
      <FrontendCacheManager />
      <ReadAndWriteCache />

      {/* Data Processing */}
      <DataProcessingComponent datasetPath="" onDataProcessed={() => {}} />
      <DetermineFileType />
      <GenerateCache />
      <GenerateComponent />
      <GenerateChatInterfaces />
      <GeneratedInterfaces />

      {/* Metadata & Preferences */}
      <MetadataViewer metadata={{}} />
      <UserPreference />
      <GenerateUserPreferences />
      <UserPreferences />
      <UserSettings />

      {/* Utility Components */}
      <Global />
      <TraverseFrontend />
      <StyleSheet />
      <Favicon />
      <Documentation />
      <VersioningComponent version={""} />
    </>
  );
};

export default ServerDesignDashboard;

export type { ServerDesignDashboardProps };
