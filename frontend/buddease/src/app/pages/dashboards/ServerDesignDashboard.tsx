// ServerDesignDashboard.ts
import { ApiConfig } from '@/app/configs/ConfigurationService';
import { DesignDashboardBaseProps } from '@/app/pages/dashboards/DesignDashboard';

import Documentation from "@/app/components/styling/Documentation";
import BatchProcessingAndCache from "@/app/utils/BatchProcessingAndCache";
import MainConfig from "@/config/MainConfig";
import UserPreferences from "@/config/UserPreferences";
import UserSettings from "@/config/UserSettings";
import DataVersionsConfig from "@/configs/DataVersionsConfig";
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
      <UpdatePreference />
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
