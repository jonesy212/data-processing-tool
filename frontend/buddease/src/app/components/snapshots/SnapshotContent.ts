import { BaseData } from '@/app/components/models/data/Data';
import { Snapshot, SnapshotData } from '@/app/components/snapshots';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { ContentItem } from "../cards/DummyCardLoader";

export interface SnapshotContent <T extends  BaseData<any>, K extends T = T, Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>> extends ContentItem {
  snapshot: Snapshot<T, K>;
  snapshotData: SnapshotData<T, K>;
}
