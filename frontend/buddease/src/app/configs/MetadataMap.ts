import { Snapshot } from "@/app/components/snapshots";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { BaseData } from "../components/models/data/Data";

type MetadataMap<
  T extends BaseData<any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
> = Map<string, Snapshot<T, K, Meta>> & BaseData<any, any, any>;


export type { MetadataMap };
