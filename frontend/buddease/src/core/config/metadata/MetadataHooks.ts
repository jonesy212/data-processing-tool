// MetadataHooks.ts
config/metadata/MetadataHooks.ts
import { AppStructureItem } from "@/core/config/appStructure/AppStructure";
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { UnifiedMetadata, UnifiedMetaDataOptions } from "@/core/config/MetaDataOptions";
import type { UserAttachment, UserEntity, UserExcludedFields, UserIncludedFields, UserK, UserMeta } from '@/core/typings/entities/UserEntity';
import { Version } from '@/core/versions/Version';

import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { SharedRelationshipData } from '@/core/models/data/Data';
import { fetchUserAreaDimensions } from '@/core/pages/layouts/fetchUserAreaDimensions';
import type { UserConfig } from "@/core/snapshots/SnapshotStoreConfig";

import type { createEventManager } from "@/core/state/stores/DataStore";
import { HistoryEntry } from '@/core/state/stores/HistoryStore';
import type { EventAttachment, EventEntity, EventMeta } from '@/core/typings/entities/EventEntity';
import { EventExcludedFields, EventIncludedFields, EventK } from '@/core/typings/entities/EventEntity';
    EventAttachment,
    EventEntity,
    EventExcludedFields,
    EventIncludedFields,
    EventK,
    EventMeta
} from '@/core/typings/entities/EventEntity';
import type { VersionHistoryAttachment, VersionHistoryEntity, VersionHistoryExcludedFields, VersionHistoryIncludedFields, VersionHistoryK, VersionHistoryMeta } from '@/core/typings/entities/VersionHistoryEntity';
    VersionHistoryAttachment,
    VersionHistoryEntity,
    VersionHistoryExcludedFields,
    VersionHistoryIncludedFields,
    VersionHistoryK,
    VersionHistoryMeta
} from '@/core/typings/entities/VersionHistoryEntity';
import { UserData } from "@/core/users/User";
import { VersionData, VersionHistory } from "@/core/versions/VersionData";
import { useState } from 'react';

// Client-side metadata state interfaces
interface MetaState<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  _structure: Record<string, AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;
  transformToStructureItems: (data: any) => AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  getStructure: () => Promise<Record<string, AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | undefined>;
  versionData?: string | VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  latestVersion?: Pick<Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  history?: HistoryEntry[];
}

interface MyMetaState<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends VersionHistory<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  _structure: Record<string, AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;
  latestVersion?: Pick<Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  timestamp: string | number | Date | undefined;
}

// Client-side type definitions
type BaseDataWithAttachment = BaseDataEntity;
type BaseType = BaseDataEntity;
type ExtendedType = BaseDataEntity &
  UserConfig<UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields> & 
  UserData<UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields>;

// Client-side constants
const area = `${fetchUserAreaDimensions().width}x${fetchUserAreaDimensions().height}`;

const lastUpdated: VersionHistory<VersionHistoryEntity, VersionHistoryK, VersionHistoryMeta, VersionHistoryAttachment, VersionHistoryExcludedFields, VersionHistoryIncludedFields> = {
  versionData: {},
  latestVersion: {} as Version<VersionHistoryEntity, VersionHistoryK, VersionHistoryMeta, VersionHistoryAttachment, VersionHistoryExcludedFields, VersionHistoryIncludedFields>,
  history: [],
  timestamp: new Date(),
  versions: [],              
  currentVersionIndex: 0     
};

const events = createEventManager<EventEntity,
  EventK,
  EventMeta,
  EventAttachment,
  EventExcludedFields,
  EventIncludedFields
>();

// Client-side React hooks for metadata
export const useMeta = <
  T extends BaseDataEntity, 
  K extends T = T, 
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
>(
  initialMetadata: Meta
) => {
  const [metadata, setMetadata] = useState<Meta>(initialMetadata);

  const updateMetadata = (newMetadata: Partial<Meta>) => {
    setMetadata((prevMetadata) => ({ ...prevMetadata, ...newMetadata }));
  };

  return { metadata, setMetadata, updateMetadata };
};

export const useMetadata = < 
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  >(
  initialOptions: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
) => {
  const [options, setOptions] = useState<UnifiedMetaDataOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(initialOptions);

  const updateOptions = (newOptions: Partial<UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>) => {
    setOptions((prevOptions) => ({ ...prevOptions, ...newOptions }));
  };

  return { options, setOptions, updateOptions };
};

export const sharedBaseData: SharedRelationshipData<any> = {
  childIds: [],
  relatedData: []
};

export type { MetaState, MyMetaState };
