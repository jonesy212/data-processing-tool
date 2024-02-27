// CommunityProjectsPage.tsx
import React from 'react';
import { CommunityData } from '../models/CommunityData';
import Project from '../projects/Project';

interface CommunityProjectsPageProps {
  community: CommunityData;
}

const CommunityProjectsPage: React.FC<CommunityProjectsPageProps> = ({ community }) => {
  return (
    <div>
      <h1>Community Projects</h1>
      {/* Render projects specific to the community */}
      {community.projects.map((project: Project) => (
        <div key={project.id}>
          <h2>{project.name}</h2>
          {/* Render project details */}
          <p>Description: {project.description}</p>
          {/* Add more project details as needed */}
        </div>
      ))}
    </div>
  );
};

export default CommunityProjectsPage;
