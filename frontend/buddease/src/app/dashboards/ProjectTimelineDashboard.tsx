// ProjectTimelineDashboard.tsx
import React from "react";
import ProjectTimeline from '@/app/projects/projectManagement/ProjectTimeline';
import TeamProgress from '@/app/projects/projectManagement/TeamProgress';

const ProjectTimelineDashboard = () => {
  return (
    <div>
      <h2>Project Timeline Dashboard</h2>
      <ProjectTimeline />
      <TeamProgress />
    </div>
  );
};

export default ProjectTimelineDashboard;
