// EntityConversionRules.ts

import type { DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { ParsedData } from '@/core/dataIntegration/parseData';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { CommonData, SupportedData } from "@/core/models/CommonData";

// Import all entity types from their respective files
import type { UserEntity, SecureUserEntity } from '@/core/typings/entities/UserEntity';
import type { MemberEntity } from '@/core/typings/entities/MemberEntity';
import type { TaskEntity } from '@/core/typings/entities/TaskEntity';
import type { ProjectEntity } from '@/core/typings/entities/ProjectEntity';
import type { ProjectManagementEntity } from '@/core/typings/entities/ProjectManagementEntity';
import type { DocumentEntity } from '@/core/typings/entities/DocumentEntity';
import type { NoteEntity } from '@/core/typings/entities/NoteEntity';
import type { AppEntity } from '@/core/typings/entities/AppEntity';
import type { ArticleEntity } from '@/core/typings/entities/ArticleEntity';
import type { CalendarEntity } from '@/core/typings/entities/CalendarEntity';
import type { ChatEntity } from '@/core/typings/entities/ChatEntity';
import type { ChatRoomEntity } from '@/core/typings/entities/ChatRoomEntity';
import type { ExtendedDappEntity } from '@/core/typings/entities/ExtendedDappEntity';
import type { FileEntity } from '@/core/typings/entities/FileEntity';
import type { LogEntity } from '@/core/typings/entities/LogEntity';
import type { MeetingEntity } from '@/core/typings/entities/MeetingEntity';
import type { MessageEntity } from '@/core/typings/entities/MessageEntity';
import type { MetaEntity } from '@/core/typings/entities/MetaEntity';
import type { NotificationEntity } from '@/core/typings/entities/NotificationEntity';
import type { PhaseEntity } from '@/core/typings/entities/PhaseEntity';
import type { ProductEntity } from '@/core/typings/entities/ProductEntity';
import type { SenderEntity } from '@/core/typings/entities/SenderEntity';
import type { SnapshotEntity } from '@/core/typings/entities/SnapshotEntity';
import type { SnapshotStorageOptionsEntity } from '@/core/typings/entities/SnapshotStorageOptionsEntity';
import type { StorePropEntity } from '@/core/typings/entities/StorePropEntity';
import type { TrackerEntity } from '@/core/typings/entities/TrackerEntity';
import type { VersionEntity } from '@/core/typings/entities/VersionEntity';
import type { VersionHistoryEntity } from '@/core/typings/entities/VersionHistoryEntity';
import type { VideoEntity } from '@/core/typings/entities/VideoEntity';
import type { TagEntity } from '@/core/typings/entities/TagEntity';
import type { TeamEntity } from '@/core/typings/entities/TeamEntity';

// Don't import from './EntityConversionRules' - it creates circular dependency
// Instead, we'll define the conversionRules here

// Helper type for conversion function
type ConversionFunction<Source, Target> = (source: Source) => Target;

// Define the rules interface
export interface EntityConversionRules {
  UserEntity: ConversionFunction<UserEntity, SecureUserEntity>;
  MemberEntity: ConversionFunction<MemberEntity, MemberEntity>;
  TaskEntity: ConversionFunction<TaskEntity, TaskEntity>;
  ProjectEntity: ConversionFunction<ProjectEntity, ProjectEntity>;
  ProjectManagementEntity: ConversionFunction<ProjectManagementEntity, ProjectManagementEntity>;
  DocumentEntity: ConversionFunction<DocumentEntity, DocumentEntity>;
  NoteEntity: ConversionFunction<NoteEntity, NoteEntity>;
  AppEntity: ConversionFunction<AppEntity, AppEntity>;
  ArticleEntity: ConversionFunction<ArticleEntity, ArticleEntity>;
  CalendarEntity: ConversionFunction<CalendarEntity, CalendarEntity>;
  ChatEntity: ConversionFunction<ChatEntity, ChatEntity>;
  ChatRoomEntity: ConversionFunction<ChatRoomEntity, ChatRoomEntity>;
  ExtendedDappEntity: ConversionFunction<ExtendedDappEntity, ExtendedDappEntity>;
  FileEntity: ConversionFunction<FileEntity, FileEntity>;
  LogEntity: ConversionFunction<LogEntity, LogEntity>;
  MeetingEntity: ConversionFunction<MeetingEntity, MeetingEntity>;
  MessageEntity: ConversionFunction<MessageEntity, MessageEntity>;
  MetaEntity: ConversionFunction<MetaEntity, MetaEntity>;
  NotificationEntity: ConversionFunction<NotificationEntity, NotificationEntity>;
  PhaseEntity: ConversionFunction<PhaseEntity, PhaseEntity>;
  ProductEntity: ConversionFunction<ProductEntity, ProductEntity>;
  SenderEntity: ConversionFunction<SenderEntity, SenderEntity>;
  SnapshotContainerEntity: ConversionFunction<any, any>;
  SnapshotEntity: ConversionFunction<SnapshotEntity, SnapshotEntity>;
  SnapshotStorageOptionsEntity: ConversionFunction<SnapshotStorageOptionsEntity, SnapshotStorageOptionsEntity>;
  StorePropEntity: ConversionFunction<StorePropEntity, StorePropEntity>;
  TrackerEntity: ConversionFunction<TrackerEntity, TrackerEntity>;
  VersionEntity: ConversionFunction<VersionEntity, VersionEntity>;
  VersionHistoryEntity: ConversionFunction<VersionHistoryEntity, VersionHistoryEntity>;
  VideoEntity: ConversionFunction<VideoEntity, VideoEntity>;
  TagEntity: ConversionFunction<TagEntity, TagEntity>;
  TeamEntity: ConversionFunction<TeamEntity, TeamEntity>;
  
  // Allow additional dynamic rules
  [key: string]: ConversionFunction<any, any>;
}

// --------------------
// Step 1: Define all entities as a const tuple
// --------------------
const entities = [
  'ApiEntity', 'AppEntity', 'AppMetadataEntity', 'ArticleEntity', 'AuthEntity', 'BlogEntity',
  'CalendarEntity', 'ChatEntity', 'ChatRoomEntity', 'CommonEntities', 'ConfigEntity', 'ContentEntity',
  'DataEntity', 'DocumentEntity', 'DrawingEntity', 'ExtendedDappEntity', 'EventEntity', 'ExampleEntity',
  'FileEntity', 'FilterEntity', 'LogEntity', 'MeetingEntity', 'MessageEntity', 'MemberEntity',
  'MetaEntity', 'NoteEntity', 'NotificationEntity', 'PhaseEntity', 'ProductEntity', 'ProjectEntity',
  'ProjectManagementEntity', 'ProjectManagerEntity', 'SenderEntity', 'SnapshotContainerEntity',
  'SnapshotEntity', 'SnapshotStorageOptionsEntity', 'StorePropEntity', 'TagEntity', 'TaskEntity',
  'TeamEntity', 'TrackerEntity', 'UserEntity', 'VersionEntity', 'VersionHistoryEntity', 'VideoEntity'
] as const;

type EntityName = (typeof entities)[number];

// --------------------
// Step 2: Define generic conversion rules
// --------------------
export const conversionRules: Record<EntityName, (source: any) => any> = Object.fromEntries(
  entities.map(name => [name, (source: any) => ({ ...source })])
) as Record<EntityName, (source: any) => any>;

// --------------------
// Step 3: Add custom rules for specific entities
// --------------------
// Update the UserEntity rule
conversionRules.UserEntity = (source: UserEntity) => ({
  ...source,
  memberLevel: (source as any).memberLevel ?? 'basic',
  teams: source.teams?.map(t => ({ ...t })) ?? [],
});

// --------------------
// Step 4: Generic conversion function using the rules
// --------------------
export function convertEntityWithRules<K extends EntityName>(
  source: any
): ReturnType<typeof conversionRules[K]> {
  const entityName = source.constructor?.name as K;
  if (!entityName) {
    throw new Error('Source object has no constructor name');
  }
  
  const rule = conversionRules[entityName];
  if (!rule) {
    throw new Error(`No conversion rule defined for entity: ${entityName}`);
  }
  return rule(source);
}

// --------------------
// Step 5: Convert an array of entities
// --------------------
export function convertEntitiesArrayWithRules<K extends EntityName>(
  sourceArray: any[]
): ReturnType<typeof conversionRules[K]>[] {
  return sourceArray.map(source => convertEntityWithRules<K>(source));
}

// --------------------
// Step 6: Map converted entity to CommonData
// --------------------
export const mapConvertedEntityToCommonData = <
  T extends SupportedData<any, any, Meta, Attachment, DefaultExcludedFields<T>, keyof T>,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  convertedEntity: T
): CommonData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  const parsedData: ParsedData<T> = { 
    ...convertedEntity, 
    type: (convertedEntity as any).type || 'unknown' 
  };

  return {
    ...parsedData,
    _metadata: (parsedData as any)._metadata ?? {} as Meta,
    _owner: (parsedData as any)._owner ?? null,
    categoryProperties: (parsedData as any).categoryProperties ?? {},
  };
};

// --------------------
// Step 7: Example Usage
// --------------------

// Note: These examples should be in a separate file or commented out in production
/*
const userEntity: UserEntity = {
  id: '1',
  name: 'User',
  email: "user@example.com",
  password: "hashed",
  role: "user",
  username: "user123",
  appId: 'app',
  appName: 'App',
  version: '1.0.0',
  environment: 'development',
  status: 'active',
  avatar: '',
  teams: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true,
};

const convertedUser = convertEntityWithRules<'UserEntity'>(userEntity);
const commonUserData = mapConvertedEntityToCommonData(convertedUser);

const taskEntities: TaskEntity[] = [
  { id: 1, name: "Task 1" },
  { id: 2, name: "Task 2" },
];

const convertedTasks = convertEntitiesArrayWithRules<'TaskEntity'>(taskEntities);
const commonTasks = convertedTasks.map(task => mapConvertedEntityToCommonData(task));
*/