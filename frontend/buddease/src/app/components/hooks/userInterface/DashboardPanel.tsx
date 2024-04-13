import React from "react";
import ResizablePanels from "./ResizablePanels";

interface DashboardPanelProps {
  title: string;
  content: React.ReactNode;
}

const DashboardPanel: React.FC<DashboardPanelProps> = ({ title, content }) => {
  return (
    <div className="dashboard-panel">
      <h2 className="dashboard-panel-title">{title}</h2>
      <div className="dashboard-panel-content">{content}</div>
    </div>
  );
};

interface DynamicDashboardProps {
  title: string;
  content: React.ReactNode;
}

const DynamicDashboard: React.FC<DynamicDashboardProps> = ({ title, content }) => {
  return (
    <div className="dynamic-dashboard">
      <h2 className="dynamic-dashboard-title">{title}</h2>
      <div className="dynamic-dashboard-content">{content}</div>
    </div>
  );
};

const ExampleDashboard: React.FC = () => {
  const sizes = () => [200, 400]; // Example sizes for resizable panels

  const onResize = (newSizes: number[]) => {
    // Handle resizing logic here
  };

  return (
    <ResizablePanels sizes={sizes} onResize={onResize}>
      <DashboardPanel title="Panel 1" content={<p>Content for panel 1</p>} />
      <DynamicDashboard title="Panel 2" content={<p>Content for panel 2</p>} />
    </ResizablePanels>
  );
};

export default ExampleDashboard;
