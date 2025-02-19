import React, { useState } from "react";
import DynamicDashboard from "../../dashboards/DynamicDashboard";
import NavigationMenu from "../../interfaces/NavigationMenu";
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

const ExampleDashboard: React.FC = () => {
  const [selectedView, setSelectedView] = useState<string>("projectManagement");
  const [panels, setPanels] = useState<Panel[]>([
    { id: "panel1", size: 200 },
    { id: "panel2", size: 400 }
  ]);

  const handleSelectView = (view: string) => {
    setSelectedView(view);
  };

  const onResize = (newSizes: number[]) => {
    setPanels(newSizes.map((size, index) => ({ ...panels[index], size })));
  };

  const onResizeStop = (newSizes: number[]) => {
    console.log("Resize stopped!", newSizes);
    localStorage.setItem("panelSizes", JSON.stringify(newSizes));
  };

  const renderContent = (): React.ReactNode[] => {
    if (selectedView === "projectManagement") {
      return [
        <DashboardPanel key="tasks" title="Project Tasks" content={<p>Tasks content...</p>} />,
        <DashboardPanel key="timeline" title="Project Timeline" content={<p>Timeline content...</p>} />
      ];
    } else if (selectedView === "socialMedia") {
      return [
        <DynamicDashboard key="feed" title="Social Media Feed" content={<p>Feed content...</p>} />,
        <DynamicDashboard key="notifications" title="Notifications" content={<p>Notifications content...</p>} />
      ];
    }
    return [];
  };

  return (
    <div className="app">
      <NavigationMenu onSelect={handleSelectView} />
      <ResizablePanels
        sizes={panels.map(panel => panel.size)}
        onResize={onResize}
        onResizeStop={onResizeStop}
      >
        {renderContent()}
      </ResizablePanels>
    </div>
  );
};





export default ExampleDashboard;
export { DashboardPanel };
