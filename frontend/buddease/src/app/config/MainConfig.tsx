// MainConfig.tsx
import { Button, Card, Divider, Tabs, Typography } from "antd";
import React, { useState } from "react";
import { getCurrentAppInfo } from "@/app/versions/VersionGenerator";
import {
  ButtonGenerator,
  useButtonGeneratorProps,
} from "@/app/generators/GenerateButtons";
import { BackendConfig } from "./BackendConfig";
import { FrontendConfig } from "./FrontendConfig";
import BackendStructure from "@/app/server/database/BackendStructure";
import FrontendStructure from "./appStructure/FrontendStructure";
import getAppPath from "./appStructure/appPath";
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';

import { Attachment } from '@/app/documents/attachment/Attachment';


const { TabPane } = Tabs;

interface MainConfigProps<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  frontendStructure: FrontendStructure<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  backendStructure: BackendStructure<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
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

  // Use the new hook to get button props
  const { buttonProps, currentPhase, lifecycleManager } = useButtonGeneratorProps<
    BaseDataEntity, 
    BaseDataEntity, 
    DefaultMeta<BaseDataEntity, BaseDataEntity>, 
    Attachment, 
    DefaultExcludedFields<BaseDataEntity>, 
    keyof BaseDataEntity
  >();

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
          {...buttonProps}
          label={{ submit: "Enable Phase-Based Project Management" }}
        />
        <ButtonGenerator
          {...buttonProps}
          label={{ submit: "Enable Task Assignment and Tracking" }}
        />
        <ButtonGenerator
          {...buttonProps}
          label={{ submit: "Enable Data Analysis Tools" }}
        />
        <ButtonGenerator
          {...buttonProps}
          label={{ submit: "Enable File Upload and Sharing" }}
        />
        <ButtonGenerator
          {...buttonProps}
          label={{ submit: "Enable Task Prioritization and Sorting" }}
        />
        <ButtonGenerator
          {...buttonProps}
          label={{ submit: "Enable Customizable Project Templates" }}
        />
        <ButtonGenerator
          {...buttonProps}
          label={{ submit: "Enable Time Tracking and Reporting" }}
        />
        <ButtonGenerator
          {...buttonProps}
          label={{
            submit: "Enable Integration with External Tools (e.g., GitHub, Jira)",
          }}
        />
        <ButtonGenerator
          {...buttonProps}
          label={{ submit: "Enable Project Deadline Reminders" }}
        />
        <ButtonGenerator
          {...buttonProps}
          label={{ submit: "Enable Team Member Availability Status" }}
        />
        <ButtonGenerator
          {...buttonProps}
          label={{ submit: "Enable Customizable Dashboard Widgets" }}
        />
        <ButtonGenerator
          {...buttonProps}
          label={{ submit: "Enable Automated Task Assignment" }}
        />
        <ButtonGenerator
          {...buttonProps}
          label={{ submit: "Enable Role-based Access Control" }}
        />
        <ButtonGenerator
          {...buttonProps}
          label={{ submit: "Enable Progress Tracking and Visualization" }}
        />
        <ButtonGenerator
          {...buttonProps}
          label={{ submit: "Enable Exporting Project Data to CSV/PDF" }}
        />
        <ButtonGenerator
          {...buttonProps}
          label={{ submit: "Enable User Feedback and Suggestions" }}
        />
        <ButtonGenerator
          {...buttonProps}
          label={{ submit: "Enable Customizable Notification Preferences" }}
        />
        <ButtonGenerator
          {...buttonProps}
          label={{ submit: "Enable Document Version Control" }}
        />
        <ButtonGenerator
          {...buttonProps}
          label={{ submit: "Enable Project Milestone Management" }}
        />
        <ButtonGenerator
          {...buttonProps}
          label={{ submit: "Enable Integration with Calendar Services" }}
        />
        <ButtonGenerator
          {...buttonProps}
          label={{ submit: "Enable Multi-language Support" }}
        />
        <ButtonGenerator
          {...buttonProps}
          label={{ submit: "Enable Data Encryption for Security" }}
        />
        <ButtonGenerator
          {...buttonProps}
          label={{
            submit: "Enable Offline Mode for Working Without Internet Access",
          }}
        />
      </Card>

      {/* Optional: Display lifecycle status for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <Card title="Lifecycle Status (Debug)">
          <p><strong>Current Phase:</strong> {lifecycleManager.getCurrentPhase()?.name || 'Not started'}</p>
          <p><strong>Available Transitions:</strong> {lifecycleManager.getNextPossiblePhases().map(p => p.name).join(', ') || 'None'}</p>
        </Card>
      )}
    </div>
  );
};

export default MainConfig;
