ProjectTimelineDashboard.tsx
import ProjectTimeline from '@/core/projects/projectManagement/ProjectTimeline';
import TeamProgress from '@/core/projects/projectManagement/TeamProgress';

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
