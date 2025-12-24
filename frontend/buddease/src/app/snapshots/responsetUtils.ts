// responsetUtils.ts
import fetchSnapshotById from '@/app/api/SnapshotApi';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { UnifiedMetadata } from "@/app/config/MetaDataOptions";
import { Attachment } from '@/app/documents/attachment/Attachment';
import { Category } from '@/app/libraries/categories/generateCategoryProperties';
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { Snapshot, SnapshotData } from '@/app/snapshots/Snapshot';
import { SnapshotConfig } from '@/app/snapshots/SnapshotConfig';
import { SnapshotContainer } from '@/app/snapshots/SnapshotContainer';
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';
import { SnapshotStoreDataResponse } from '@/app/snapshots/SnapshotStoreDataResponse';
import { SnapshotStoreProps } from '@/app/snapshots/useSnapshotStore';
import { DataStore, InitializedState } from '@/app/state/stores/DataStore';

function handleSnapshot<  
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(snapshot: Snapshot<any, any>) {
    if ('snapshotMethods' in snapshot.data) {
      // Safely access SnapshotStore specific methods
      const methods = (snapshot.data as SnapshotStoreDataResponse<T,K>).snapshotMethods;
     
      if(methods) {
      methods.initialize();
      }
      
    }
  }


function mapResponseToSnapshot<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  response: any
): Snapshot<SnapshotStoreDataResponse<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
    return {
      id: response.id,
      timestamp: new Date(response.timestamp),
      category: response.category,
      topic: response.topic,
      date: response.date,
      config: response.config,
      title: response.title,
      message: response.message,
      createdBy: response.createdBy,
      eventRecords: response.eventRecords,
      type: response.type,
      store: response.store,
      stores: response.stores,
      snapshots: response.snapshots,
      snapshotConfig: response.snapshotConfig,
      meta: response.meta,
      getSnapshotsBySubscriber: response.getSnapshotsBySubscriber,
      snapshotMethods: {
        initialize: response.snapshotMethods?.initialize ?? (() => {}),
        onError: response.snapshotMethods?.onError ?? ((error: Error) => {}),
        // Define other methods as needed
      },
      getSnapshotsBySubscriberSuccess: response.getSnapshotsBySubscriberSuccess,
      getSnapshotsByTopic: response.getSnapshotsByTopic,
      getSnapshotsByTopicSuccess: response.getSnapshotsByTopicSuccess,
      getSnapshotsByCategory: response.getSnapshotsByCategory,
      getSnapshotsByCategorySuccess: response.getSnapshotsByCategorySuccess,
      getSnapshotsByKey: response.getSnapshotsByKey,
      getSnapshotsByKeySuccess: response.getSnapshotsByKeySuccess,
      getSnapshotsByPriority: response.getSnapshotsByPriority,
      getSnapshotsByPrioritySuccess: response.getSnapshotsByPrioritySuccess,
      getStoreData: response.getStoreData,
      updateStoreData: response.updateStoreData,
      updateDelegate: response.updateDelegate,
      getSnapshotContainer: response.getSnapshotContainer,
      getSnapshotVersions: response.getSnapshotVersions,
      createSnapshot: response.createSnapshot,
      updateSnapshot: response.updateSnapshot,
      deleteSnapshot: response.deleteSnapshot,
      findSnapshot: response.findSnapshot,
      getSnapshotItems: response.getSnapshotItems,
      dataStore: response.dataStore,
      initialState: response.initialState,
      snapshotItems: response.snapshotItems,
      nestedStores: response.nestedStores,
      snapshotIds: response.snapshotIds,
      dataStoreMethods: response.dataStoreMethods,
      delegate: response.delegate,
      events: response.events,
      subscriberId: response.subscriberId,
      length: response.length,
      content: response.content,
      value: response.value,
      todoSnapshotId: response.todoSnapshotId,
      snapshotStore: response.snapshotStore,
      dataItems: response.dataItems,
      newData: response.newData,
      handleSnapshotOperation: response.handleSnapshotOperation,
      getCustomStore: response.getCustomStore,
      addCustomStore: response.addCustomStore,
      removeStore: response.removeStore,
      onSnapshot: response.onSnapshot,
      getData: response.getData,
      getDataStore: response.getDataStore,
      addSnapshotItem: response.addSnapshotItem,
      addNestedStore: response.addNestedStore,
      defaultSubscribeToSnapshots: response.defaultSubscribeToSnapshots,
      defaultCreateSnapshotStores: response.defaultCreateSnapshotStores,
      createSnapshotStores: response.createSnapshotStores,
      subscribeToSnapshots: response.subscribeToSnapshots,
      subscribeToSnapshot: response.subscribeToSnapshot,
      defaultOnSnapshots: response.defaultOnSnapshots,
      onSnapshots: response.onSnapshots,
      transformSubscriber: response.transformSubscriber,
      isSnapshotStoreConfig: response.isSnapshotStoreConfig,
      transformDelegate: response.transformDelegate,
      initializedState: response.initializedState,
      transformedDelegate: response.transformedDelegate,
      getSnapshotIds: response.getSnapshotIds,
      getAllKeys: response.getAllKeys,
      mapSnapshot: response.mapSnapshot,
      getAllItems: response.getAllItems,
      addData: response.addData,
      addDataStatus: response.addDataStatus,
      removeData: response.removeData,
      updateData: response.updateData,
      updateDataTitle: response.updateDataTitle,
      updateDataDescription: response.updateDataDescription,
      updateDataStatus: response.updateDataStatus,
      addDataSuccess: response.addDataSuccess,
      getDataVersions: response.getDataVersions,
      updateDataVersions: response.updateDataVersions,
      getBackendVersion: response.getBackendVersion,
      getFrontendVersion: response.getFrontendVersion,
      fetchData: response.fetchData,
      defaultSubscribeToSnapshot: response.defaultSubscribeToSnapshot,
      handleSubscribeToSnapshot: response.handleSubscribeToSnapshot,
      snapshot: response.snapshot,
      removeItem: response.removeItem,
      getSnapshot: response.getSnapshot,
      getSnapshotSuccess: response.getSnapshotSuccess,
      getSnapshotId: response.getSnapshotId,
      getItem: response.getItem,
      setItem: response.setItem,
      addSnapshotFailure: response.addSnapshotFailure,
      addSnapshotSuccess: response.addSnapshotSuccess,
      getParentId: response.getParentId,
      getChildIds: response.getChildIds,
      compareSnapshotState: response.compareSnapshotState,
      deepCompare: response.deepCompare,
      shallowCompare: response.shallowCompare,
      getDataStoreMethods: response.getDataStoreMethods,
      getDelegate: response.getDelegate,
      determineCategory: response.determineCategory,
      determinePrefix: response.determinePrefix,
      updateSnapshotSuccess: response.updateSnapshotSuccess,
      updateSnapshotFailure: response.updateSnapshotFailure,
      removeSnapshot: response.removeSnapshot,
      clearSnapshots: response.clearSnapshots,
      addSnapshot: response.addSnapshot,
      createInitSnapshot: response.createInitSnapshot,
      createSnapshotSuccess: response.createSnapshotSuccess,
      clearSnapshotSuccess: response.clearSnapshotSuccess,
      clearSnapshotFailure: response.clearSnapshotFailure,
      createSnapshotFailure: response.createSnapshotFailure,
      setSnapshotSuccess: response.setSnapshotSuccess,
      setSnapshotFailure: response.setSnapshotFailure,
      updateSnapshots: response.updateSnapshots,
      updateSnapshotsSuccess: response.updateSnapshotsSuccess,
      updateSnapshotsFailure: response.updateSnapshotsFailure,
      initSnapshot: response.initSnapshot,
      takeSnapshot: response.takeSnapshot,
      takeSnapshotSuccess: response.takeSnapshotSuccess,
      takeSnapshotsSuccess: response.takeSnapshotsSuccess,
      configureSnapshotStore: response.configureSnapshotStore,
      flatMap: response.flatMap,
      setData: response.setData,
      getState: response.getState,
      setState: response.setState,
      validateSnapshot: response.validateSnapshot,
      handleSnapshot: response.handleSnapshot,
      handleActions: response.handleActions,
      setSnapshot: response.setSnapshot,
      transformSnapshotConfig: response.transformSnapshotConfig,
      getSnapshotCategory: response.getSnapshotCategory,
      getSnapshotCategorySuccess: response.getSnapshotCategorySuccess,
      getSnapshotCategoryFailure: response.getSnapshotCategoryFailure,
      transformSnapshotStore: response.transformSnapshotStore,
      processSnapshotStore: response.processSnapshotStore,
      updateSnapshotStore: response.updateSnapshotStore,
      getSnapshotItemsSuccess: response.getSnapshotItemsSuccess,
      clearSnapshotItems: response.clearSnapshotItems,
      processSnapshotItems: response.processSnapshotItems,
      handleSnapshotItems: response.handleSnapshotItems,
      processStore: response.processStore,
      handleStore: response.handleStore,
      createStore: response.createStore,
      initializeStore: response.initializeStore,
      createSnapshotStoreSuccess: response.createSnapshotStoreSuccess,
      clearStore: response.clearStore,
      fetchSnapshotStoreData: response.fetchSnapshotStoreData,
      storeId: response.storeId,
      snapshotStoreId: response.snapshotStoreId,
      storeType: response.storeType,
      snapshotStoreConfig: response.snapshotStoreConfig,
      handleSnapshotStoreConfig: response.handleSnapshotStoreConfig,
      fetchSnapshotStoreConfig: response.fetchSnapshotStoreConfig,
      getSnapshotStoreConfigSuccess: response.getSnapshotStoreConfigSuccess,
      getSnapshotStoreConfigFailure: response.getSnapshotStoreConfigFailure,
    };
  }  



const returnsSnapshotStore = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  id: string,
  snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  category?: Category,
  categoryProperties: CategoryProperties | undefined,
  dataStoreMethods: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> => {
  try { 
    // Fetch snapshot data from the API or use the provided snapshotData
    const fetchedData = await Promise.resolve(fetchSnapshotById(id)) || snapshotData;

    // Initialize required properties
    const stateArray = snapshotData.state || [];
    const initialState: InitializedState<any, any> = new Map(
      stateArray
        .filter(snapshot => snapshot.id !== undefined) // Filter out undefined IDs
        .map(snapshot => [String(snapshot.id), snapshot]) // Convert IDs to string
    
    );
    const initialConfig = snapshotData.configOption || null;
    const data = snapshotData.data;
    const subscribers = snapshotData.subscribers || [];
    
    // Create a snapshot configuration object
    const snapshotStoreConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
      id,
      category: category || "defaultCategory",
      initialState,
      initialConfig,
      data,
      subscribers,
      timestamp: new Date(),
      snapshotData,
      categoryProperties,
      storeConfig: dataStoreMethods.config,
      removeSubscriber: (subscriberId: string) => {
        const index = subscribers.findIndex(sub => sub.id === subscriberId);
        if (index !== -1) {
          subscribers.splice(index, 1);
        }
      },
      onInitialize: () => {
        console.log('Snapshot initialized');
      },
      onError: (error: any) => {
        console.error('Snapshot error:', error);
      },
      taskIdToAssign: '',
      snapshot: async (
        id: string | number | undefined,
        snapshotId: string | null,
        snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
        category: Category,
        categoryProperties: CategoryProperties | undefined,
        callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
        dataStore: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        dataStoreMethods: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
        metadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        subscriberId: string,
        endpointCategory: string | number,
        storeProps: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        snapshotConfigData?: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        snapshotStoreConfigData?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        snapshotContainer?: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined
      ) => {
        // Implement the snapshot function here
        const result = await Promise.resolve({} as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>);
        callback(result);
        return result;
      },
      setCategory: () => {},
      applyStoreConfig: () => {},
      generateId: () => 'generatedId',
      additionalData: {},
    };
    
    return snapshotStoreConfig as unknown as SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  } catch (error) {
    console.error('Error in returnsSnapshotStore:', error);
    throw new Error('Failed to configure snapshot store');
  }
};
export {
  handleSnapshot, mapResponseToSnapshot, returnsSnapshotStore
};




















