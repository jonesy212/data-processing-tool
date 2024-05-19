import React, { useState } from "react";
import ResizablePanels from "./ResizablePanels";

interface DashboardPanelProps {
  title: string;
  content: React.ReactNode;
}

interface Panel {
  id: string;
  size: number;
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

 // State to manage panel sizes
 const [panels, setPanels] = useState<Panel[]>([
  { id: "panel1", size: 200 },
  { id: "panel2", size: 400 }
]);

// Function to handle resizing in progress
const onResize = (newSizes: number[]) => {
  // Update panel sizes in state while resizing
  setPanels(newSizes.map((size, index) => ({ ...panels[index], size })));
};

// Function to handle resizing stop
const onResizeStop = (newSizes: number[]) => { 
  // Handle resize stop logic here
  console.log("Resize stopped!", newSizes);
  // For example, you can save the new sizes to local storage
  localStorage.setItem("panelSizes", JSON.stringify(newSizes));
};

  return (
    <ResizablePanels
      sizes={sizes}
      onResize={onResize}
      onResizeStop={onResizeStop}> {/* Provide onResizeStop here */}

      
      <DashboardPanel title="Panel 1" content={<p>Content for panel 1</p>} />
      <DynamicDashboard title="Panel 2" content={<p>Content for panel 2</p>} />
    </ResizablePanels>
  );
};

export default ExampleDashboard;
