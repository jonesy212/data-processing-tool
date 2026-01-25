// processSnapshotList.tsx
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import SnapshotList from '@/core/snapshots/SnapshotList';
import DynamicEventHandlerExample from '@/core/typings/eventHandlers/DynamicEventHandlerExample';

const processSnapshotList = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotList: SnapshotList<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
) => {
  // Implement your logic to process the snapshot list here
  snapshotList.sortByDate();
  snapshotList.filterByCategory("important");

  DynamicEventHandlerExample.handleSorting(snapshotList, null);

  return snapshotList;
};

export default processSnapshotList;
