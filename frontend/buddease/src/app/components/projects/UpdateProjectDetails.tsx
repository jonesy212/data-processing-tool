import React from 'react';
import { Project, ProjectDetails } from './Project';
import { StatusType } from '../models/data/StatusType';

interface UpdatedProjectDetailsProps {
  projectId: string;
  projectDetails: Project & { status: StatusType | undefined };
}

const UpdatedProjectDetails: React.FC<UpdatedProjectDetailsProps> = ({projectId, projectDetails }) => {
  // Your component logic here
  return (
    <div>
      {/* Render updated project details here using projectDetails */}
      <h2>{projectDetails.projectId}</h2>
      <h2>{projectDetails.title}</h2>
      <p>{projectDetails.description}</p>
      {/* Render other project details as needed */}
    </div>
  );
};

export default UpdatedProjectDetails;
export type { UpdatedProjectDetailsProps };

