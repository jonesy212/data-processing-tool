// DashboardManager.tsx
import { CommunicationHub, DashboardOverview, ProjectWorkspace } from '@/core/dashboards/DashboardComponent';
import AppTreeExplorer from '@/core/services/AppTreeExplorer';
import React, { useState } from 'react';
import TreeView from './TreeView';

export type DashboardView = 
  | 'overview'
  | 'project-workspace' 
  | 'communication'
  | 'project-explorer'
  | 'tree-view'
  | 'documents'
  | 'tasks'
  | 'settings'
  | 'crypto'
  
  | 'analytics'
  | 'community';

interface DashboardManagerProps {
  initialView?: DashboardView;
  onViewChange?: (view: DashboardView) => void;
}

const DashboardManager: React.FC<DashboardManagerProps> = ({ 
  initialView = 'overview',
  onViewChange 
}) => {
  const [activeView, setActiveView] = useState<DashboardView>(initialView);

  const handleViewChange = (view: DashboardView) => {
    setActiveView(view);
    onViewChange?.(view);
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'overview':
        return <DashboardOverview />;
      
      case 'project-workspace':
        return <ProjectWorkspace />;
      
      case 'communication':
        return <CommunicationHub />;
      
      case 'project-explorer':
        return <AppTreeExplorer />;
      
      case 'tree-view':
        return <TreeView data={[]} onClick={() => {}} searchQuery="" />;
      
      default:
        return (
          <div className="dashboard-placeholder">
            <h2>Dashboard: {activeView}</h2>
            <p>This dashboard view is coming soon.</p>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-manager">
      {/* Dashboard Navigation */}
      <div className="dashboard-nav">
        <nav className="dashboard-nav-grid">
          <button 
            onClick={() => handleViewChange('overview')}
            className={activeView === 'overview' ? 'active' : ''}
          >
            📊 Overview
          </button>
          
          <button 
            onClick={() => handleViewChange('project-workspace')}
            className={activeView === 'project-workspace' ? 'active' : ''}
          >
            🛠️ Project Workspace
          </button>
          
          <button 
            onClick={() => handleViewChange('communication')}
            className={activeView === 'communication' ? 'active' : ''}
          >
            💬 Communication
          </button>
          
          <button 
            onClick={() => handleViewChange('project-explorer')}
            className={activeView === 'project-explorer' ? 'active' : ''}
          >
            🚀 Project Explorer
          </button>
          
          <button 
            onClick={() => handleViewChange('tree-view')}
            className={activeView === 'tree-view' ? 'active' : ''}
          >
            📁 File Tree
          </button>

          {/* Additional dashboard buttons */}
          <button onClick={() => handleViewChange('documents')}>📄 Documents</button>
          <button onClick={() => handleViewChange('tasks')}>✅ Tasks</button>
          <button onClick={() => handleViewChange('analytics')}>📈 Analytics</button>
        </nav>
      </div>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        {renderActiveView()}
      </div>
    </div>
  );
};

export default DashboardManager;