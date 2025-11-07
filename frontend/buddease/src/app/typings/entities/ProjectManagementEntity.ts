// ProjectManagementEntity.ts
// ProjectManagementEntity.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';

// Define the actual ProjectManagementEntity interface
interface ProjectManagementEntity extends BaseDataEntity {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: Date;
  endDate: Date;
  assignedTo: string[];
  dependencies: string[];
  progress: number;
  estimatedHours: number;
  actualHours: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// Project Management specific type parameters
type ProjectManagementK = ProjectManagementEntity;
type ProjectManagementMeta = DefaultMeta<ProjectManagementEntity, ProjectManagementK> & {
  projectId?: string;
  phase?: string;
  complexity?: 'simple' | 'moderate' | 'complex';
  riskLevel?: 'low' | 'medium' | 'high';
  customFields?: Record<string, any>;
};
type ProjectManagementAttachment = Attachment;
type ProjectManagementExcludedFields = DefaultExcludedFields<ProjectManagementEntity> | "assignedTo" | "dependencies";
type ProjectManagementIncludedFields = keyof ProjectManagementEntity;

// Project Management parameters container
type ProjectManagementBaseParams = {
  T: ProjectManagementEntity;
  K: ProjectManagementK;
  Meta: ProjectManagementMeta;
  AttachmentType: ProjectManagementAttachment;
  ExcludedFields: ProjectManagementExcludedFields;
  IncludedFields: ProjectManagementIncludedFields;
};




// Core type aliases
type ProjectManagementTask = Task<
  ProjectManagementBaseParams['T'],
  ProjectManagementBaseParams['K'],
  ProjectManagementBaseParams['Meta'],
  ProjectManagementBaseParams['AttachmentType'],
  ProjectManagementBaseParams['ExcludedFields'],
  ProjectManagementBaseParams['IncludedFields']
>;

type ProjectManagementProject = Project<
  ProjectManagementBaseParams['T'],
  ProjectManagementBaseParams['K'],
  ProjectManagementBaseParams['Meta'],
  ProjectManagementBaseParams['AttachmentType'],
  ProjectManagementBaseParams['ExcludedFields'],
  ProjectManagementBaseParams['IncludedFields']
>;
export type {
  ProjectManagementEntity,
  ProjectManagementK,
  ProjectManagementMeta,
  ProjectManagementAttachment,
  ProjectManagementExcludedFields,
  ProjectManagementIncludedFields,
  ProjectManagementBaseParams,
  
  ProjectManagementTask,
  ProjectManagementProject
};