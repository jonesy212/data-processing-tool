import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { BaseData } from "../components/models/data/Data";
import { Snapshot } from "../components/snapshots";

type MetadataMap<
  T extends BaseData<any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
> = Map<string, Snapshot<T, K, Meta>> & BaseData<any, any, any>;


export type { MetadataMap };
