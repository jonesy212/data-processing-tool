// snapshotBuilder.ts

import { BaseDataRoot } from "@/configs/BaseConfig";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/configs/BaseConfig';
import { SnapshotConfigBuilder } from './SnapshotConfigBuilder';

// Conditional Utility Types
export type SnapshotConfigArgs<
  T extends BaseDataEntity = BaseDataRoot,
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
    Args['excluded'] extends undefined ? DefaultExcludedFields<Args['type']> : NonNullable<Args['excluded']>
  >;

// Core curried builder function
function createSnapshotBuilder<T extends BaseDataEntity>(type: T) {
  return {
    withKey<K extends T>(key: K) {
      return {
        withMeta<Meta extends DefaultMeta<T, K>>(meta: Meta) {
          return {
            withExcluded<Excluded extends keyof T>(excluded: Excluded) {
              return {
                build: () => ({} as SnapshotConfigBuilder<T, K, Meta, Excluded>)
              };
            },
            build: () => ({} as SnapshotConfigBuilder<T, K, Meta, DefaultExcludedFields<T>>)
          };
        },
        build: () => ({} as SnapshotConfigBuilder<T, K, DefaultMeta<T, K>, DefaultExcludedFields<T>>)
      };
    },
    build: () => ({} as SnapshotConfigBuilder<T, T, DefaultMeta<T, T>, DefaultExcludedFields<T>>)
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
    configure: <K extends T, Meta extends DefaultMeta<T, K>, Excluded extends keyof T>(
      config: { key?: K; meta?: Meta; excluded?: Excluded } = {}
    ): SnapshotConfigBuilder<
      T,
      K extends undefined ? T : NonNullable<K>,
      Meta extends undefined ? DefaultMeta<T, K extends undefined ? T : NonNullable<K>> : NonNullable<Meta>,
      Excluded extends undefined ? DefaultExcludedFields<T> : NonNullable<Excluded>
    > => {
      // Implementation that creates the builder from config
      return {} as any;
    }
  };
}

// Utility type for easy access
export type SnapshotBuilder<T extends BaseDataEntity> = ReturnType<typeof snapshotBuilder<T>>;