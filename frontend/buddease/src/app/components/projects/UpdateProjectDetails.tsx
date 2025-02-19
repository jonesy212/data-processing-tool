import React from 'react';
import { Project, ProjectDetails } from './Project';
import { StatusType } from '../models/data/StatusType';

interface UpdatedProjectDetailsProps {
  projectId: string;
  projectDetails: Project & { status: StatusType | undefined };
}

const UpdatedProjectDetails: React.FC<UpdatedProjectDetailsProps> = ({ projectId, projectDetails }) => {
  return (
    <div>
      <h2>{projectDetails.title}</h2>
      <p>Description: {projectDetails.description}</p>
      <p>Status: {projectDetails.status}</p>
      <p>Start Date: {projectDetails.startDate?.toLocaleDateString()}</p>
      <p>End Date: {projectDetails.endDate?.toLocaleDateString()}</p>
      <p>Priority: {projectDetails.priority}</p>
      <p>Assignee: {projectDetails.assignee?.username}</p>
      <p>Collaborators: {projectDetails.collaborators?.join(', ')}</p>
      <p>Comments: {projectDetails.comments?.map(comment => comment.text).join(', ')}</p>
      <p>Attachments: {projectDetails.attachments?.map(attachment => attachment.fileName).join(', ')}</p>
      <p>Subtasks: {projectDetails.subtasks?.map(subtask => subtask.name).join(', ')}</p>
      <p>Created By: {projectDetails.createdBy}</p>
      <p>Updated By: {projectDetails.updatedBy}</p>
      <p>Is Archived: {projectDetails.isArchived ? 'Yes' : 'No'}</p>
      <p>Is Completed: {projectDetails.isCompleted ? 'Yes' : 'No'}</p>
      <p>Custom Property: {projectDetails.customProperty}</p>
      <p>Budget: {projectDetails.budget}</p>
      <p>Phases: {projectDetails.phases?.map(phase => phase.name).join(', ')}</p>
      <p>Average Price: {projectDetails.averagePrice}</p>
    </div>
  );
};

export default UpdatedProjectDetails;
export type { UpdatedProjectDetailsProps };
