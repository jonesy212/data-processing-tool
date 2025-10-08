import { Snapshot, SnapshotData } from '@/app/snapshots';
import { ContentItem } from "@/app/cards/DummyCardLoader";

export interface SnapshotContent <T extends BaseDataEntity, K extends T = T, Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>> extends ContentItem {
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}
