// DynamicDashboard.tsx
import React from "react";

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

  export default DynamicDashboard