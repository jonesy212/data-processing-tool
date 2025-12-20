// MainDashboardFramework.tsx
import React from "react";
import DashboardPanel from "@/app/hooks/userInterface/DashboardPanel";
import VideoFramework from "@/app/components/video/VideoFramework";

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
