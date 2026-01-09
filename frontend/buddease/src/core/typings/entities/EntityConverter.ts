// EntityConverter.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { ApiEntity } from '@/core/typings/entities/ApiEntity';
import type { AppEntity } from '@/core/typings/entities/AppEntity';
import type { AppMetadataEntity } from '@/core/typings/entities/AppMetadataEntity';
import type { ArticleEntity } from '@/core/typings/entities/ArticleEntity';
import type { AuthEntity } from '@/core/typings/entities/AuthEntity';
import type { BlogEntity } from '@/core/typings/entities/BlogEntity';
import type { CalendarEntity } from '@/core/typings/entities/CalendarEntity';
import type { ChatEntity } from '@/core/typings/entities/ChatEntity';
import type { ChatRoomEntity } from '@/core/typings/entities/ChatRoomEntity';
import type { CommonEntities } from '@/core/typings/entities/CommonEntities';
import type { ConfigEntity } from '@/core/typings/entities/ConfigEntity';
import type { ContentEntity } from '@/core/typings/entities/ContentEntity';
import type { DataEntity } from '@/core/typings/entities/DataEntity';
import type { DocumentEntity } from '@/core/typings/entities/DocumentEntity';
import type { DrawingEntity } from '@/core/typings/entities/DrawingEntity';
import { conversionRules } from '@/core/typings/entities/EntityConversionRules';
import type { EntityConversionRules } from '@/core/typings/entities/EntityConversionRules';
import type { EventEntity } from '@/core/typings/entities/EventEntity';
import type { ExampleEntity } from '@/core/typings/entities/ExampleEntity';
import type { ExtendedDappEntity } from '@/core/typings/entities/ExtendedDappEntity';
import type { FileEntity } from '@/core/typings/entities/FileEntity';
import type { FilterEntity } from '@/core/typings/entities/FilterEntity';
import type { LogEntity } from '@/core/typings/entities/LogEntity';
import type { MeetingEntity } from '@/core/typings/entities/MeetingEntity';
import type { MemberEntity } from '@/core/typings/entities/MemberEntity';
import type { MessageEntity } from '@/core/typings/entities/MessageEntity';
import type { MetaEntity } from '@/core/typings/entities/MetaEntity';
import type { NoteEntity } from '@/core/typings/entities/NoteEntity';
import type { NotificationEntity } from '@/core/typings/entities/NotificationEntity';
import type { PhaseEntity } from '@/core/typings/entities/PhaseEntity';
import type { ProductEntity } from '@/core/typings/entities/ProductEntity';
import type { ProjectEntity } from '@/core/typings/entities/ProjectEntity';
import type { ProjectManagementEntity } from '@/core/typings/entities/ProjectManagementEntity';
import type { ProjectManagerEntity } from '@/core/typings/entities/ProjectManagerEntity';
import type { SenderEntity } from '@/core/typings/entities/SenderEntity';
import type { SnapshotContainerEntity } from '@/core/typings/entities/SnapshotContainerEntity';
import type { SnapshotEntity } from '@/core/typings/entities/SnapshotEntity';
import type { SnapshotStorageEntity } from '@/core/typings/entities/SnapshotStorageOptionsEntity';
import type { StorePropEntity } from '@/core/typings/entities/StorePropEntity';
import type { TagEntity } from '@/core/typings/entities/TagEntity';
import type { TaskEntity } from '@/core/typings/entities/TaskEntity';
import type { TeamEntity } from '@/core/typings/entities/TeamEntity';
import type { TrackerEntity } from '@/core/typings/entities/TrackerEntity';
import type { UserEntity } from '@/core/typings/entities/UserEntity';
import type { VersionEntity } from '@/core/typings/entities/VersionEntity';
import type { VersionHistoryEntity } from '@/core/typings/entities/VersionHistoryEntity';
import type { VideoEntity } from '@/core/typings/entities/VideoEntity';

import type { Attachment } from '@/core/documents/attachment/Attachment';

// --------------------
// Step 1: Define entity mapping
// --------------------

// Map source entity type name to target type (for type-safe conversions)
type EntityConversionMap<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = {
  ApiEntity: ApiEntity;
  AppEntity: AppEntity;
  AppMetadataEntity: AppMetadataEntity;
  ArticleEntity: ArticleEntity;
  AuthEntity: AuthEntity;
  BlogEntity: BlogEntity;
  CalendarEntity: CalendarEntity;
  ChatEntity: ChatEntity;
  ChatRoomEntity: ChatRoomEntity;
  CommonEntities: CommonEntities;
  ConfigEntity: ConfigEntity;
  ContentEntity: ContentEntity;
  DataEntity: DataEntity;
  DocumentEntity: DocumentEntity;
  DrawingEntity: DrawingEntity;
  EventEntity: EventEntity;
  ExampleEntity: ExampleEntity;
  FilterEntity: FilterEntity;
  ExtendedDappEntity: ExtendedDappEntity;
  FileEntity: FileEntity;
  LogEntity: LogEntity;
  MeetingEntity: MeetingEntity;
  MemberEntity: MemberEntity;
  MessageEntity: MessageEntity;
  MetaEntity: MetaEntity;
  NoteEntity: NoteEntity;
  NotificationEntity: NotificationEntity;
  PhaseEntity: PhaseEntity;
  ProductEntity: ProductEntity;
  ProjectEntity: ProjectEntity;
  ProjectManagementEntity: ProjectManagementEntity;
  ProjectManagerEntity: ProjectManagerEntity;
  SenderEntity: SenderEntity;
  SnapshotContainerEntity: SnapshotContainerEntity<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  SnapshotEntity: SnapshotEntity;
  SnapshotStorageEntity: SnapshotStorageEntity;
  StorePropEntity: StorePropEntity;
  TaskEntity: TaskEntity;
  TrackerEntity: TrackerEntity;
  UserEntity: UserEntity;
  VersionEntity: VersionEntity;
  VersionHistoryEntity: VersionHistoryEntity;
  VideoEntity: VideoEntity;
  TagEntity: TagEntity;
  TeamEntity: TeamEntity;
}& {
  [RuleKey in keyof typeof conversionRules]: ReturnType<typeof conversionRules[RuleKey]>;
};;


export const entityConversionRules: EntityConversionRules = {
  UserEntity: (source: UserEntity) => ({
    ...source,
    teams: source.teams?.map(t => ({ ...t })) ?? [],
  }),
  MemberEntity: (source: MemberEntity) => ({ ...source }),
  TaskEntity: (source: TaskEntity) => ({ ...source }),
  ProjectEntity: (source: ProjectEntity) => ({ ...source }),
  ProjectManagementEntity: (source: ProjectManagementEntity) => ({ ...source }),
  DocumentEntity: (source: DocumentEntity) => ({ ...source }),
  NoteEntity: (source: NoteEntity) => ({ ...source }),
  AppEntity: (source: AppEntity) => ({ ...source }),
  ArticleEntity: (source: ArticleEntity) => ({ ...source }),
  CalendarEntity: (source: CalendarEntity) => ({ ...source }),
  ChatEntity: (source: ChatEntity) => ({ ...source }),
  ChatRoomEntity: (source: ChatRoomEntity) => ({ ...source }),
  ExtendedDappEntity: (source: ExtendedDappEntity) => ({ ...source }),
  FileEntity: (source: FileEntity) => ({ ...source }),
  LogEntity: (source: LogEntity) => ({ ...source }),
  MeetingEntity: (source: MeetingEntity) => ({ ...source }),
  MessageEntity: (source: MessageEntity) => ({ ...source }),
  MetaEntity: (source: MetaEntity) => ({ ...source }),
  NotificationEntity: (source: NotificationEntity) => ({ ...source }),
  PhaseEntity: (source: PhaseEntity) => ({ ...source }),
  ProductEntity: (source: ProductEntity) => ({ ...source }),
  SenderEntity: (source: SenderEntity) => ({ ...source }),
  SnapshotContainerEntity: (source: SnapshotContainerEntity<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => ({ ...source }),
  SnapshotEntity: (source: SnapshotEntity) => ({ ...source }),
  SnapshotStorageOptionsEntity: (source: SnapshotStorageOptionsEntity) => ({ ...source }),
  StorePropEntity: (source: StorePropEntity) => ({ ...source }),
  TrackerEntity: (source: TrackerEntity) => ({ ...source }),
  VersionEntity: (source: VersionEntity) => ({ ...source }),
  VersionHistoryEntity: (source: VersionHistoryEntity) => ({ ...source }),
  VideoEntity: (source: VideoEntity) => ({ ...source }),
  TagEntity: (source: TagEntity) => ({ ...source }),
  TeamEntity: (source: TeamEntity) => ({ ...source }),
  // Default rule: identity (simple spread) for all other entities
};

// --------------------
// Step 3: EntityConverter class
// --------------------

export class EntityConverter {
  /**
   * Convert a single entity to its mapped target type
   */
  static convertEntity<Source extends keyof EntityConversionMap>(
    source: any
  ): EntityConversionMap[Source] {
    const entityName = source.constructor.name as Source;
    const rule = entityConversionRules[entityName];
    if (rule) return rule(source);

    return { ...source } as EntityConversionMap[Source];
  }

  /**
   * Convert an array of entities to their mapped target types
   */
  static convertEntitiesArray<Source extends keyof EntityConversionMap>(
    sourceArray: any[]
  ): EntityConversionMap[Source][] {
    return sourceArray.map(entity => EntityConverter.convertEntity<Source>(entity));
  }
}

// --------------------
// Step 4: Usage Examples
// --------------------

// Convert single UserEntity to MemberEntity
const userEntity: UserEntity = { id, name, password, role, username: "user123", email: "user123@example.com", teams: [] };
const memberEntity = EntityConverter.convertEntity<'UserEntity'>(userEntity);

// Convert array of TaskEntities (identity conversion)
const taskEntities: TaskEntity[] = [{ id: 1, name: "Task1", path, draft }, { id: 2, name: "Task2", path, draft }];
const convertedTasks = EntityConverter.convertEntitiesArray<'TaskEntity'>(taskEntities);

// Convert multiple types dynamically
const allEntities: any[] = [userEntity, ...taskEntities];
const convertedAll = allEntities.map(e => EntityConverter.convertEntity(e.constructor.name as keyof EntityConversionMap));
