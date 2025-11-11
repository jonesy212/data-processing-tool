// createSnapshots.ts
import {
  addData,
  fetchData,
  getBackendVersion,
  getDataVersions,
  getFrontendVersion
} from "@/app/api/ApiData";
import { addSnapshot, getSnapshotId, mergeSnapshots } from "@/app/api/SnapshotApi";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { CreateSnapshotStoresPayload } from "@/app/database/Payload";
import { SnapshotManager } from "@/app/hooks/useSnapshotManager";
import useSubscription from "@/app/hooks/useSubscription";
import { Category } from "@/app/libraries/categories/generateCategoryProperties";
import { Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotConfigParams } from '@/app/snapshots/SnapshotConfigBuilder';
import { clearSnapshot, clearSnapshots } from "@/app/state/redux/slices/SnapshotSlice";
import CalendarManagerStoreClass from "@/app/state/stores/CalendarManagerStore";
import * as SubscriptionMethods from '@/methods/subscriptionMethods';
import { notify } from "@/utils/snapshotUtils";
import { SnapshotConfig } from "./SnapshotConfig";
import { flatMap } from "./defaultSnapshotBuilder";
import { defaultSubscribeToSnapshot } from "./defaultSnapshotSubscribeFunctions";
import { defaultSubscribeToSnapshots } from "./defaultSubscribeToSnapshots";
import {
  addDataStatus,
  addDataSuccess,
  getAllItems,
  getAllKeys,
  getData,
  removeData,
  setData,
  updateData,
  updateDataDescription, updateDataStatus,
  updateDataTitle
} from "./methods/dataMethods";
import * as VersionMethods from "./methods/snapshotMethods";
import { TransformMethods } from "./methods/transformMethods";
import { UtilMethods } from "./methods/utilMethods";
import {
  addSnapshotSuccess,
  batchFetchSnapshots,
  batchFetchSnapshotsFailure,
  batchFetchSnapshotsSuccess,
  batchTakeSnapshot,
  batchTakeSnapshotsRequest,
  batchUpdateSnapshotsFailure,
  batchUpdateSnapshotsRequest,
  batchUpdateSnapshotsSuccess,
  createInitSnapshot,
  createSnapshotFailure, createSnapshotSuccess,
  determinePrefix,
  fetchSnapshot,
  getAllSnapshots,
  getDelegate,
  handleSnapshotSuccess,
  initSnapshot, notifySubscribers,
  onSnapshot, onSnapshots,
  updateSnapshots,
  updateSnapshotsSuccess,
  updateSnapshotSuccess
} from "./snapshotHandlers";
import { getChildIds, getParentId, getSnapshot, getSnapshotItems, getSnapshots, handleSnapshot, mapSnapshots, removeSnapshot, takeSnapshot, validateSnapshot } from "./snapshotOperations";

type Params<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = SnapshotConfigParams<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

const createSnapshots = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  id: string,
  snapshotId: string,
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  payload: CreateSnapshotStoresPayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  callback: (snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void | null,
  snapshotConfig?: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
  category?: Category,
): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | null => {
  const { data, events, dataItems, newData } = payload;

  // Example logic to create multiple snapshots
  const snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];

  const eventRecords: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> = (events && typeof events === 'object')
    ? events
    : {};

  data?.forEach((snapshotData: T, key: string) => {

    const unsubscribe = useSubscription()
    // Ensure eventRecords is of type Record<string, CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> or null
    const newSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
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
