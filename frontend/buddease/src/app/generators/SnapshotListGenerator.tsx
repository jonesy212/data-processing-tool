// SnapshotListGenerator.tsx
import SnapshotList, { SnapshotItem } from "@/app/snapshots/SnapshotList";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "@/app/config/BaseConfig";
import { Attachment } from "@/app/documents/attachment/Attachment";

class SnapshotListGenerator<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  generateSnapshotList(rawData: Partial<SnapshotItem>[] = []): SnapshotList<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    const snapshotList = new SnapshotList<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>();

    rawData.forEach((data) => {
      const snapshotItem: SnapshotItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
        id: data.id || "",
        value: data.value,
        label: data.label || "",
        message: data.message,
        user: data.user,
        data: data.data,
        category: data.category || "",
        timestamp: data.timestamp || new Date().toISOString(),
        updatedAt: data.updatedAt
      };
      snapshotList.addSnapshot(snapshotItem);
    });

    return snapshotList;
  }
}

export default SnapshotListGenerator;
