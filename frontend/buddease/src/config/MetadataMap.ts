import { BaseData } from '@/app/models/data/Data';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { StructuredMetadata } from "@/config/StructuredMetadata";

type MetadataMap<
  T extends BaseData<any>,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
> = Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> & BaseData<any, any, any>;


export type { MetadataMap };
