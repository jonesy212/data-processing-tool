// MainDashboardFramework.tsx
import React from "react";
import DashboardPanel from "./DashboardPanel";
import VideoFramework from "./VideoFramework";

const MainDashboardFramework: React.FC = () => {
  return (
    <div>
      {/* Main dashboard framework layout */}
      <DashboardPanel />
      <VideoFramework />
    </div>
  );
};

export default MainDashboardFramework;
