// import { Data } from "./../../components/models/data/Data";
// import { SnapshotStoreConfig } from "./SnapshotConfig";

// function transformSnapshotConfig<BaseData extends Data, T extends BaseData>(
//   config: SnapshotStoreConfig<BaseData, T>
// ): SnapshotStoreConfig<T, K> {
//   const { initialState, configOption, ...rest } = config;

//   const transformedConfigOption = configOption
//     ? {
//         ...configOption,
//         initialState: configOption.initialState instanceof Map
//           ? new Map([...configOption.initialState.entries()]) as Map<string, T>
//           : null,
//       }
//     : undefined;

//   return {
//     ...rest,
//     initialState: initialState instanceof Map
//       ? new Map([...initialState.entries()]) as Map<string, T>
//       : null,
//     configOption: transformedConfigOption,
//   };
// }
