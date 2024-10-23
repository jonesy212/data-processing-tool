import { SnapshotData } from '@/app/components/snapshots';
import { ContentItem } from "../cards/DummyCardLoader";
import { Snapshot } from "./LocalStorageSnapshotStore";

export interface SnapshotContent <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> extends ContentItem {
  snapshot: Snapshot<T, Meta, K>;
  snapshotData: SnapshotData<T, Meta, K>;
}
