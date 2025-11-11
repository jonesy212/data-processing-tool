// DashboardLayout.tsx

import CommonLayout from '@/CommonLayout';
import DashboardLoader from '@/app/components/dashboards/DashboardLoader';
import ProjectManagementToolbar from '@/app/components/documents/ProjectManagementToolbar';
import CryptoSectionToolbar from '@/app/components/libraries/toolbar/CryptoSectionToolbar';
import { Data } from '@/app/models/data/Data';
import CollaborationToolsToolbar from '@/app/pages/community/CollaborationToolsToolbar';
import { useDashboard } from '@/app/state/context/DashboardContext';
import { AnalysisTypeEnum } from '@/app/typings/AnalysisType';
import { useAuth } from '@/state/context/AuthContext'; // Import auth context
import React from 'react';

type DashboardLayoutProps = {
  children: React.ReactNode;
  dashboardConfig?: { // Make it optional since it might come from auth context
    title: string;
    content: React.ReactNode;
    sidebarContent?: React.ReactNode;
    redirectPath?: string;
    userRole?: string;
    permissions?: string[];
    // Add more dashboard config properties as needed
  };
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  dashboardConfig,
}) => {
  const { currentDashboard } = useDashboard();
  const { user, dashboardConfig: authDashboardConfig } = useAuth(); // Get dashboard config from auth

  // Priority: props config > auth context config > default config
  const effectiveDashboardConfig = dashboardConfig || authDashboardConfig || getDefaultDashboardConfig(user);

  // Get default dashboard config based on user role
  function getDefaultDashboardConfig(user: any) {
    const userRole = user?.roles?.[0] || 'user';
    
    const defaultConfigs = {
      admin: {
        title: 'Admin Dashboard',
        content: <div>Admin Dashboard Content</div>,
        sidebarContent: <div>Admin Sidebar</div>,
        redirectPath: '/admin-dashboard',
        userRole: 'admin'
      },
      manager: {
        title: 'Manager Dashboard',
        content: <div>Manager Dashboard Content</div>,
        sidebarContent: <div>Manager Sidebar</div>,
        redirectPath: '/manager-dashboard',
        userRole: 'manager'
      },
      user: {
        title: 'User Dashboard',
        content: <div>User Dashboard Content</div>,
        sidebarContent: <div>User Sidebar</div>,
        redirectPath: '/dashboard',
        userRole: 'user'
      }
    };

    return defaultConfigs[userRole] || defaultConfigs.user;
  }

  // Enhanced toolbar rendering that considers dashboard config
  const renderToolbar = () => {
    // Priority: dashboardConfig toolbar > currentDashboard fallback
    if (effectiveDashboardConfig?.toolbar) {
      return effectiveDashboardConfig.toolbar;
    }

    // Fallback to existing dashboard-based toolbar
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
              [Symbol.iterator]: () => ({
                next: () => ({
                  done: false,
                  value: {}
                })
              }),
            }}
          />
        );

      case "collaborationTools":
        return (
          <CollaborationToolsToolbar
            projectManagementOptions={[]}
            documentManagementOptions={[]}
            taskManagementOptions={[]}
            calendarOptions={[]}
            analyticsOptions={[]}
            securityOptions={[]}
            integrationOptions={[]}
            userManagementOptions={[]}
            mobileAppOptions={[]}
            accessibilityOptions={[]}
            supportOptions={[]}
            localizationOptions={[]}
            gamificationOptions={[]}
          />
        );
      case "cryptoSection":
        return <CryptoSectionToolbar />;
      default:
        return null;
    }
  };

  // Render sidebar with priority: config sidebar > default sidebar
  const renderSidebar = () => {
    if (effectiveDashboardConfig?.sidebarContent) {
      return <aside className="dashboard-sidebar">{effectiveDashboardConfig.sidebarContent}</aside>;
    }
    
    // Default sidebar fallback
    return <aside className="dashboard-sidebar">Dashboard-specific sidebar</aside>;
  };

  // Update document title based on dashboard config
  React.useEffect(() => {
    if (effectiveDashboardConfig?.title) {
      document.title = `${effectiveDashboardConfig.title} - My App`;
    }
  }, [effectiveDashboardConfig?.title]);

  return (
    <CommonLayout>
      {/* Render dynamic sidebar */}
      {renderSidebar()}

      {/* Render dynamic toolbar */}
      {renderToolbar()}

      {/* Dashboard header with config-based title */}
      <header className="dashboard-header">
        <h1>{effectiveDashboardConfig?.title || 'Dashboard'}</h1>
        {effectiveDashboardConfig?.userRole && (
          <span className="user-role-badge">{effectiveDashboardConfig.userRole}</span>
        )}
      </header>

      {/* Render common layout content and the DashboardLoader */}
      {children}
      
      {/* Pass the effective dashboard config to DashboardLoader */}
      <DashboardLoader dashboardConfig={effectiveDashboardConfig} />

      {/* Optional: Render dashboard config content if provided */}
      {effectiveDashboardConfig?.content && (
        <div className="dashboard-config-content">
          {effectiveDashboardConfig.content}
        </div>
      )}
    </CommonLayout>
  );
};

export { DashboardLayout };
