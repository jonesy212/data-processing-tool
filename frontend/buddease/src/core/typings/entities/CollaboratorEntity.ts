// CollaboratorEntity.ts
import type { Collaborator } from '@/core/collaborators/Collaborator';
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
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

