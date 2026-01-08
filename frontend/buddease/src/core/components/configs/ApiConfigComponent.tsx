// ApiConfigComponent.tsx

import { ComponentActions } from '@/core/actions/ComponentActions';
import ApiConfig from "@/core/api/ApiConfigService";
import axiosInstance from '@/core/api/csrfToken';
import '@/core/hooks/userInterface/InputFields';
import { selectApiConfigs } from "@/core/state/redux/slices/ApiSlice";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import ConfigurationServiceComponent from "@/core/components/configs/ConfigurationServiceComponent/ConfigurationServiceComponent";
import TaskTrackingComponent from "@/core/components/models/tracker/TaskTrackingComponent";
import ProfileSetupPhase from "@/core/components/phases/onboarding/ProfileSetupPhase";

import getAppPath from "@/core/config/appStructure/appPath";
import type { UserData } from "@/core/users/User";
import { getCurrentAppInfo } from "@/core/versions/VersionGenerator";

import { ButtonGenerator } from "@/core/generators/GenerateButtons";
import UniqueIDGenerator from "@/core/generators/GenerateUniqueIds";
import useFilePath from "@/core/hooks/useFilePath";

import CreateComponentForm from "@/core/libraries/ui/components/CreateComponentForm";
import DeleteComponent from "@/core/libraries/ui/components/DeleteComponent";
import UpdateComponent from "@/core/libraries/ui/components/UpdateComponent";

import FrontendStructure from "@/core/config/appStructure/FrontendStructure";
import { backendConfig } from "@/core/config/BackendConfig";
import { frontendConfig } from "@/core/config/FrontendConfig";
import MainConfig from "@/core/config/MainConfig";
import DataVersionsConfig from "@/core/configs/DataVersionsConfig";
import BackendStructure from '@/core/server/database/BackendStructure';

import { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import ErrorBoundary from "@/core/shared/ErrorBoundary";

import { userPreferences } from "@/core/config/UserPreferences";
import type { UserPreferences } from "@/core/config/UserPreferences";

import type {
    TrackerEntity,
    TrackerK
} from "@/core/typings/entities/TrackerEntity";
import type { TrackerProps } from '@/core/models/tracker/Tracker';

// ✅ Plugin & Callback Registry imports
import { CallbackRegistry } from '@/core/libraries/eventSystem/callbackRegistry';
import { PluginManager } from "@/core/plugins/PluginManager";


// ===============================================
// ✅ PLUGIN + CALLBACK BOOTSTRAP
// ===============================================
const callbackRegistry = new CallbackRegistry();
const pluginManager = new PluginManager(callbackRegistry);

// Load plugins ONCE
pluginManager.loadAll();

// ===============================================
// ✅ COMPONENT
// ===============================================
const ApiConfigComponent: React.FC = () => {
  const apiConfigsFromRedux = useSelector(selectApiConfigs);
  const [apiConfigs, setApiConfigs] = useState<ApiConfig[]>([]);
  const [filePath, setFilePath] = useState<string>('');
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  const { versionNumber, appVersion } = getCurrentAppInfo();
  const projectPath = getAppPath(versionNumber, appVersion);
  const frontendStructure = new FrontendStructure(projectPath);
  const backendStructure = new BackendStructure(projectPath);

  useEffect(() => {
    const path = useFilePath();
    setFilePath(path);
    setApiConfigs(apiConfigsFromRedux);
  }, [apiConfigsFromRedux]);


  // ===============================================
  // ✅ FORMS & HANDLERS (existing)
  // ===============================================
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const csrfTokenInput = document.querySelector<HTMLInputElement>('[name="csrfmiddlewaretoken"]');
    axiosInstance.defaults.headers.post["X-CSRFToken"] = csrfTokenInput?.value;
    axiosInstance.post("/api/v1/admin/api-config/", { base_url: "https://budde.se" })
  };

  const handleProfileSetupSubmit = async (profileData: UserData) => {
    const csrfTokenInput = document.querySelector<HTMLInputElement>('[name="csrfmiddlewaretoken"]');
    axiosInstance.defaults.headers.post["X-CSRFToken"] = csrfTokenInput?.value;
    setShowProfileSetup(false);
  };


  // ===============================================
  // ✅ TRACKER (your code untouched)
  // ===============================================
  const generateTrackerID = UniqueIDGenerator.generateTrackerID(
    "Sample Tracker",
    NotificationTypeEnum.GENERATED_ID,
    undefined
  );

  const getDynamicTrackerProps = (
    userPreferences: UserPreferences<TrackerEntity, TrackerK>
  ): TrackerProps<any> => ({
    id: userPreferences.trackerId || generateTrackerID,
    name: userPreferences.trackerName || "dynamic-task-tracker",
    phases: userPreferences.phases || [],
    trackFileChanges: (file) => file,
    stroke: { width: userPreferences.strokeWidth || 1, color: userPreferences.strokeColor || "black" },
    strokeWidth: userPreferences.strokeWidth || 2,
    fillColor: userPreferences.fillColor || "blue",
    isFlippedX: userPreferences.isFlippedX || false,
    isFlippedY: userPreferences.isFlippedY || false,
    x: userPreferences.position?.x || 0,
    y: userPreferences.position?.y || 0
  });

  const renderModuleContent = (prefs: any) => {
    if (prefs.modules === "profileManagement") return <ProfileSetupPhase onSubmit={handleProfileSetupSubmit} />;
    if (prefs.modules === "taskTracking") return <TaskTrackingComponent tracker={getDynamicTrackerProps(prefs)} />;
    return null;
  };

  const renderActionContent = () => {
    if (!userPreferences.actions?.length) return null;
    if (userPreferences.actions.includes("create")) return <CreateComponentForm ComponentActions={ComponentActions} />;
    if (userPreferences.actions.includes("update")) return <UpdateComponent />;
    if (userPreferences.actions.includes("delete")) return <DeleteComponent />;
    return null;
  };

  const renderApiContent = () => apiConfigs.map((c) => (
    <div key={c.id}>
      <p>{c.name}</p><p>{c.description}</p><p>{c.baseURL}</p><p>{c.api_key}</p>
    </div>
  ));


  // ===============================================
  // ✅ PLUGIN TEST UI
  // ===============================================
  const fireTestEvent = () => {
    callbackRegistry.executeCallbacks("system/pluginTest", { msg: "Plugin test event" });
  };


  return (
    <div>
      <h2>API Configuration</h2>

      {/* ===== CORE CONFIG FORM ===== */}
      <Form layout="vertical" onFinish={handleFormSubmit} initialValues={apiConfigs}>
        <Form.Item label="API URL" name="apiUrl" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="API Key" name="apiKey" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item>
          <ButtonGenerator type="button" htmlType="submit" />
        </Form.Item>
      </Form>


      {/* ===== PLUGIN PANEL ===== */}
      <div style={{ marginTop: 20, padding: 12, border: "1px solid #ddd", borderRadius: 6 }}>
        <h3>Plugin Manager</h3>

        {pluginManager.list().map((plugin) => (
          <div key={plugin.id} style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{plugin.name}</strong>

            {plugin.enabled ? (
              <Button onClick={() => pluginManager.disable(plugin.id)}>Disable</Button>
            ) : (
              <Button onClick={() => pluginManager.enable(plugin.id)}>Enable</Button>
            )}
          </div>
        ))}

        <Button style={{ marginTop: 10 }} onClick={fireTestEvent}>
          Fire Test Plugin Event
        </Button>
      </div>


      {/* ===== ORIGINAL RENDERS ===== */}
      {renderModuleContent(userPreferences)}
      {renderActionContent()}
      {renderApiContent()}

      <ConfigurationServiceComponent apiConfigs={apiConfigs} />
      <DataVersionsConfig dataPath="" />

      <ErrorBoundary>
        <MainConfig
          frontendStructure={frontendStructure}
          backendStructure={backendStructure}
          frontendConfig={frontendConfig}
          backendConfig={backendConfig}
        />
      </ErrorBoundary>

      {showProfileSetup && <ProfileSetupPhase onSubmit={handleProfileSetupSubmit} />}
    </div>
  );
};

export default ApiConfigComponent;
