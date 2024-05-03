import React from 'react';
import CommonLayout from './CommonLayout';
import CollaborationToolsToolbar from './CollaborationToolsToolbar';
import ProjectManagementToolbar from '@/app/components/documents/ProjectManagementToolbar';
import { useDashboard } from '@/app/context/DashboardContext';
import { AnalysisTypeEnum } from '@/app/components/projects/DataAnalysisPhase/AnalysisType';
import { Data } from '@/app/components/models/data/Data';
import DashboardLoader from '@/app/components/dashboards/DashboardLoader';
type DashboardLayoutProps = {
  children: React.ReactNode;
  dashboardConfig: {
    title: string;
    content: React.ReactNode;
  };
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  dashboardConfig,
  
}) => {
  const { currentDashboard } = useDashboard();

  // Render toolbar based on current dashboard
  const renderToolbar = () => {
    switch (currentDashboard) {
      case "projectManagement":
        return (
          <ProjectManagementToolbar
            task={{
              id: "123",
              title: "Project Setup",
              description: "Description for the Project Setup task",
              name: "Project Setup",
              assignedTo: null,
              assigneeId: "456",
              dueDate: new Date(),
              payload: {},
              priority: "high",
              status: "In Progress",
              estimatedHours: 8,
              actualHours: 5,
              completionDate: null,
              dependencies: [],
              previouslyAssignedTo: [],
              done: false,
              data: {} as Data,
              source: "user",
              startDate: new Date(),
              endDate: new Date(),
              isActive: true,
              tags: ["tag1", "tag2"],
              analysisType: AnalysisTypeEnum.DEFAULT,
              analysisResults: [],
              videoThumbnail: "thumbnail.jpg",
              videoDuration: 60,
              videoUrl: "https://example.com/video",
            }}
          />
        );

      case "collaborationTools":
        return <CollaborationToolsToolbar />;
      case "cryptoSection":
        return <CryptoSectionToolbar />;
      default:
        return null;
    }
  };

  return (
    <CommonLayout>
      {/* Additional dashboard-specific layout elements */}
      <aside>Dashboard-specific sidebar</aside>

      {/* Render dynamic toolbar */}
      {renderToolbar()}

      {/* Render common layout content and the DashboardLoader */}
      {children}
      <DashboardLoader dashboardConfig={dashboardConfig} />
    </CommonLayout>
  );
};

export { DashboardLayout };
