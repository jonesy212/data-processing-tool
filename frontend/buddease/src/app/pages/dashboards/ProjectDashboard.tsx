// ProjectDashboard.tsx
// In your main component or layout
import FileStructureViewer from './FileStructureViewer';
import FrontendStructureViewer from './FrontendStructureViewer';
import AccessGuard from './AccessGuard';

const ProjectDashboard = () => {
  return (
    <div className="project-dashboard">
      {/* File Structure - Available to most roles */}
      <section className="dashboard-section">
        <h2>Project Files</h2>
        <FileStructureViewer />
      </section>
      
      {/* Frontend Structure - Restricted to UI/Dev roles */}
      <section className="dashboard-section">
        <AccessGuard 
          requiredRole={['ui-designer', 'developer', 'admin']}
          feature="Frontend Structure"
        >
          <FrontendStructureViewer frontendStructure={frontendStructure} />
        </AccessGuard>
      </section>
      
      {/* Sensitive Configuration - Admin/Developer only */}
      <section className="dashboard-section">
        <AccessGuard 
          requiredRole={['admin', 'developer']}
          feature="Configuration Files"
        >
          <FileStructureViewer showSensitiveFiles={true} />
        </AccessGuard>
      </section>
    </div>
  );
};