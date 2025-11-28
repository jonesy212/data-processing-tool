// metadataTypes.ts
// AppMetadata.ts

import { ValidationRule } from './../snapshots/ValidationRule';
import { TaskMetadata,  } from '@/app/config/MetaDataOptions';
import { IBackendStructure } from '@/app/config/appStructure/IBackendStructure';
import { UnifiedMetadata } from '@/app/config/MetaDataOptions';
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { Attachment } from '@/app/documents/attachment/Attachment';

interface AppMetadata<AppTaskMetadata extends BaseDataEntity> extends UnifiedMetadata<AppTaskMetadata> {
  
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


  taskMetadata?: TaskMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  relatedEntities?: Array<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
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

// AppSchema.types.ts
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
  backendStructure: IBackendStructure<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  
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


export type { AppMetadata }