// projectManagerTypes.ts
ProjectManagerTypes.ts
import { Project } from '@/core/models/projects/Project';
import { ProjectManagerBaseParams } from '@/core/typings/entities/ProjectManagerEntity';

// Core type alias for Project with all 6 parameters
type ProjectManagerProject = Project<
  ProjectManagerBaseParams['T'],
  ProjectManagerBaseParams['K'],
  ProjectManagerBaseParams['Meta'],
  ProjectManagerBaseParams['AttachmentType'],
  ProjectManagerBaseParams['ExcludedFields'],
  ProjectManagerBaseParams['IncludedFields']
>;

// Writable draft version for Redux
type WritableProjectManagerProject = WritableDraft<ProjectManagerProject>;

export type {
    ProjectManagerProject,
    WritableProjectManagerProject
};
