// config/metadata/MetadataHooks.ts
import { SharedRelationshipData } from '@/app/models/data/Data';
import { fetchUserAreaDimensions } from '@/app/pages/layouts/fetchUserAreaDimensions';
import { createEventManager } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { UserConfig } from "@/app/snapshots/SnapshotStoreConfig";
import { HistoryEntry } from '@/app/state/stores/HistoryStore';
import { UserData } from "@/app/users/User";
import { VersionData, VersionHistory } from "@/app/versions/VersionData";
import { AppStructureItem } from "@/config/appStructure/AppStructure";
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { UnifiedMetadata, UnifiedMetaDataOptions } from "@/config/MetaDataOptions";
import { StructuredMetadata } from '@/config/StructuredMetadata';
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
  latestVersion?: Pick<VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, "id" | "versionNumber" | "author" | "schema">;
  history?: HistoryEntry[];
}

interface MyMetaState<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends VersionHistory<T, K> {
  _structure: Record<string, AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;
  latestVersion?: Pick<VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, "id" | "versionNumber" | "author" | "schema">;
  timestamp: string | number | Date | undefined;
}

// Client-side type definitions
type BaseDataWithAttachment = BaseDataEntity;
type BaseType = BaseDataEntity;
type ExtendedType = BaseDataEntity &
  UserConfig<T, K, DefaultMeta<T, K>> & 
  UserData<T, K, DefaultMeta<T, K>>;

// Client-side constants
const area = `${fetchUserAreaDimensions().width}x${fetchUserAreaDimensions().height}`;

const lastUpdated: VersionHistory<BaseType, ExtendedType> = {
  versionData: {},
  latestVersion: {} as VersionData<BaseType, ExtendedType>,
  history: [],
  timestamp: new Date(),
  versions: [],              
  currentVersionIndex: 0     
};

const events = createEventManager<
  BaseDataRoot,
  ExtendedType,
  StructuredMetadata<BaseDataRoot, ExtendedType, DefaultMeta<BaseDataRoot, ExtendedType>, never>
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
  const [options, setOptions] = useState<UnifiedMetaDataOptions<T, K>>(initialOptions);

  const updateOptions = (newOptions: Partial<UnifiedMetaDataOptions<T, K>>) => {
    setOptions((prevOptions) => ({ ...prevOptions, ...newOptions }));
  };

  return { options, setOptions, updateOptions };
};

export const sharedBaseData: SharedRelationshipData<any> = {
  childIds: [],
  relatedData: []
};

export type { MetaState, MyMetaState };
