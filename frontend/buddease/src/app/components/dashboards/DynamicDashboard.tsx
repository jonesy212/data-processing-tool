// components/DynamicDashboard.tsx
import React from "react";

 interface DynamicDashboardProps {
  title: string;
  content: React.ReactNode;
}

const DynamicDashboard: React.FC<DynamicDashboardProps> = ({
  title,
  content,
}) => {
  // Add your dynamic dashboard content and logic here
  return (
    <div>
      <h2>Dynamic Dashboard</h2>
      <h2>{title}</h2>
      {content}
      {/* Add dynamic content or components based on configurations or data */}
      <p>
        This dashboard is flexible and can adapt to different configurations or
        data.
      </p>
    </div>
  );
};

export default DynamicDashboard;

export type { DynamicDashboardProps };
