import { Button, Card, Divider, Tabs, Typography } from "antd";
import React, { useState } from "react";
import getAppPath from "../../../appPath";
import {
  ButtonGenerator,
  buttonGeneratorProps,
} from "../generators/GenerateButtons";
import { BackendConfig } from "./BackendConfig";
import { FrontendConfig } from "./FrontendConfig";
import BackendStructure from "./appStructure/BackendStructure";
import FrontendStructure from "./appStructure/FrontendStructure";
import { getCurrentAppInfo } from "../components/versions/VersionGenerator";
const { TabPane } = Tabs;

interface MainConfigProps {
  frontendStructure: FrontendStructure;
  backendStructure: BackendStructure;
  frontendConfig: FrontendConfig;
  backendConfig: BackendConfig;
}
const MainConfig: React.FC<MainConfigProps> = ({
  frontendStructure,
  frontendConfig,
  backendStructure,
  backendConfig,
}) => {
  const [activeTab, setActiveTab] = useState("frontend"); // Default to frontend

  // Determine the type of structure (frontend or backend)
  const isBackend = true;
  const { versionNumber, appVersion } = getCurrentAppInfo();
  const projectPath = getAppPath(versionNumber, appVersion);
   const structureType = isBackend ? "backend" : "frontend";

  // Instantiate the appropriate structure based on the type
  const structure = isBackend ? backendStructure : frontendStructure;
  const config = isBackend ? backendConfig : frontendConfig;

  // Function to handle tab change
  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  return (
    <div>
      <h2>Main Configuration</h2>
      <p>Welcome to the main configuration page.</p>
      <p>Here, you can customize various settings for your application.</p>

      <Typography.Title level={2}>Project Management Settings</Typography.Title>
      <Divider />

      {/* Tabs for frontend and backend structures */}
      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        <TabPane tab="Frontend Structure" key="frontend">
          {/* Display frontend structure details here */}
          {structureType === "frontend" && (
            <>
              <p>Frontend Structure: {JSON.stringify(structure)}</p>
              <p>Frontend Config: {JSON.stringify(config)}</p>
              <p>Project Path: {projectPath}</p>

            </>
          )}
        </TabPane>
        <TabPane tab="Backend Structure" key="backend">
          {/* Display backend structure details here */}
          {structureType === "backend" && (
            <>
              <p>Backend Structure: {JSON.stringify(structure)}</p>
              <p>Backend Config: {JSON.stringify(backendConfig)}</p>
              <p>Project Path: {projectPath}</p>

            </>
          )}
        </TabPane>
      </Tabs>

      {/* Communication Settings */}
      <Card title="Communication Settings">
        <Button type="primary">Enable Audio Communication</Button>
        <Button type="primary">Enable Video Communication</Button>
        <Button type="primary">Enable Real-Time Messaging</Button>
      </Card>
      <Divider />

      {/* Collaboration Settings */}
      <Card title="Collaboration Settings">
        <Button type="primary">Enable Real-Time Document Sharing</Button>
        <Button type="primary">Enable Whiteboard Collaboration</Button>
      </Card>
      <Divider />

      {/* Project Management Settings */}
      <Card title="Project Management Settings">
        <ButtonGenerator
          {...buttonGeneratorProps}
          label={{ submit: "Enable Phase-Based Project Management" }}
        />
        <ButtonGenerator
          {...buttonGeneratorProps}
          label={{ submit: "Enable Task Assignment and Tracking" }}
        />
        <ButtonGenerator
          {...buttonGeneratorProps}
          label={{ submit: "Enable Data Analysis Tools" }}
        />
        <ButtonGenerator
          {...buttonGeneratorProps}
          label={{ submit: "Enable File Upload and Sharing" }}
        />
        <ButtonGenerator
          {...buttonGeneratorProps}
          label={{ submit: "Enable Task Prioritization and Sorting" }}
        />
        <ButtonGenerator
          {...buttonGeneratorProps}
          label={{ submit: "Enable Customizable Project Templates" }}
        />
        <ButtonGenerator
          {...buttonGeneratorProps}
          label={{ submit: "Enable Time Tracking and Reporting" }}
        />
        <ButtonGenerator
          {...buttonGeneratorProps}
          label={{
            submit:
              "Enable Integration with External Tools (e.g., GitHub, Jira)",
          }}
        />
        <ButtonGenerator
          {...buttonGeneratorProps}
          label={{ submit: "Enable Project Deadline Reminders" }}
        />
        <ButtonGenerator
          {...buttonGeneratorProps}
          label={{ submit: "Enable Team Member Availability Status" }}
        />
        <ButtonGenerator
          {...buttonGeneratorProps}
          label={{ submit: "Enable Customizable Dashboard Widgets" }}
        />
        <ButtonGenerator
          {...buttonGeneratorProps}
          label={{ submit: "Enable Automated Task Assignment" }}
        />
        <ButtonGenerator
          {...buttonGeneratorProps}
          label={{ submit: "Enable Role-based Access Control" }}
        />
        <ButtonGenerator
          {...buttonGeneratorProps}
          label={{ submit: "Enable Progress Tracking and Visualization" }}
        />
        <ButtonGenerator
          {...buttonGeneratorProps}
          label={{ submit: "Enable Exporting Project Data to CSV/PDF" }}
        />
        <ButtonGenerator
          {...buttonGeneratorProps}
          label={{ submit: "Enable User Feedback and Suggestions" }}
        />
        <ButtonGenerator
          {...buttonGeneratorProps}
          label={{ submit: "Enable Customizable Notification Preferences" }}
        />
        <ButtonGenerator
          {...buttonGeneratorProps}
          label={{ submit: "Enable Document Version Control" }}
        />
        <ButtonGenerator
          {...buttonGeneratorProps}
          label={{ submit: "Enable Project Milestone Management" }}
        />
        <ButtonGenerator
          {...buttonGeneratorProps}
          label={{ submit: "Enable Integration with Calendar Services" }}
        />
        <ButtonGenerator
          {...buttonGeneratorProps}
          label={{ submit: "Enable Multi-language Support" }}
        />
        <ButtonGenerator
          {...buttonGeneratorProps}
          label={{ submit: "Enable Data Encryption for Security" }}
        />
        <ButtonGenerator
          {...buttonGeneratorProps}
          label={{
            submit: "Enable Offline Mode for Working Without Internet Access",
          }}
        />
      </Card>
    </div>
  );
};

export default MainConfig;
