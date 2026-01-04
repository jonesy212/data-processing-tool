MainDashboardFramework.tsx
import VideoFramework from "@/core/components/video/VideoFramework";
import DashboardPanel from "@/core/hooks/userInterface/DashboardPanel";
import React from "react";

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
