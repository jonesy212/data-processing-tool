// ApiConfigComponent.tsx
import { NotificationTypeEnum } from '@/app/components/support/NotificationContext';
import { User } from "@/app/components/users/User";
import { backendConfig } from "@/app/configs/BackendConfig";
import { ApiConfig } from "@/app/configs/ConfigurationService";
import ConfigurationServiceComponent from "@/app/configs/ConfigurationServiceComponent /ConfigurationServiceComponent";
import DataVersionsConfig from "@/app/configs/DataVersionsConfig";
import { frontendConfig } from "@/app/configs/FrontendConfig";
import MainConfig from "@/app/configs/MainConfig";
import { UserPreferences, userPreferences } from "@/app/configs/UserPreferences";
import UserSettings from "@/app/configs/UserSettings";
import BackendStructure from "@/app/configs/appStructure/BackendStructure";
import FrontendStructure from "@/app/configs/appStructure/FrontendStructure";
import { ButtonGenerator } from "@/app/generators/GenerateButtons";
import ErrorBoundary from "@/app/shared/ErrorBoundary";
import { Form, Input } from "antd";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import getAppPath from "../../../appPath";
import useFilePath from "../components/hooks/useFilePath";
import { ComponentActions } from "../components/libraries/ui/components/ComponentActions";
import CreateComponentForm from "../components/libraries/ui/components/CreateComponentForm";
import DeleteComponent from "../components/libraries/ui/components/DeleteComponent";
import UpdateComponent from "../components/libraries/ui/components/UpdateComponent";
import FileData from '../components/models/data/FileData';
import TaskTrackingComponent from "../components/models/tracker/TaskTrackingComponent";
import { TrackerProps } from "../components/models/tracker/Tracker";
import { Phase } from "../components/phases/Phase";
import ProfileSetupPhase from "../components/phases/onboarding/ProfileSetupPhase";
import axiosInstance from "../components/security/csrfToken";
import { selectApiConfigs } from "../components/state/redux/slices/ApiSlice";
import { UserData } from "../components/users/User";
import { getCurrentAppInfo } from "../components/versions/VersionGenerator";
import UniqueIDGenerator from "../generators/GenerateUniqueIds";
 


const handleFileChanges = (file: FileData): FileData => file; // Handles file change logic

const ApiConfigComponent: React.FC = () => {
  // Access API configurations from Redux state
  const apiConfigsFromRedux = useSelector(selectApiConfigs);
  const [filePath, setFilePath] = useState<string>('');
  const [apiConfigs, setApiConfigs] = useState<ApiConfig[]>([]); // Initialize as empty array
  const { versionNumber, appVersion } = getCurrentAppInfo();
  const projectPath = getAppPath(versionNumber, appVersion);
  const frontendStructure = new FrontendStructure(projectPath);
  const backendStructure = new BackendStructure(projectPath);
  const [showProfileSetup, setShowProfileSetup] = useState<boolean>(false); // Initialize state

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



  const generateTrackerID = UniqueIDGenerator.generateTrackerID(
    "Sample Tracker", // Provide a meaningful name
    NotificationTypeEnum.GeneratedID, // Replace with actual NotificationTypeEnum value
    undefined // Pass undefined or a valid id
  );
   
// Function to generate dynamic tracker props based on user preferences or conditions
const getDynamicTrackerProps = (userPreferences: UserPreferences): TrackerProps => {
  return {
    id: userPreferences.trackerId || generateTrackerID, // Function to dynamically generate or fetch the tracker ID
    name: "dynamic-task-tracker", // You can set this dynamically based on preferences
    phases: [], // Dynamically fetch or calculate the phases here
    trackFileChanges: (file: FileData) => handleFileChanges(file), // Your dynamic file handler

    // Dynamic stroke settings based on user preferences
    stroke: {
      width: userPreferences.strokeWidth || 1, // Default to 1 if undefined
      color: userPreferences.strokeColor || "black" // Default to "black" if undefined
    },
    strokeWidth: userPreferences.strokeWidth || 2, // Default value if undefined
    fillColor: userPreferences.fillColor || "blue", // Default value if undefined
    isFlippedX: userPreferences.isFlippedX || false, // Set dynamically based on user preferences
    isFlippedY: userPreferences.isFlippedY || false, // Set dynamically based on user preferences
    x: userPreferences.position?.x || 0, // Dynamic X-coordinate (default to 0)
    y: userPreferences.position?.y || 0  // Dynamic Y-coordinate (default to 0)
  };
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
              // Updated key-value pairs
              stroke: {
                width: 0,
                color: "black"
              }, 
              strokeWidth: 2,   // Replace with actual stroke width value
              fillColor: "blue", // Replace with actual fill color
              isFlippedX: false,   // Set isFlippedX as true/false based on condition
              isFlippedY: false,   // Set isFlippedY as true/false based on condition
              x: 10,             // X-coordinate (replace with actual value)
              y: 20,             // Y-coordinate (replace with actual value)
          trackFolderChanges(
                content: FileData,
                fileLoader?: FileData,
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
            }
            }
          />
        );
      // Add cases for other module types
      default:
        return null; // Default content if module type is not specified
    }
  };

  const renderActionContent = () => {
    if (userPreferences.actions && userPreferences.actions.length > 0) {
      // Check for the presence of specific action types
      if (userPreferences.actions.includes("create")) {
        return <CreateComponentForm ComponentActions={ComponentActions} />;
      }
  
      if (userPreferences.actions.includes("update")) {
        return <UpdateComponent />;
      }
  
      if (userPreferences.actions.includes("delete")) {
        return <DeleteComponent />;
      }
    }
  
    return null; // Default content if no actions are specified
  };
  

  // Example usage of API configurations
  const renderApiContent = () => {
    return apiConfigs.map((config: ApiConfig) => (
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
