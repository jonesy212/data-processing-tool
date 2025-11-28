// EntityConversionRules.ts
import {
  ApiEntity,
  AppEntity,
  AppMetadataEntity,
  ArticleEntity,
  AuthEntity,
  BlogEntity,
  CalendarEntity,
  ChatEntity,
  ChatRoomEntity,
  CommonEntities,
  ConfigEntity,
  ContentEntity,
  DataEntity,
  DocumentEntity,
  DrawingEntity,
  ExtendedDappEntity,
  EventEntity,
  ExampleEntity,
  FileEntity,
  FilterEntity,
  LogEntity,
  MeetingEntity,
  MessageEntity,
  MemberEntity,
  MetaEntity,
  NoteEntity,
  NotificationEntity,
  PhaseEntity,
  ProductEntity,
  ProjectEntity,
  ProjectManagementEntity,
  ProjectManagerEntity,
  SenderEntity,
  SnapshotContainerEntity,
  SnapshotEntity,
  SnapshotStorageOptionsEntity,
  StorePropEntity,
  TagEntity,
  TaskEntity,
  TeamEntity,
  TrackerEntity,
  UserEntity,
  VersionEntity,
  VersionHistoryEntity,
  VideoEntity
} from '@/app/typings/entities';

import { SupportedData, CommonData } from '@/app/typings/commonData';
import { ParsedData } from '@/app/typings/parsedData';
import { Attachment, DefaultExcludedFields, DefaultMeta } from '@/app/typings/base';

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
conversionRules.UserEntity = (source: UserEntity) => ({
  ...source,
  memberLevel: (source as any).memberLevel ?? 'basic',
  teams: source.teams?.map(t => ({ ...t })) ?? [],
});

// --------------------
// Step 4: Generic conversion function using the rules
// --------------------
export function convertEntityWithRules<K extends EntityName>(
  source: InstanceType<any>
): ReturnType<typeof conversionRules[K]> {
  const entityName = source.constructor.name as K;
  const rule = conversionRules[entityName];
  if (!rule) throw new Error(`No conversion rule defined for entity: ${entityName}`);
  return rule(source);
}

// --------------------
// Step 5: Convert an array of entities
// --------------------
export function convertEntitiesArrayWithRules<K extends EntityName>(
  sourceArray: InstanceType<any>[]
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
  const parsedData: ParsedData<T> = { ...convertedEntity, type: (convertedEntity as any).type };

  return {
    ...parsedData,
    _metadata: (parsedData as any)._metadata ?? {} as Meta,
    _owner: (parsedData as any)._owner ?? null,
    categoryProperties: (parsedData as any).categoryProperties ?? {},
    ...parsedData
  };
};

// --------------------
// Step 7: Example Usage
// --------------------
const userEntity: UserEntity = {
  username: "user123",
  email: "user123@example.com",
  teams: [],
};

const convertedUser = convertEntityWithRules<'UserEntity'>(userEntity);
const commonUserData = mapConvertedEntityToCommonData(convertedUser);

const taskEntities: TaskEntity[] = [
  { id: 1, name: "Task 1" },
  { id: 2, name: "Task 2" },
];

const convertedTasks = convertEntitiesArrayWithRules<'TaskEntity'>(taskEntities);
const commonTasks = convertedTasks.map(task => mapConvertedEntityToCommonData(task));
