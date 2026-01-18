// snapshotBuilder.ts

import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { SnapshotConfigBuilder } from '@/core/snapshots/SnapshotConfigBuilder';

// Conditional Utility Types
export type SnapshotConfigArgs<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  Excluded extends keyof T = DefaultExcludedFields<T>
> = {
  type: T;
  key?: K;
  meta?: Meta;
  excluded?: Excluded;
};

export type BuilderFromArgs<Args extends SnapshotConfigArgs> = 
  SnapshotConfigBuilder<
    Args['type'],
    Args['key'] extends undefined ? Args['type'] : NonNullable<Args['key']>,
    Args['meta'] extends undefined ? DefaultMeta<Args['type'], Args['key'] extends undefined ? Args['type'] : NonNullable<Args['key']>> : NonNullable<Args['meta']>,
    Args['attachmentType'] extends undefined ? Attachment : NonNullable<Args['attachmentType']>,
    Args['excluded'] extends undefined ? DefaultExcludedFields<Args['type']> : NonNullable<Args['excluded']>,
    Args['included'] extends undefined ? keyof Args['type'] : NonNullable<Args['included']>
  >;


// Core curried builder function
function createSnapshotBuilder<T extends BaseDataEntity>(type: T) {
  return {
    withKey<K extends T>(key: K) {
      return {
        withMeta<Meta extends DefaultMeta<T, K>>(meta: Meta) {
          return {
            withAttachmentType<AttachmentType extends Attachment>(attachmentType: AttachmentType) {
              return {
                withExcluded<Excluded extends keyof T>(excluded: Excluded) {
                  return {
                    withIncluded<Included extends keyof T>(included: Included) {
                      return {
                        build: () => ({} as SnapshotConfigBuilder<T, K, Meta, AttachmentType, Excluded, Included>)
                      };
                    },
                    build: () => ({} as SnapshotConfigBuilder<T, K, Meta, AttachmentType, Excluded, keyof T>)
                  };
                },
                build: () => ({} as SnapshotConfigBuilder<T, K, Meta, AttachmentType, DefaultExcludedFields<T>, keyof T>)
              };
            },
            build: () => ({} as SnapshotConfigBuilder<T, K, Meta, Attachment, DefaultExcludedFields<T>, keyof T>)
          };
        },
        build: () => ({} as SnapshotConfigBuilder<T, K, DefaultMeta<T, K>, Attachment, DefaultExcludedFields<T>, keyof T>)
      };
    },
    build: () => ({} as SnapshotConfigBuilder<T, T, DefaultMeta<T, T>, Attachment, DefaultExcludedFields<T>, keyof T>)
  };
}

// Hybrid main export function
export function snapshotBuilder<T extends BaseDataEntity>(type: T) {
  const curried = createSnapshotBuilder(type);
  
  return {
    // Curried API methods
    withKey: curried.withKey,
    build: curried.build,
    
    // Config object API method
    configure: <
      K extends T = T, 
      Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>, 
      AttachmentType extends Attachment = Attachment,
      ExcludedFields extends keyof T = DefaultExcludedFields<T>,
      IncludedFields extends keyof T = keyof T
    >(
      config: { 
        key?: K; 
        meta?: Meta; 
        attachmentType?: AttachmentType;
        excluded?: ExcludedFields; 
        included?: IncludedFields;
      } = {}
    ): SnapshotConfigBuilder<
      T,
      K,
      Meta,
      AttachmentType,
      ExcludedFields,
      IncludedFields
    > => {
      // Implementation that creates the builder from config
      return {} as any;
    }
  };
}

// Utility type for easy access
export type SnapshotBuilder<T extends BaseDataEntity> = ReturnType<typeof snapshotBuilder<T>>;