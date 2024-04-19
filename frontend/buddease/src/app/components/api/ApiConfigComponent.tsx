// ApiConfigComponent.tsx
import { User } from "@/app/components/users/User";
import { backendConfig } from "@/app/configs/BackendConfig";
import { ApiConfig } from "@/app/configs/ConfigurationService";
import ConfigurationServiceComponent from "@/app/configs/ConfigurationServiceComponent /ConfigurationServiceComponent";
import DataVersionsConfig from "@/app/configs/DataVersionsConfig";
import { frontendConfig } from "@/app/configs/FrontendConfig";
import MainConfig from "@/app/configs/MainConfig";
import UserPreferences from "@/app/configs/UserPreferences";
import UserSettings from "@/app/configs/UserSettings";
import BackendStructure from "@/app/configs/appStructure/BackendStructure";
import FrontendStructure from "@/app/configs/appStructure/FrontendStructure";
import { ButtonGenerator } from "@/app/generators/GenerateButtons";
import { Form, Input } from "antd"
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import getAppPath from "../../../../appPath";
import { DocumentData } from "../documents/DocumentBuilder";
import { ComponentActions } from "../libraries/ui/components/ComponentActions";
import CreateComponentForm from "../libraries/ui/components/CreateComponentForm";
import DeleteComponent from "../libraries/ui/components/DeleteComponent";
import UpdateComponent from "../libraries/ui/components/UpdateComponent";
import TaskTrackingComponent from "../models/tracker/TaskTrackingComponent";
import { Phase } from "../phases/Phase";
import ProfileSetupPhase from "../phases/onboarding/ProfileSetupPhase";
import axiosInstance from "../security/csrfToken";
import { selectApiConfigs } from "../state/redux/slices/ApiSlice";
import { UserData } from "../users/User";
import ErrorBoundary from "@/app/shared/ErrorBoundary";
import { getCurrentAppInfo } from "../versions/VersionGenerator";
import useFilePath from "../hooks/useFilePath";
import FileData from '../models/data/FileData';

const ApiConfigComponent: React.FC = () => {
  const [apiConfigs, setApiConfigs] = useState<ApiConfig[]>([]); // Specify correct type
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const userPreferences = useSelector((state: any) => state.userPreferences);
  const [filePath, setFilePath] = useState<string>('');

  // Access API configurations from Redux state
  const apiConfigsFromRedux = useSelector(selectApiConfigs);

  const { versionNumber, appVersion } = getCurrentAppInfo();
  const projectPath = getAppPath(versionNumber, appVersion);
  const frontendStructure = new FrontendStructure(projectPath);
  const backendStructure = new BackendStructure(projectPath);

  // Update local state with API configurations from Redux state
  useEffect(() => {

    const path = useFilePath();
    setFilePath(path);
    setApiConfigs(apiConfigsFromRedux);
  }, [apiConfigsFromRedux]);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission
    const csrfTokenInput = document.querySelector<HTMLInputElement>(
      '[name="csrfmiddlewaretoken"]'
    );

    axiosInstance.defaults.headers.post["X-CSRFToken"] = csrfTokenInput?.value;
    axiosInstance
      .post("/api/v1/admin/api-config/", { base_url: "https://budde.se" })
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
    // Handle form submission
  };

  const handleProfileSetupSubmit = async (profileData: UserData) => {
    // Handle profile setup form submission
    const csrfTokenInput = document.querySelector<HTMLInputElement>(
      '[name="csrfmiddlewaretoken"]'
    );
    axiosInstance.defaults.headers.post["X-CSRFToken"] = csrfTokenInput?.value;
    setShowProfileSetup(false);
  };

  // Example usage of userPreferences.modules, userPreferences.actions, and userPreferences.reducers
  const renderModuleContent = (userPreferences: typeof UserPreferences) => {
    switch (userPreferences.modules) {
      case "profileManagement":
        return <ProfileSetupPhase onSubmit={handleProfileSetupSubmit} />;
      case "taskTracking":
        return (
          <TaskTrackingComponent
            tracker={{
              name: "task-tracker",
              id: "taskId",
              phases: {} as Phase[],
              trackFileChanges: (file: FileData) => file,
              trackFolderChanges(
                content: FileData,
                fileLoader?: DocumentData,
              ) {
                // Make fileLoader optional
                if (fileLoader) {
                  // Add a null check
                  if (typeof fileLoader.load === "function") {
                    // Check if load method exists
                    fileLoader.load(content); // Invoke load method if it exists
                    return fileLoader.files;
                  } else {
                    console.error(
                      "load() method is not defined on fileLoader."
                    );
                    return [];
                  }
                }
                return []; // Return a default value if fileLoader is undefined
              },
              getUserProfile: (user: User) => user,
              getName: (trackerName: string) => trackerName,
              updateUserProfile(userData: User) {
                // Implement user profile update logic here
                console.log("Updating user profile:", userData);
                return userData;
              },
              sendNotification: (notification: string, userData: User) => {
                // Implement notification sending logic here
                console.log("Sending notification:", notification, userData);
                return notification;
              },
            }}
          />
        );
      // Add cases for other module types
      default:
        return null; // Default content if module type is not specified
    }
  };

  const renderActionContent = () => {
    switch (userPreferences.actions) {
      case "create":
        return <CreateComponentForm ComponentActions={ComponentActions} />;

      case "update":
        return <UpdateComponent />;
      case "delete":
        return <DeleteComponent />;
      // Add cases for other action types
      default:
        return null; // Default content if action type is not specified
    }
  };

  // Example usage of API configurations
  const renderApiContent = () => {
    return apiConfigs.map((config) => (
      <div key={config.id}>
        {/* Render content based on API configurations */}
        <p>{config.name}</p>
        <p>{config.description}</p>
        <p>{config.baseURL}</p>
        <p>{config.api_key}</p>

        {/* Add more content based on other properties of config */}
      </div>
    ));
  };

  return (
    <div>
      <h2>API Configuration</h2>
      <Form
        layout="vertical"
        onFinish={handleFormSubmit}
        initialValues={apiConfigs}
      >
        <Form.Item
          label="API URL"
          name="apiUrl"
          rules={[{ required: true, message: "API URL is required" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="API Key"
          name="apiKey"
          rules={[{ required: true, message: "API Key is required" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item>
          <ButtonGenerator type="button" htmlType="submit" />
        </Form.Item>
      </Form>
      {/* Configuration and Settings */}
      {renderModuleContent(userPreferences)}
      {renderActionContent()}
      {renderApiContent()}
      <ConfigurationServiceComponent apiConfigs={apiConfigs} />
      <DataVersionsConfig dataPath="" />
      <ErrorBoundary>
        <MainConfig
          frontendStructure={frontendStructure} // Corrected variable name
          backendStructure={backendStructure} // Corrected variable name
          frontendConfig={frontendConfig}
          backendConfig={backendConfig}
        />
      </ErrorBoundary>

      {userPreferences}
      {UserSettings}
      {/* Additional configurations can be added here */}

      {showProfileSetup && (
        <ProfileSetupPhase onSubmit={handleProfileSetupSubmit} />
      )}
      {renderApiContent()}
      {/* Additional configurations and settings */}
    </div>
  );
};

export default ApiConfigComponent;
