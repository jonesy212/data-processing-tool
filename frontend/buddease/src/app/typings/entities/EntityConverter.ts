import { conversionRules } from './EntityConversionRules';
// --------------------
// Step 1: Define entity mapping
// --------------------

// Map source entity type name to target type (for type-safe conversions)
export type EntityConversionMap = {
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
  FileEntity: FileEntity;
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
  SnapshotContainerEntity: SnapshotContainerEntity;
  SnapshotEntity: SnapshotEntity;
  SnapshotStorageOptionsEntity: SnapshotStorageOptionsEntity;
  StorePropEntity: StorePropEntity;
  TaskEntity: TaskEntity;
  TrackerEntity: TrackerEntity;
  UserEntity: UserEntity;
  VersionEntity: VersionEntity;
  VersionHistoryEntity: VersionHistoryEntity;
  VideoEntity: VideoEntity;
  TagEntity: TagEntity;
  TeamEntity: TeamEntity;
};

// --------------------
// Step 2: Conversion rules (optional per entity)
// --------------------

type EntityConversionMap = {
  [K in keyof typeof conversionRules]: ReturnType<typeof conversionRules[K]>
};

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
  SnapshotContainerEntity: (source: SnapshotContainerEntity) => ({ ...source }),
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
const userEntity: UserEntity = { username: "user123", email: "user123@example.com", teams: [] };
const memberEntity = EntityConverter.convertEntity<'UserEntity'>(userEntity);

// Convert array of TaskEntities (identity conversion)
const taskEntities: TaskEntity[] = [{ id: 1, name: "Task1" }, { id: 2, name: "Task2" }];
const convertedTasks = EntityConverter.convertEntitiesArray<'TaskEntity'>(taskEntities);

// Convert multiple types dynamically
const allEntities: any[] = [userEntity, ...taskEntities];
const convertedAll = allEntities.map(e => EntityConverter.convertEntity(e.constructor.name as keyof EntityConversionMap));
