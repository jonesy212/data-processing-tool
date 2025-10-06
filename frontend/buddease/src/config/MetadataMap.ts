import { BaseData } from '@/app/models/data/Data';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { StructuredMetadata } from "@/config/StructuredMetadata";

type MetadataMap<
  T extends BaseData<any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
> = Map<string, Snapshot<T, K, Meta>> & BaseData<any, any, any>;


export type { MetadataMap };
