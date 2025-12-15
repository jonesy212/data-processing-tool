// EntityConverter.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { ApiEntity } from '@/app/typings/entities/ApiEntity';
import { AppEntity } from '@/app/typings/entities/AppEntity';
import { AppMetadataEntity } from '@/app/typings/entities/AppMetadataEntity';
import { ArticleEntity } from '@/app/typings/entities/ArticleEntity';
import { AuthEntity } from '@/app/typings/entities/AuthEntity';
import { BlogEntity } from '@/app/typings/entities/BlogEntity';
import { CalendarEntity } from '@/app/typings/entities/CalendarEntity';
import { ChatEntity } from '@/app/typings/entities/ChatEntity';
import { ChatRoomEntity } from '@/app/typings/entities/ChatRoomEntity';
import { CommonEntities } from '@/app/typings/entities/CommonEntities';
import { ConfigEntity } from '@/app/typings/entities/ConfigEntity';
import { ContentEntity } from '@/app/typings/entities/ContentEntity';
import { DataEntity } from '@/app/typings/entities/DataEntity';
import { DocumentEntity } from '@/app/typings/entities/DocumentEntity';
import { DrawingEntity } from '@/app/typings/entities/DrawingEntity';
import { EventEntity } from '@/app/typings/entities/EventEntity';
import { ExampleEntity } from '@/app/typings/entities/ExampleEntity';
import { ExtendedDappEntity } from '@/app/typings/entities/ExtendedDappEntity';
import { FileEntity } from '@/app/typings/entities/FileEntity';
import { FilterEntity } from '@/app/typings/entities/FilterEntity';
import { LogEntity } from '@/app/typings/entities/LogEntity';
import { MeetingEntity } from '@/app/typings/entities/MeetingEntity';
import { MemberEntity } from '@/app/typings/entities/MemberEntity';
import { MessageEntity } from '@/app/typings/entities/MessageEntity';
import { MetaEntity } from '@/app/typings/entities/MetaEntity';
import { NoteEntity } from '@/app/typings/entities/NoteEntity';
import { NotificationEntity } from '@/app/typings/entities/NotificationEntity';
import { PhaseEntity } from '@/app/typings/entities/PhaseEntity';
import { ProductEntity } from '@/app/typings/entities/ProductEntity';
import { ProjectEntity } from '@/app/typings/entities/ProjectEntity';
import { ProjectManagementEntity } from '@/app/typings/entities/ProjectManagementEntity';
import { ProjectManagerEntity } from '@/app/typings/entities/ProjectManagerEntity';
import { SenderEntity } from '@/app/typings/entities/SenderEntity';
import { SnapshotContainerEntity } from '@/app/typings/entities/SnapshotContainerEntity';
import { SnapshotEntity } from '@/app/typings/entities/SnapshotEntity';
import { SnapshotStorageEntity } from '@/app/typings/entities/SnapshotStorageOptionsEntity';
import { StorePropEntity } from '@/app/typings/entities/StorePropEntity';
import { TagEntity } from '@/app/typings/entities/TagEntity';
import { TaskEntity } from '@/app/typings/entities/TaskEntity';
import { TeamEntity } from '@/app/typings/entities/TeamEntity';
import { TrackerEntity } from '@/app/typings/entities/TrackerEntity';
import { UserEntity } from '@/app/typings/entities/UserEntity';
import { VersionEntity } from '@/app/typings/entities/VersionEntity';
import { VersionHistoryEntity } from '@/app/typings/entities/VersionHistoryEntity';
import { VideoEntity } from '@/app/typings/entities/VideoEntity';
import { conversionRules } from './EntityConversionRules';

import { Attachment } from '@/app/documents/attachment/Attachment';

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
