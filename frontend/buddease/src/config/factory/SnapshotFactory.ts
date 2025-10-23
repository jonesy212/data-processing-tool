import { Attachment } from '@/app/documents/attachment/Attachment';
import { SnapshotConfigBuilder } from '@/app/snapshots/SnapshotConfigBuilder';
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';
import { DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';


// =========================
// CONFIG FACTORY COMPANION
// =========================

export const SnapshotConfigFactory = {
  create<
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T,
    Extras extends unknown[] = []
  >(
    builder: SnapshotConfigBuilder<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    ...params: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields, Extras>
  ): SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    if (builder.createConfig) {
      return builder.createConfig(params);
    }

    // fallback (manual composition)
    return {
      base: builder.getType(),
      key: builder.getKey(),
      meta: builder.getMeta(),
      excluded: builder.getExcluded(),
      included: builder.getIncluded(),
      options: params,
    } as unknown as SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  },
};