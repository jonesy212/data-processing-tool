import CalendarManagerStoreClass from "@/app/components/state/stores/CalendarManagerStore";
import { CreateSnapshotStoresPayload } from "../database/Payload";
import { SnapshotManager } from "../hooks/useSnapshotManager";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { Data } from "../models/data/Data";
import { defaultSubscribeToSnapshots } from "./defaultSubscribeToSnapshots";
import { Snapshot } from "@/app/components/snapshots";
import { SnapshotConfig } from "./SnapshotConfig";
import { getChildIds, getParentId, getSnapshot, getSnapshotItems, getSnapshots, handleSnapshot, mapSnapshots, removeSnapshot, takeSnapshot, validateSnapshot } from "./snapshotOperations";
import { SnapshotConfigParams } from './SnapshotConfigBuilder';
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta, mappedSnapshot } from '../../../data_analysis/frontend/buddease/src/app/configs/BaseConfig';
import { TransformMethods } from "./methods/transformMethods";
import { unsubscribe } from "diagnostics_channel";
import {
  getDataVersions, getBackendVersion, getFrontendVersion,
  fetchData, addData
} from "../../../data_analysis/frontend/buddease/src/app/api/ApiData";
import { addSnapshot, mergeSnapshots, getSnapshotId } from "../../../data_analysis/frontend/buddease/src/app/api/SnapshotApi";
import { clearSnapshots, clearSnapshot } from "../../../data_analysis/frontend/buddease/src/app/components/state/redux/slices/SnapshotSlice";
import { notify } from "../../../data_analysis/frontend/buddease/src/app/components/utils/snapshotUtils";
import { flatMap } from "./defaultSnapshotBuilder";
import { defaultSubscribeToSnapshot } from "./defaultSnapshotSubscribeFunctions";
import {
  getAllKeys, getAllItems, addDataStatus, removeData, updateData,
  updateDataTitle, updateDataDescription, updateDataStatus,
  addDataSuccess, getData, setData
} from "./methods/dataMethods";
import * as SnapshotMethodsImplementation from "./methods/snapshotMethods"
import * as VersionMethods from "./methods/snapshotMethods"
import { UtilMethods } from "./methods/utilMethods";
import {
  addSnapshotSuccess, getDelegate, determinePrefix, createInitSnapshot, updateSnapshots,
  updateSnapshotsSuccess, initSnapshot, notifySubscribers, getAllSnapshots,
  batchFetchSnapshots, batchTakeSnapshotsRequest, batchUpdateSnapshotsRequest,
  batchFetchSnapshotsSuccess, batchFetchSnapshotsFailure, batchUpdateSnapshotsSuccess,
  batchUpdateSnapshotsFailure, batchTakeSnapshot, handleSnapshotSuccess, fetchSnapshot,
  updateSnapshotSuccess, createSnapshotFailure, createSnapshotSuccess, onSnapshot, onSnapshots
} from "./snapshotHandlers";
import * as SubscriptionMethods from './methods/subscriptionMethods'


type Params<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> = SnapshotConfigParams<T, K, Meta, ExcludedFields>;

// createSnapshots.ts
const createSnapshots = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(
  id: string,
  snapshotId: string,
  snapshot: Snapshot<T, K, Meta, ExcludedFields>,
  snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>,
  payload: CreateSnapshotStoresPayload<T, K, Meta, ExcludedFields>,
  callback: (snapshots: Snapshot<T, K, Meta, ExcludedFields>[]) => void | null,
  snapshotConfig?: SnapshotConfig<T, K, Meta, ExcludedFields>[],
  category?: Category,
): Snapshot<T, K, Meta, ExcludedFields>[] | null => {
  const { data, events, dataItems, newData } = payload;


    // Create wrapper functions with the correct generic context

  // Example logic to create multiple snapshots
  const snapshots: Snapshot<T, K, Meta, ExcludedFields>[] = [];

  const eventRecords: Record<string, CalendarManagerStoreClass<T, K, Meta, ExcludedFields>[]> = (events && typeof events === 'object')
    ? events
    : {};

  data?.forEach((snapshotData: T, key: string) => {
    // Ensure eventRecords is of type Record<string, CalendarEvent<T, K, Meta, ExcludedFields>[]> or null
    const newSnapshot: Snapshot<T, K, Meta, ExcludedFields> = {
      ...snapshot,
      id: key,
      data: snapshotData,
      eventRecords: eventRecords,
      newData: newData,
      dataItems: dataItems,
      snapshotStoreConfig: null,
      getSnapshotItems: getSnapshotItems ?? (() => { }),
      defaultSubscribeToSnapshots: defaultSubscribeToSnapshots,
      transformSubscriber: TransformMethods.transformSubscriber,
      transformDelegate: TransformMethods.transformDelegate,
      initializedState: undefined,
      getAllKeys: getAllKeys,
      getAllItems: getAllItems,
      addDataStatus: addDataStatus,
      removeData: removeData,
      updateData: updateData,
      updateDataTitle: updateDataTitle,
      updateDataDescription: updateDataDescription,
      updateDataStatus: updateDataStatus,
      addDataSuccess: addDataSuccess,
      getDataVersions: getDataVersions,
      updateDataVersions: VersionMethods.updateDataVersions,
      getBackendVersion: getBackendVersion,
      getFrontendVersion: getFrontendVersion,
      fetchData: fetchData,
      defaultSubscribeToSnapshot: defaultSubscribeToSnapshot,
      handleSubscribeToSnapshot: SubscriptionMethods.handleSubscribeToSnapshot,
      removeItem: removeItem,
      getSnapshot: getSnapshot,
      getSnapshotSuccess: getSnapshotSuccess,
      setItem: setItem,
      getDataStore: {},
      addSnapshotSuccess: addSnapshotSuccess,
      deepCompare: UtilMethods.deepCompare,
      shallowCompare: UtilMethods.shallowCompare,
      determineCategory: UtilMethods.determineCategory,
      getDataStoreMethods: getDataStoreMethods,
      getDelegate: getDelegate,
      determinePrefix: determinePrefix,
      removeSnapshot: removeSnapshot,
      addSnapshotItem: addSnapshotItem,
      addNestedStore: addNestedStore,
      clearSnapshots: clearSnapshots,
      addSnapshot: addSnapshot,
      createSnapshot: null,
      createInitSnapshot: createInitSnapshot,
      setSnapshotSuccess: setSnapshotSuccess,
      setSnapshotFailure: setSnapshotFailure,
      updateSnapshots: updateSnapshots,
      updateSnapshotsSuccess: updateSnapshotsSuccess,
      updateSnapshotsFailure: updateSnapshotsFailure,
      initSnapshot: initSnapshot,
      takeSnapshot: takeSnapshot,
      takeSnapshotSuccess: takeSnapshotSuccess,
      takeSnapshotsSuccess: takeSnapshotsSuccess,
      flatMap: flatMap,
      getState: getState,
      setState: setState,
      validateSnapshot: validateSnapshot,
      handleActions: handleActions,
      setSnapshot: setSnapshot,
      setSnapshots: setSnapshots,
      clearSnapshot: clearSnapshot,
      mergeSnapshots: mergeSnapshots,
      reduceSnapshots: reduceSnapshots,
      sortSnapshots: sortSnapshots,
      filterSnapshots: filterSnapshots,
      findSnapshot: findSnapshot,
      getSubscribers: getSubscribers,
      notify: notify,
      notifySubscribers: notifySubscribers,
      getSnapshots: getSnapshots,
      getAllSnapshots: getAllSnapshots,
      generateId: generateId,
      batchFetchSnapshots: batchFetchSnapshots,
      batchTakeSnapshotsRequest: batchTakeSnapshotsRequest,
      batchUpdateSnapshotsRequest: batchUpdateSnapshotsRequest,
      filterSnapshotsByStatus: undefined,
      filterSnapshotsByCategory: undefined,
      filterSnapshotsByTag: undefined,
      batchFetchSnapshotsSuccess: batchFetchSnapshotsSuccess,
      batchFetchSnapshotsFailure: batchFetchSnapshotsFailure,
      batchUpdateSnapshotsSuccess: batchUpdateSnapshotsSuccess,
      batchUpdateSnapshotsFailure: batchUpdateSnapshotsFailure,
      batchTakeSnapshot: batchTakeSnapshot,
      handleSnapshotSuccess: handleSnapshotSuccess,
      getSnapshotId: getSnapshotId,
      compareSnapshotState: compareSnapshotState,
      snapshotStore: null,
      getParentId: getParentId,
      getChildIds: getChildIds,
      addChild: addChild,
      removeChild: removeChild,
      getChildren: getChildren,
      hasChildren: hasChildren,
      isDescendantOf: isDescendantOf,
      timestamp: undefined,
      getInitialState: getInitialState,
      getConfigOption: getConfigOption,
      getTimestamp: getTimestamp,
      getStores: getStores,
      getData: getData,
      setData: setData,
      addData: addData,
      stores: null,
      getStore: getStore,
      addStore: addStore,
      mapSnapshot: mapSnapshot,
      mapSnapshots: mapSnapshots,
      removeStore: removeStore,
      unsubscribe: unsubscribe,
      fetchSnapshot: fetchSnapshot,
      addSnapshotFailure: addSnapshotFailure,
      configureSnapshotStore: configureSnapshotStore,
      updateSnapshotSuccess: updateSnapshotSuccess,
      createSnapshotFailure: createSnapshotFailure,
      createSnapshotSuccess: createSnapshotSuccess,
      createSnapshots: createSnapshots,
      onSnapshot: onSnapshot,
      onSnapshots: onSnapshots,
      label: undefined,
      events: {
        callbacks: callbacks,
        eventRecords: null
      },
      handleSnapshot: handleSnapshot,
      meta: {}
    };

    snapshots.push(newSnapshot);
  });

  // Call the callback function with the created snapshots
  if (callback) {
    callback(snapshots);
  }

  return snapshots.length > 0 ? snapshots : null;
};
