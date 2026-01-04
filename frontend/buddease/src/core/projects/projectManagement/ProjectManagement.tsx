ProjectManagement.tsx
Example usage in a parent component
import { ClientProjectEntity } from '@/core/models/projects/Project';
import ProjectCreationForm from '@/core/pages/forms/ProjectCreationForm';
import React, { useState } from 'react';

const ProjectManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [projects, setProjects] = useState<ClientProjectEntity[]>([]);

  const handleProjectSubmit = async (project: ClientProjectEntity) => {
    try {
      // Save to your backend or state management
      console.log('Project submitted:', project);
      setProjects(prev => [...prev, project]);
      setShowForm(false);
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  return (
    <div>
      {!showForm ? (
        <div>
          <button onClick={() => setShowForm(true)}>
            Create New Project
          </button>
          {/* Display existing projects */}
        </div>
      ) : (
        <ProjectCreationForm
          onSubmit={handleProjectSubmit}
          onCancel={handleCancel}
          teams={[
            { id: 'team-1', name: 'Development Team' },
            { id: 'team-2', name: 'Design Team' }
          ]}
          users={[
            { id: 'user-1', name: 'John Doe' },
            { id: 'user-2', name: 'Jane Smith' }
          ]}
        />
      )}
    </div>
  );
};

export default ProjectManagement;