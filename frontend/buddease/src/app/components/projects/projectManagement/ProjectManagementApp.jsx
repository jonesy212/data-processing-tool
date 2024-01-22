import React from 'react';
import CommunicationHub from './CommunicationHub';
import DashboardOverview from './DashboardOverview';
import DataAnalysisSection from './DataAnalysisSection';
import PhasesNavigation from './PhasesNavigation';
import ProjectManager from './ProjectManager';
import ProjectTimelineDashboard from './ProjectTimelineDashboard';
import ProjectWorkspace from './ProjectWorkspace';
import RandomWalkVisualization from './RandomWalkVisualization';

const ProjectManagementApp = () => {
  return (
    <div>
      <DashboardOverview />
      <ProjectWorkspace />
      <CommunicationHub />
      <PhasesNavigation />
      <DataAnalysisSection />
      <ProjectTimelineDashboard />
      <RandomWalkVisualization />
      <ProjectManager />
      {/* Add other components as needed */}
    </div>
  );
};

export default ProjectManagementApp;
