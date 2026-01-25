// metadataTypes.ts

import type { Constraint, IndexDefinition } from '@/core/components/database/SchemaEvolutionManager';
import type { ValidationRule } from '@/core/snapshots/ValidationRule';
import type { WorkflowTransition } from '@/core/models/phases/WorkflowTransition';
import type { BackendStructure } from '@/core/server/database/BackendStructure';
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { TaskMetadata, UnifiedMetadata, } from '@/core/config/MetaDataOptions';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import type { DatabaseSchema, ServiceSchema, StructureSchema } from '@/core/typings/database';
import type { AppTask } from '@/core/typings/entities/AppEntity';
import type { WorkflowStep } from '@/core/typings/entities/DocumentEntity';
import type { MigrationDefinition } from '@/core/components/database/SchemaEvolutionManager'
import type { RelationshipDefinition } from '@/core/components/database/SchemaEvolutionManager'

// Complete type safety with all App-specific types
interface AppMetadata<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  
  // 🎯 Application Identity & Versioning
  appVersion: string;
  appId: string;
  appName: string;
  instanceId: string;
  deploymentId: string;
  
  // 🎯 Environment & Configuration
  environment: 'development' | 'staging' | 'production';
  featureFlags: Record<string, boolean>;
  configVersion: string;
  
  // 🎯 Multi-tenancy & Access Control
  tenantId?: string;
  organizationId?: string;
  accessScope: 'user' | 'team' | 'organization' | 'global';
  
  // 🎯 UI & Experience Configuration
  uiConfig: {
    theme: string;
    language: string;
    layout: string;
    preferences: Record<string, any>;
  };
  
  // 🎯 Business Logic & Rules
  businessRules: BusinessRule[];
  validationSchemas: Record<string, any>;
  workflowDefinitions: WorkflowDefinition[];
  
  // 🎯 App-specific Metadata Extensions
  appCustomFields?: Record<string, any>;
  appSchema?: AppSchema;
  migrationVersion?: number;
  compatibility: {
    minVersion: string;
    maxVersion: string;
    supportedFeatures: string[];
  };

  // Full type safety for all App-specific types
  taskMetadata?: TaskMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  
  // Properly typed related entities
  relatedEntities?: Array<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  
  // Can use all 6 generic parameters
  dataEntity?: T;
  keyEntity?: K;
  metadata?: Meta;
  attachments?: AttachmentType[];
  
  customData?: Record<string, any>;
}



// Supporting types
interface BusinessRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  priority: number;
  enabled: boolean;
}

interface WorkflowDefinition {
  id: string;
  name: string;
  steps: WorkflowStep[];
  transitions: WorkflowTransition[];
}

interface AppSchema<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  version: string;
  schemaVersion: string;
  lastModified: Date;
  
  // ✅ Integrated Backend Structure
  backendStructure: BackendStructure<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  
  // ✅ Schema Definitions
  databaseSchema: DatabaseSchema;
  serviceSchema: ServiceSchema;
  structureSchema: StructureSchema;
  
  // ✅ Entity & Relationship Definitions
  entities: EntityDefinition<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  relationships: RelationshipDefinition[];
  
  // ✅ Validation & Constraints
  validationRules: ValidationRule[];
  constraints: Constraint[];
  
  // ✅ Migration & Evolution
  migrations: MigrationDefinition[];
  compatibility: SchemaCompatibility;
}

// Supporting types with proper generics
interface EntityDefinition<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  name: string;
  type: string;
  properties: EntityProperty[];
  indexes: IndexDefinition[];
  metadata: EntityMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}

interface EntityMetadata<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  unifiedMetadata?: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  validationSchema?: any;
  accessControl?: AccessControlRule[];
}


export type { AppMetadata };
