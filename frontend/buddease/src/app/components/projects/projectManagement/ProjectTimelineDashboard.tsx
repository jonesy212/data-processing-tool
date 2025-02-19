import React from "react";
import ProjectTimeline from './ProjectTimeline';
import TeamProgress from './TeamProgress';

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
