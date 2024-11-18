import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { BaseData } from '@/app/components/models/data/Data';
import { SnapshotData } from '@/app/components/snapshots';
import { ContentItem } from "../cards/DummyCardLoader";
import { Snapshot } from "./LocalStorageSnapshotStore";

export interface SnapshotContent <T extends  BaseData<T>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> extends ContentItem {
  snapshot: Snapshot<T, K>;
  snapshotData: SnapshotData<T, K>;
}
