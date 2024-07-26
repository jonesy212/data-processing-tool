import { SnapshotStoreConfig } from "./SnapshotConfig";
import { BaseData, Data } from "./../../components/models/data/Data";
import {  convertMapToSnapshotStore } from '@/app/components/typings/YourSpecificSnapshotType';

function transformSnapshotConfig<BaseData extends Data, T extends BaseData>(
  config: SnapshotStoreConfig<BaseData, T>
): SnapshotStoreConfig<T, T> {
  const { initialState, configOption, ...rest } = config;

  const transformedConfigOption = configOption
    ? {
        ...configOption,
        initialState: configOption.initialState instanceof Map
          ? new Map([...configOption.initialState.entries()]) as Map<string, T>
          : null,
      }
    : undefined;

  return {
    ...rest,
    initialState: initialState instanceof Map
      ? new Map([...initialState.entries()]) as Map<string, T>
      : null,
    configOption: transformedConfigOption,
  };
}
