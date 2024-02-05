import { Button, Card, Divider, Typography } from "antd";
import React from "react";
import {
  ButtonGenerator,
  buttonGeneratorProps,
} from "../generators/GenerateButtons";

const MainConfig: React.FC = () => {
  // Your component logic here

  return (
    <div>
      <h2>Main Configuration</h2>
      <p>Welcome to the main configuration page.</p>
      <p>Here, you can customize various settings for your application.</p>

      <Typography.Title level={2}>Project Management Settings</Typography.Title>
      <Divider />

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
