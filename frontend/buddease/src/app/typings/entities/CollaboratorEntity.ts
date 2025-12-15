// CollaboratorEntity.ts
import { Collaborator } from '@/app/collaborators/Collaborator';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
// Define the actual CollaboratorEntity interface
interface CollaboratorEntity extends BaseDataEntity {
  id: string;
  userId: string;
  projectId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  permissions: string[];
  joinedAt: Date;
  lastActive?: Date;
  isActive: boolean;
  accessLevel: 'full' | 'limited' | 'readonly';
  teams: string[];
  skills: string[];
  availability: 'available' | 'busy' | 'away';
  // Add other collaborator-specific fields
}

// Collaborator-specific type parameters
type AppCollaboratorEntity = CollaboratorEntity;
type CollaboratorK = CollaboratorEntity;
type CollaboratorMeta = DefaultMeta<CollaboratorEntity, CollaboratorK> & {
  description?: string;
  permissions?: string[];
  customFields?: Record<string, any>;
};
type CollaboratorAttachment = Attachment;
type CollaboratorExcludedFields = DefaultExcludedFields<AppCollaboratorEntity> | "permissions" | "teams";
type CollaboratorIncludedFields = keyof AppCollaboratorEntity;

type AppCollaborator = Collaborator<AppCollaboratorEntity, CollaboratorK, CollaboratorMeta, CollaboratorAttachment, CollaboratorExcludedFields, CollaboratorIncludedFields>

// Collaborator parameters container
type CollaboratorBaseParams = {
  T: CollaboratorEntity;
  K: CollaboratorK;
  Meta: CollaboratorMeta;
  AttachmentType: CollaboratorAttachment;
  ExcludedFields: CollaboratorExcludedFields;
  IncludedFields: CollaboratorIncludedFields;
};

// Export all the types
export type {
  AppCollaborator, CollaboratorAttachment, CollaboratorBaseParams, CollaboratorEntity, CollaboratorExcludedFields,
  CollaboratorIncludedFields, CollaboratorK,
  CollaboratorMeta
};

