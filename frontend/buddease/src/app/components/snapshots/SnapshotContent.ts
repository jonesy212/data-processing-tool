import { Snapshot, SnapshotData } from '@/app/components/snapshots';
import { ContentItem } from "../cards/DummyCardLoader";

export interface SnapshotContent <T extends BaseDataEntity, K extends T = T, Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>> extends ContentItem {
  snapshot: Snapshot<T, K, Meta, ExcludedFields>;
  snapshotData: SnapshotData<T, K, Meta, ExcludedFields>;
}
