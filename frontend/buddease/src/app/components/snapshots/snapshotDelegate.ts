import { ExcludedFields } from '@/app/components/routing/Fields';
import { BaseDataEntity } from '@/app/configs/BaseConfig';
// snapshotDelegate.ts
import { endpoints } from "@/app/api/endpointConfigurations";
import { getSnapshotId } from "@/app/api/SnapshotApi";
import { SnapshotManager } from "@/app/components/hooks/useSnapshotManager";
import { Category } from '@/app/components/libraries/categories/generateCategoryProperties';
import { BaseData } from '@/app/components/models/data/Data';
import { DataStore } from '@/app/components/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { SnapshotData } from '@/app/components/snapshots';
import { FetchSnapshotPayload } from '@/app/components/snapshots/FetchSnapshotPayload';
import { InitializedData } from '@/app/components/snapshots/SnapshotStoreOptions';
import { SnapshotWithCriteria } from '@/app/components/snapshots/SnapshotWithCriteria';
import { SubscriberCollection } from '@/app/components/users/SubscriberCollection';
import { Version } from '@/app/components/versions/Version';
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { CriteriaType } from "@/app/pages/searchs/CriteriaType";
import { isRealtimeDataItemArray } from '@/app/utils/dataTypeGuards';
import { CreateSnapshotsPayload } from "../../../server/database/Payload";
import { SnapshotDataType } from "../components/snapshots";
import { Data } from "../models/data/Data";
import { Subscriber } from "../users/Subscriber";
import { VersionData, VersionHistory } from "../versions/VersionData";
import { CoreSnapshot } from "./CoreSnapshot";
import { Snapshots, SnapshotsObject, SnapshotUnion } from "./LocalStorageSnapshotStore";
import { Snapshot } from './Snapshot';
import { SnapshotConfig } from "./SnapshotConfig";
import { SnapshotContainer } from "./SnapshotContainer";
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { SnapshotDataParams } from './SnapshotDataParams';
import { SnapshotEvent } from '@/app/typings/eventTypes';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from './BaseConfig';


const snapshotDelegate = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(
  snapshotStoreConfig: SnapshotStoreConfig<T> | undefined
): SnapshotStoreConfig<T, K, Meta, ExcludedFields>[] => {
  
  return [
    {
      getSnapshot: (
        snapshotFetcher: (id: string) => Promise<{
        category: any;
        timestamp: any; id: any; 
        snapshot: Snapshot<T, K, Meta, ExcludedFields>;
        data: T;
      }> | undefined
      ): Promise<Snapshot<T, K, Meta, ExcludedFields>> => {
        return new Promise(async (resolve, reject) => {
          const snapshotId = "some-id"; // Replace with actual logic to determine the snapshot ID
          const snapshotData = await snapshotFetcher(snapshotId);
          if (snapshotData) {
            resolve(snapshotData.snapshot);
          } else {
            reject(new Error("Snapshot not found"));
          }
        });
      },

      getSnapshotContainer: (
        snapshotFetcher: (
          id: string | number
        ) => Promise<{
          id: string;
          category: string;
          timestamp: string;
          snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>;
          snapshot: Snapshot<T, K, Meta, ExcludedFields>;
          snapshots: Snapshots<T, K, Meta, ExcludedFields>;
          subscribers: Subscriber<T, K, Meta, ExcludedFields>[];
          data: InitializedData | null | undefined;
          newData: InitializedData | null | undefined;
          unsubscribe: () => void; // Example of unsubscribing function
          addSnapshotFailure: (
            date: Date,
            snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>,
            snapshot: Snapshot<T, K, Meta, ExcludedFields>,
            payload: { error: Error; }
          ) => void;
          // Include all other properties here:
          createSnapshotSuccess: (
            snapshotId: string | number | null,
            snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>, 
            snapshot: Snapshot<T, K, Meta, ExcludedFields>, payload?: { data?: any; } | undefined
          ) => void;

          createSnapshotFailure: (
            date: Date,
            snapshotId: string, 
            snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>,
            snapshot: Snapshot<T, K, Meta, ExcludedFields>,
            payload: { error: Error; }

          ) => void;
          updateSnapshotSuccess: (
            snapshotId: string | number | null,
            snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>, 
            snapshot: Snapshot<T, K, Meta, ExcludedFields>,
            payload?: { data?: any; } | undefined
            ) => void;
          batchUpdateSnapshotsSuccess: (subscribers: Subscriber<T, K, Meta, ExcludedFields>[], snapshots: Snapshots<T, K, Meta, ExcludedFields>) => void;
          batchUpdateSnapshotsFailure: (
            date: Date,
            snapshotId: string | number | null,
            snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>,
            snapshot: Snapshot<T, K, Meta, ExcludedFields>,
            payload: { error: Error; }
          ) => void;

          batchUpdateSnapshotsRequest: (
            snapshotData: (subscribers: SubscriberCollection<T, K, Meta, ExcludedFields>) => Promise<{
              subscribers: SubscriberCollection<T, K, Meta, ExcludedFields>;
              snapshots: Snapshots<T, K, Meta, ExcludedFields>
            }>,
            snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>
          ) => Promise<void>;

          createSnapshots: (
            id: string,
            snapshotId: string | number | null,
            snapshots: Snapshot<T, K, Meta, ExcludedFields>[],
            snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>,
            payload: CreateSnapshotsPayload<T, K, Meta, ExcludedFields>,
            callback: (snapshots: Snapshot<T, K, Meta, ExcludedFields>[]) => void | null,
            snapshotDataConfig?: SnapshotConfig<T, K, Meta, ExcludedFields>[] | undefined,
            category?:  Category,
            categoryProperties?: string | CategoryProperties
          ) => Snapshot<T, K, Meta, ExcludedFields>[] | null;
          batchTakeSnapshot: (
            id: number,
            snapshotId: string,
            snapshot: Snapshot<T, K, Meta, ExcludedFields>,
            snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>,
            snapshots: Snapshots<T, K, Meta, ExcludedFields>,
          ) =>  Promise<{ snapshots: Snapshots<T, K, Meta, ExcludedFields>; }>;
          batchTakeSnapshotsRequest: (    criteria: CriteriaType,
            snapshotData: (
              snapshotIds: string[],
              snapshots: Snapshots<T, K, Meta, ExcludedFields>,
              subscribers: Subscriber<T, K, Meta, ExcludedFields>[]
            ) => Promise<{
              subscribers: Subscriber<T, K, Meta, ExcludedFields>[]
            }>) => Promise<void>;
          deleteSnapshot: (id: string) => void;
          batchFetchSnapshots: (
            criteria: CriteriaType,
            snapshotData: (
              snapshotIds: string[],
              subscribers: SubscriberCollection<T, K, Meta, ExcludedFields>,
              snapshots: Snapshots<T, K, Meta, ExcludedFields>
            ) => Promise<{
              subscribers: SubscriberCollection<T, K, Meta, ExcludedFields>;
              snapshots: Snapshots<T, K, Meta, ExcludedFields>; // Include snapshots here for consistency
            }>
          ) => Promise<Snapshots<T, K, Meta, ExcludedFields>>;
          batchFetchSnapshotsSuccess: (snapshots: Snapshots<T, K, Meta, ExcludedFields>) => void;
          batchFetchSnapshotsFailure: (
            date: Date,
            snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>,
            snapshot: Snapshot<T, K, Meta, ExcludedFields>,
            payload: { error: Error; }
          ) => void;
          filterSnapshotsByStatus: (status: string) => Snapshots<T, K, Meta, ExcludedFields>;
          filterSnapshotsByCategory: (category: string) => Snapshots<T, K, Meta, ExcludedFields>;
          filterSnapshotsByTag: (tag: string) => Snapshots<T, K, Meta, ExcludedFields>;
          fetchSnapshot: (
            callback: (
              snapshotId: string,
              payload: FetchSnapshotPayload<T> | undefined,
              snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>,
              payloadData: T | Data<T>,
              category: Category | undefined,
              categoryProperties: CategoryProperties | undefined,
              timestamp: Date,
              data: T,
              delegate: SnapshotWithCriteria<T, K, Meta, ExcludedFields>[]
            ) => Promise<{ snapshot: Snapshot<T, K, Meta, ExcludedFields>; }>
          ) => Promise<Snapshot<T, K, Meta, ExcludedFields> | {
              id: string;
              category: Category | string | symbol | undefined;
              categoryProperties: CategoryProperties | undefined;
              timestamp: Date;
              snapshot: Snapshot<T, K, Meta, ExcludedFields>;
              data: T;
              delegate: SnapshotStoreConfig<T, K, Meta, ExcludedFields>[];
          }>;

          getSnapshotData(params: SnapshotDataParams<T, K, Meta, ExcludedFields>): SnapshotData<T, K, Meta, ExcludedFields> | undefined
          
          setSnapshotCategory: (id: string, category: Category) => void;
          getSnapshotCategory: (id: string) => string;
          getSnapshots: (criteria: any) => Snapshots<T, K, Meta, ExcludedFields>;
          getAllSnapshots: (
            storeId: number,
            snapshotId: string,
            snapshotData: T,
            timestamp: string,
            type: string,
            event: SnapshotEvent<T, K, Meta, ExcludedFields>,
            id: number,
            snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>,
            category: Category | undefined,            categoryProperties: CategoryProperties | undefined,
            dataStoreMethods: DataStore<T, K, Meta, ExcludedFields>,
            data: T,
          filter?: (snapshot: Snapshot<T, K, Meta, ExcludedFields>) => boolean,
          dataCallback?: (
            subscribers: Subscriber<T, K, Meta, ExcludedFields>[],
            snapshots: Snapshots<T, K, Meta, ExcludedFields>
          ) => Promise<SnapshotUnion<T, K, Meta>[]>
        ) => Promise<Snapshot<T, K, Meta, ExcludedFields>[]>
        setData: (id: string, data: Map<string, Snapshot<T, K, Meta, ExcludedFields>>) => void;
        addData: (id: string, data: Partial<Snapshot<T, K, Meta, ExcludedFields>>) => void;
        getData: (id: number | string, snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>
        ) =>  BaseData<any> | Map<string, Snapshot<T, K, Meta, ExcludedFields>> | null | undefined

          dataItems: () => T[];
          getStore: (
            storeId: number,
            snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>,
            snapshotId: string | null,
            snapshot: Snapshot<T, K, Meta, ExcludedFields>,
            snapshotStoreConfig: SnapshotStoreConfig<T, K, Meta, ExcludedFields>,
            type: string,
            event: Event
          ) => SnapshotStore<T, K, Meta, ExcludedFields> | null;
          addStore: (storeId: number,
            snapshotId: string,
            snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>,
            snapshot: Snapshot<T, K, Meta, ExcludedFields>,
            type: string,
            event: Event
          ) => SnapshotStore<T, K, Meta, ExcludedFields> | null;
          removeStore: (
            storeId: number,
            store: SnapshotStore<T, K, Meta, ExcludedFields>,
            snapshotId: string,
            snapshot: Snapshot<T, K, Meta, ExcludedFields>,
            type: string,
            event: Event
          ) => void;
          stores: () => SnapshotStore<T, K, Meta, ExcludedFields>[];
          configureSnapshotStore: (config: any) => void;

          onSnapshot: (
            snapshotId: string,
            snapshot: Snapshot<T, K, Meta, ExcludedFields>,
            type: string, 
            event: SnapshotEvent<T, K, Meta, ExcludedFields>,
            callback: (snapshot: Snapshot<T, K, Meta, ExcludedFields>) => void
          ) => void;

          onSnapshots: (
            snapshotId: string,
            snapshots: Snapshots<T, K, Meta, ExcludedFields>, 
            type: string,
            event: SnapshotEvent<T, K, Meta, ExcludedFields>,
            callback: (snapshots: Snapshots<T, K, Meta, ExcludedFields>) => void) => void;
          events: any; // Adjust type as needed
          notify: (message: string) => void;
          notifySubscribers: (
            message: string, subscribers: Subscriber<T, K, Meta, ExcludedFields>[], data: Partial<SnapshotStoreConfig<T, K, Meta, ExcludedFields>>
          ) => Subscriber<T, K, Meta, ExcludedFields>[];
          parentId: string;
          childIds?: K[];
          getParentId: (id: string) => string;
          getChildIds: (id: string) => string[];
          addChild: (parentId: string, childId: string) => void;
          removeChild: (parentId: string, childId: string) => void;
          getChildren(id: string, childSnapshot: Snapshot<T, K, Meta, ExcludedFields>): CoreSnapshot<T, K, Meta, ExcludedFields>[];
          hasChildren: (id: string) => boolean;
          isDescendantOf: (childId: string, parentId: string) => boolean;

          generateId: () => string;
          compareSnapshots: (snap1: Snapshot<T, K, Meta, ExcludedFields>, snap2: Snapshot<T, K, Meta, ExcludedFields>) => {
            snapshot1: Snapshot<T, K, Meta, ExcludedFields>;
            snapshot2: Snapshot<T, K, Meta, ExcludedFields>;
            differences: Record<string, { snapshot1: any; snapshot2: any }>;
            versionHistory: {
              snapshot1Version?: string | number | Version | null ;
              snapshot2Version?: string | number | Version;
            };
          };
          compareSnapshotItems: (snap1: Snapshot<T, K, Meta, ExcludedFields>, snap2: Snapshot<T, K, Meta, ExcludedFields>, keys: (keyof Snapshot<T, K, Meta, ExcludedFields>)) => number;
          mapSnapshot: (
            id: number,
            storeId: number,
            snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>,
            snapshotContainer: SnapshotContainer<T, K, Meta, ExcludedFields>,
            snapshotId: string,
            criteria: CriteriaType,
            snapshot: Snapshot<T, K, Meta, ExcludedFields>,
            type: string,
            event: SnapshotEvent<T, K, Meta, ExcludedFields>,
            callback: (snapshot: Snapshot<T, K, Meta, ExcludedFields>) => void,
            mapFn: (item: T) => T
          ) => Snapshot<T, K, Meta, ExcludedFields>;
          compareSnapshotState: (snapshot1: Snapshot<T, K, Meta, ExcludedFields> | null, snapshot2: Snapshot<T, K, Meta, ExcludedFields>) => boolean;

          getConfigOption: (key: string) => any;
          getTimestamp: () => Date;
          getInitialState: () => any;
          getStores: () => SnapshotStore<T, K, Meta, ExcludedFields>[];
          getSnapshotId: (key: string | T, snapshot: Snapshot<T, K, Meta, ExcludedFields>) => string;
          handleSnapshotSuccess: (message: string) => void;
        }> | undefined
      ): Promise<SnapshotContainer<T, K, Meta, ExcludedFields>> => {
        return new Promise(async (resolve, reject) => {
          const snapshotId = getSnapshotId(snapshotFetcher).toString();
          const snapshotData = await snapshotFetcher(snapshotId);
        
          if (snapshotData) {
            const dataItems = isRealtimeDataItemArray(snapshotData.dataItems) 
            ? snapshotData.dataItems 
            : null;

            const snapshotContainer: SnapshotContainer<T, K, Meta, ExcludedFields> = {
               // Basic Snapshot Info
              id: snapshotData.id,
              category: snapshotData.category,
              timestamp: snapshotData.timestamp,
              
              // Snapshot Management
              snapshotStore: snapshotData.snapshotStore,
              data: snapshotData.data,
              snapshotsArray: Array.isArray(snapshotData.snapshots) ? snapshotData.snapshots : [],
              snapshotsObject: Array.isArray(snapshotData.snapshots)
              ? snapshotData.snapshots.reduce((acc, snap) => {
                    if (snap.id) {
                      acc[snap.id] = snap;
                    }
                    return acc;
                  }, {} as SnapshotsObject<T, K, Meta, ExcludedFields>)
                  : {},
                  
              newData: snapshotData.newData, 
              unsubscribe: snapshotData.unsubscribe, 
              addSnapshotFailure: snapshotData.addSnapshotFailure,
              // Snapshot Operations
              createSnapshotSuccess: snapshotData.createSnapshotSuccess,
              createSnapshotFailure: snapshotData.createSnapshotFailure,
              updateSnapshotSuccess: snapshotData.updateSnapshotSuccess,
              batchUpdateSnapshotsSuccess: snapshotData.batchUpdateSnapshotsSuccess,
              batchUpdateSnapshotsFailure: snapshotData.batchUpdateSnapshotsFailure,
              batchUpdateSnapshotsRequest: snapshotData.batchUpdateSnapshotsRequest,
              createSnapshots: snapshotData.createSnapshots,
              batchTakeSnapshot: snapshotData.batchTakeSnapshot,
              batchTakeSnapshotsRequest: snapshotData.batchTakeSnapshotsRequest,
              deleteSnapshot: snapshotData.deleteSnapshot,
              batchFetchSnapshots: snapshotData.batchFetchSnapshots,
              batchFetchSnapshotsSuccess: snapshotData.batchFetchSnapshotsSuccess,
              batchFetchSnapshotsFailure: snapshotData.batchFetchSnapshotsFailure,

              // Filtering and Fetching
              filterSnapshotsByStatus: snapshotData.filterSnapshotsByStatus,
              filterSnapshotsByCategory: snapshotData.filterSnapshotsByCategory,
              filterSnapshotsByTag: snapshotData.filterSnapshotsByTag,
              fetchSnapshot: snapshotData.fetchSnapshot,

              // Data Handling
              getSnapshotData: snapshotData.getSnapshotData,
              setSnapshotCategory: snapshotData.setSnapshotCategory,
              getSnapshotCategory: snapshotData.getSnapshotCategory,
              getSnapshots: snapshotData.getSnapshots,
              getAllSnapshots: snapshotData.getAllSnapshots,
              addData: snapshotData.addData,
              setData: snapshotData.setData,
              getData: snapshotData.getData,

              // Data Store Methods
              dataItems: () => dataItems,
              getStore: snapshotData.getStore,
              addStore: snapshotData.addStore,
              removeStore: snapshotData.removeStore,
              stores: snapshotData.stores,
              configureSnapshotStore: snapshotData.configureSnapshotStore,

              // Event Handling
              onSnapshot: snapshotData.onSnapshot,
              onSnapshots: snapshotData.onSnapshots,
              events: snapshotData.events,
              notify: snapshotData.notify,
              notifySubscribers: snapshotData.notifySubscribers,
              subscribers: snapshotData.subscribers,

              // Parent-Child Relationship Handling
              parentId: snapshotData.parentId,
              childIds: snapshotData.childIds,
              getParentId: snapshotData.getParentId,
              getChildIds: snapshotData.getChildIds,
              addChild: snapshotData.addChild,
              removeChild: snapshotData.removeChild,
              getChildren: snapshotData.getChildren,
              hasChildren: snapshotData.hasChildren,
              isDescendantOf: snapshotData.isDescendantOf,

              // Utility Functions
              generateId: snapshotData.generateId,
              compareSnapshots: snapshotData.compareSnapshots,
              compareSnapshotItems: snapshotData.compareSnapshotItems,
              mapSnapshot: snapshotData.mapSnapshot,
              compareSnapshotState: snapshotData.compareSnapshotState,

              // Configuration and State Management
              getConfigOption: snapshotData.getConfigOption,
              getTimestamp: snapshotData.getTimestamp,
              getInitialState: snapshotData.getInitialState,
              getStores: snapshotData.getStores,
              getSnapshotId: snapshotData.getSnapshotId,
              handleSnapshotSuccess: snapshotData.handleSnapshotSuccess,

              // Snapshot Functions
               snapshot: (id: string | number, snapshotData: SnapshotDataType<T, K, Meta, ExcludedFields>, category, categoryProperties, dataStoreMethods) => {
                return snapshotData.snapshot; // Assuming snapshotData has a property 'snapshot'
              },
              snapshotData: (id: string | number, snapshotData: SnapshotDataType<T, K, Meta, ExcludedFields>, category, categoryProperties, dataStoreMethods) => {
                return Promise.resolve(snapshotData.snapshot); // Return the snapshot property directly
              },
            };

        
            resolve(snapshotContainer);
          } else {
            reject(new Error("Snapshot container not found"));
          }
        });
      },
      

      getSnapshotVersions: (
        snapshot: Snapshot<T, K, Meta, ExcludedFields>,
        snapshotId: string,
        snapshotData: SnapshotData<T, K, Meta, ExcludedFields>,
        versionHistory: VersionHistory,
      ): Promise<Snapshot<T, K, Meta, ExcludedFields>> => {
        return new Promise(async (resolve, reject) => {
          const fetchSnapshotData = async (id: string): Promise<VersionData>=> {
            try {
              const self = this as { delegate?: { getSnapshot: (snapshot: Snapshot<T, K, Meta, ExcludedFields>) => Promise<Snapshot<T, K, Meta, ExcludedFields>> }[] }; // Define `self` with an appropriate type

              if (self === undefined) {
                throw new Error("Snapshot container not found");
              }
              if (self.delegate && self.delegate.length > 0) {
                const firstDelegate = self.delegate.find(
                  (del): del is { getSnapshot: (snapshot: Snapshot<T, K, Meta, ExcludedFields>) => Promise<Snapshot<T, K, Meta, ExcludedFields>> } => typeof del.getSnapshot === "function" // Type guard for `del`
                );
                    if (firstDelegate) {
                        const snapshotResult = await firstDelegate.getSnapshot(snapshot);

                        if (!snapshotResult) {
                          throw new Error("Snapshot result not found"); // Change here: Throws error instead of returning undefined
                        }
                
      
                    // Map snapshotResult to VersionData
                    const versionData: VersionData = {
                      // Assuming you need to extract and assign the relevant fields
                      id: snapshotResult.data.id,
                      isActive: snapshotResult.data.isActive,
                      releaseDate: snapshotResult.data.releaseDate,
                      
                      major: snapshotResult.data.major,
                      minor: snapshotResult.data.minor,
                      patch: snapshotResult.data.patch,
                      history: snapshotResult.data.history,
                      versionNumber: snapshotResult.snapshot.versionNumber,
                      metadata: {
                        author: snapshotResult.data.userId, // Example mapping
                        timestamp: snapshotResult.data.timestamp,
                        // Add other mappings if necessary
                      },
                
                      parentId: snapshotResult.data.parentId,
                      parentType: snapshotResult.data.parentType,
                      parentVersion: snapshotResult.data.parentVersion,
                      parentTitle: snapshotResult.data.parentTitle,
                      parentContent: snapshotResult.data.parentContent,
                      parentName: snapshotResult.data.parentName,
                      parentUrl: snapshotResult.data.parentUrl,
                      parentChecksum: snapshotResult.data.parentChecksum,
                      parentAppVersion: snapshotResult.data.parentAppVersion,
                      parentVersionNumber: snapshotResult.data.parentVersionNumber,
                      isLatest: snapshotResult.data.isLatest,
                      isPublished: snapshotResult.data.isPublished,
                      publishedAt: snapshotResult.data.publishedAt ?? null,
                      source: snapshotResult.data.source,
                      status: snapshotResult.data.status,
                      version: snapshotResult.data.version,
                      timestamp: snapshotResult.data.timestamp,
                      user: snapshotResult.data.user,
                      comments: snapshotResult.data.comments ?? [],
                      workspaceId: snapshotResult.data.workspaceId,
                      workspaceName: snapshotResult.data.workspaceName,
                      workspaceType: snapshotResult.data.workspaceType,
                      workspaceUrl: snapshotResult.data.workspaceUrl,
                      workspaceViewers: snapshotResult.data.workspaceViewers ?? [],
                      workspaceAdmins: snapshotResult.data.workspaceAdmins ?? [],
                      workspaceMembers: snapshotResult.data.workspaceMembers ?? [],
                      data: snapshotResult.data.data,
                      backend: snapshotResult.data.backend,
                      frontend: snapshotResult.data.frontend,
                      name: snapshotResult.data.name,
                      url: snapshotResult.data.url,
                      documentId: snapshotResult.data.documentId,
                      draft: snapshotResult.data.draft,
                      userId: snapshotResult.data.userId,
                      content: snapshotResult.data.content,
                      versionData: snapshotResult.data.versionData ?? [],
                      checksum: snapshotResult.data.checksum,
                      changes: snapshotResult.changes
                    };
                    return versionData;
                  }
                }
              } catch (error) {
                console.error("Error fetching snapshot data:", error);
                return undefined;
              }
            }; 
          
          
          try {
            const versions = await fetchSnapshotData(snapshotId);
        
            if (!versions) {
              throw new Error("Version data not found");
            }
         // Call fetchSnapshotData with the required id if needed
         const result = await fetchSnapshotData(snapshotId);
        
            const {
              name,
              url,
              versionNumber,
              documentId,
              draft,
              userId,
              content,
              metadata,
              versionData,
              published,
              checksum,
              releaseDate, 
              major, 
              minor, 
              patch
            } = versions;
        
            snapshot.versionInfo = {
              name,
              url,
              versionNumber,
              documentId,
              draft,
              userId,
              content,
              metadata,
              versionData,
              published,
              checksum,
              releaseDate, 
              major, 
              minor, 
              patch
            };
        
            snapshot.versionHistory = versionHistory;
        
            resolve(snapshot);
          } catch (error) {
            reject(error);
          }
         resolve(result);
        });
      },

      fetchData: async (
        snapshot: Snapshot<T, K, Meta, ExcludedFields>,
        snapshotId: string,
        snapshotData: SnapshotData<T, K, Meta, ExcludedFields>,
        snapshotConfig: SnapshotStoreConfig<T, K, Meta, ExcludedFields>,
        callback: (snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>) => Promise<Snapshot<T, K, Meta, ExcludedFields>>
      ): Promise<VersionData[]> => {
        return new Promise((resolve, reject) => {
          try {
            const API_URL = endpoints.snapshots.fetch;
            if (typeof API_URL !== "string") {
              throw new Error("Invalid API URL");
            }
            return new Promise<VersionData[]>((resolve) => {
              setTimeout(() => resolve([]), 1000);
            });
          } catch (error) {
            console.error("Error getting snapshot:", error);
            reject(error);
            throw error;
          }
        });
      },

      snapshotMethods: (
        snapshot: Snapshot<T, K, Meta, ExcludedFields>,
        snapshotId: string,
        snapshotData: SnapshotData<T, K, Meta, ExcludedFields>,
        snapshotConfig: SnapshotStoreConfig<T, K, Meta, ExcludedFields>,
        callback: (snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>) => Promise<Snapshot<T, K, Meta, ExcludedFields>>,
        versionHistory: VersionHistory
      ): Promise<Snapshot<T, K, Meta, ExcludedFields> > => {
        return new Promise((resolve, reject) => {
          try {
            const API_URL = endpoints.snapshots.fetch;
            if (typeof API_URL !== "string") {
              throw new Error("Invalid API URL");
            }
            return new Promise<Snapshot<T, K, Meta, ExcludedFields>>((resolve) => {
              setTimeout(() => resolve(snapshot), 1000);
            });
          } catch (error) {
            console.error("Error getting snapshot:", error);
            reject(error);
            throw error;
          }
        });
      },
      meta: (snapshot: Snapshot<T, K, Meta, ExcludedFields>, snapshotId: string, snapshotData: SnapshotData<T, K, Meta, ExcludedFields>, snapshotConfig: SnapshotStoreConfig<T, K, Meta, ExcludedFields>, callback: (snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>) => Promise<Snapshot<T, K, Meta, ExcludedFields>>, versionHistory: VersionHistory): Promise<Snapshot<T, K, Meta, ExcludedFields>> => {
        return new Promise((resolve, reject) => {
          try {
            const API_URL = endpoints.snapshots.fetch;
            if (typeof API_URL !== "string") {
              throw new Error("Invalid API URL");
            }
            return new Promise<Snapshot<T, K, Meta, ExcludedFields>>((resolve) => {
              setTimeout(() => resolve(snapshot), 1000);
            });
          } catch (error) {
            console.error("Error getting snapshot:", error);
            reject(error);
            throw error;
          }
        });
      },
      initialState: (
        snapshot: Snapshot<T, K, Meta, ExcludedFields>,
        snapshotId: string,
        snapshotData: SnapshotData<T, K, Meta, ExcludedFields>, 
        snapshotConfig: SnapshotStoreConfig<T, K, Meta, ExcludedFields>,
        callback: (snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>) => Promise<Snapshot<T, K, Meta, ExcludedFields>>,
        versionHistory: VersionHistory
      ): Promise<Snapshot<T, K, Meta, ExcludedFields>> => {
        return new Promise((resolve, reject) => {
          try {
            const API_URL = endpoints.snapshots.fetch;
            if (typeof API_URL !== "string") {
              throw new Error("Invalid API URL");
            }
            return new Promise<Snapshot<T, K, Meta, ExcludedFields>>((resolve) => {
              setTimeout(() => resolve(snapshot), 1000);
            });
          } catch (error) {
            console.error("Error getting snapshot:", error);
            reject(error);
            throw error;
          }
        });
      },
    }

  ];
};

export default snapshotDelegate