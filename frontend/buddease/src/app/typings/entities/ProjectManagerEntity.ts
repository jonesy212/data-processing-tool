// ProjectManagerEntity.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { BaseEntity } from '@/app/routing/FuzzyMatch'

// Define the actual ProjectManagerEntity interface
interface ProjectManagerEntity extends BaseDataEntity, BaseEntity {
  // Core project fields (no longer duplicating shared fields)
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: Date;
  endDate: Date;
  
  // Project-specific optional fields
  budget?: number;
  actualCost?: number;
  progress: number;
  teamMembers: string[];
  tags: string[];
  owner: string;
  
  // Project manager specific fields
  lastActivity?: Date;
  riskLevel?: 'low' | 'medium' | 'high';
  dependencies?: string[];
  milestones?: string[];
}

// Project Manager specific type parameters
type ProjectManagerK = ProjectManagerEntity;
type ProjectManagerMeta = DefaultMeta<ProjectManagerEntity, ProjectManagerK> & {
  client?: string;
  department?: string;
  category?: string;
  complexity?: 'simple' | 'moderate' | 'complex';
  customFields?: Record<string, any>;
};
type ProjectManagerAttachment = Attachment;
type ProjectManagerExcludedFields = DefaultExcludedFields<ProjectManagerEntity> | "budget" | "actualCost" | "teamMembers";
type ProjectManagerIncludedFields = keyof ProjectManagerEntity;

// Project Manager parameters container
type ProjectManagerBaseParams = {
  T: ProjectManagerEntity;
  K: ProjectManagerK;
  Meta: ProjectManagerMeta;
  AttachmentType: ProjectManagerAttachment;
  ExcludedFields: ProjectManagerExcludedFields;
  IncludedFields: ProjectManagerIncludedFields;
};

export type {
  ProjectManagerEntity,
  ProjectManagerK,
  ProjectManagerMeta
  ProjectManagerAttachment, 
  ProjectManagerIncludedFields,
  ProjectManagerExcludedFields,
  ProjectManagerBaseParams, 
};
