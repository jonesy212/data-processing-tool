import React from 'react';
import Project from './Project';

interface UpdatedProjectDetailsProps {
    projectDetails: Project;
}

const UpdatedProjectDetails: React.FC<UpdatedProjectDetailsProps> = ({ projectDetails }) => {
  // Your component logic here
  return (
    <div>
      {/* Render updated project details here using projectDetails */}
      <h2>{projectDetails.title}</h2>
      <p>{projectDetails.description}</p>
      {/* Render other project details as needed */}
    </div>
  );
};

export default UpdatedProjectDetails;
export type { UpdatedProjectDetailsProps };

