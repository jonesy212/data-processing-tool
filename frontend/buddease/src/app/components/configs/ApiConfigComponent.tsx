// ApiConfigComponent.tsx

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Form, Input, Button } from "antd";

import axiosInstance from '@/app/api/csrfToken';
import ApiConfig from "@/app/api/ApiConfig";
import { selectApiConfigs } from "@/app/state/redux/slices/ApiSlice";

import ConfigurationServiceComponent from "@/app/components/configs/ConfigurationServiceComponent/ConfigurationServiceComponent";
import TaskTrackingComponent from "@/app/components/models/tracker/TaskTrackingComponent";
import ProfileSetupPhase from "@/app/components/phases/onboarding/ProfileSetupPhase";

import { UserData } from "@/app/users/User";
import { getCurrentAppInfo } from "@/app/versions/VersionGenerator";
import getAppPath from "@/app/config/appStructure/appPath";

import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { ButtonGenerator } from "@/app/generators/GenerateButtons";
import useFilePath from "@/app/hooks/useFilePath";

import CreateComponentForm from "@/app/libraries/ui/components/CreateComponentForm";
import DeleteComponent from "@/app/libraries/ui/components/DeleteComponent";
import UpdateComponent from "@/app/libraries/ui/components/UpdateComponent";

import MainConfig from "@/app/config/MainConfig";
import { frontendConfig } from "@/app/config/FrontendConfig";
import { backendConfig } from "@/configs/BackendConfig";
import FrontendStructure from "@/app/config/appStructure/FrontendStructure";
import BackendStructure from '@/app/server/database/BackendStructure';
import DataVersionsConfig from "@/app/configs/DataVersionsConfig";

import ErrorBoundary from "@/app/shared/ErrorBoundary";
import { NotificationTypeEnum } from '@/app/context/NotificationContext';

import { userPreferences, UserPreferences } from "@/app/config/UserPreferences";
import UserSettings from "@/app/config/UserSettings";

import {
  TrackerProps,
  AppFileEntity,
  FileK,
  FileMeta,
  FileAttachment,
  FileExcludedFields,
  FileIncludedFields,
  TrackerEntity,
  TrackerK,
  TrackerMeta,
  TrackerAttachment,
  TrackerExcludedFields,
  TrackerIncludedFields
} from "@/app/typings/entities/*";

// ✅ Plugin & Callback Registry imports
import { PluginManager } from "@/app/plugins/PluginManager";
import { CallbackRegistry } from "@/app/events/CallbackRegistry";


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
    userPreferences: UserPreferences<TrackerEntity, TrackerK, TrackerMeta, TrackerAttachment, TrackerExcludedFields, TrackerIncludedFields>
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
