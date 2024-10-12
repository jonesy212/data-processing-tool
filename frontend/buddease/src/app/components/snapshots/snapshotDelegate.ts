import { endpoints } from "@/app/api/endpointConfigurations";
import { getSnapshotId } from "@/app/api/SnapshotApi";
import { VersionHistory, VersionData } from "../versions/VersionData";
import { Snapshot, Snapshots, SnapshotsObject, SnapshotUnion } from "./LocalStorageSnapshotStore";
import { SnapshotContainer } from "./SnapshotContainer";
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { Subscriber } from "../users/Subscriber";
import { Data } from "../models/data/Data";
import { SnapshotManager } from "../hooks/useSnapshotManager";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { CreateSnapshotsPayload } from "../database/Payload";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { SnapshotConfig } from "./SnapshotConfig";

// snapshotDelegate.ts
const snapshotDelegate = <T extends Data, K extends Data>(
  snapshotStoreConfig: SnapshotStoreConfig<SnapshotUnion<Data>, K> | undefined
): SnapshotStoreConfig<T, K>[] => {
  
  return [
    {
      getSnapshot: (snapshotFetcher: (id: string) => Promise<{
        category: any;
        timestamp: any; id: any; 
        snapshot: Snapshot<T, K>;
        data: T;
      }> | undefined): Promise<Snapshot<T, K>> => {
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
          category: string;
          timestamp: string;
          id: string;
          snapshotStore: SnapshotStore<T, K>;
          snapshot: Snapshot<T, K>;
          snapshots: Snapshots<T>;
          subscribers: Subscriber<T, K>[];
          data: T;
          newData: T; // Add this line and others as necessary
          unsubscribe: () => void; // Example of unsubscribing function
          addSnapshotFailure: (
            date: Date,
             snapshotManager: SnapshotManager<T, K>,
              snapshot: Snapshot<T, K>,
               payload: { error: Error; }
          ) => void;
          // Include all other properties here:
          createSnapshotSuccess: (snapshotId: number, snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload?: { data?: any; } | undefined) => void;
          createSnapshotFailure: (
            date: Date,
            snapshotId: number, 
            snapshotManager: SnapshotManager<T, K>,
            snapshot: Snapshot<T, K>,
            payload: { error: Error; }

          ) => void;
          updateSnapshotSuccess: (
            snapshotId: number,
             snapshotManager: SnapshotManager<T, K>, 
             snapshot: Snapshot<T, K>,
              payload?: { data?: any; } | undefined
            ) => void;
          batchUpdateSnapshotsSuccess: (subscribers: Subscriber<T, K>[], snapshots: Snapshots<T>) => void;
          batchUpdateSnapshotsFailure: (
            date: Date,
            snapshotId: number, 
            snapshotManager: SnapshotManager<T, K>,
            snapshot: Snapshot<T, K>,
            payload: { error: Error; }
          ) => void;
          batchUpdateSnapshotsRequest: (snapshots: Snapshot<T, K>[]) => void;
          createSnapshots: (
            id: string,
            snapshotId: number,
            snapshot: Snapshot<T, K>,
            snapshotManager: SnapshotManager<T, K>,
            payload: CreateSnapshotsPayload<T, K>,
            callback: (snapshots: Snapshot<T, K>[]) => void | null,
            snapshotDataConfig?: SnapshotConfig<T, K>[] | undefined,
            category?: Category,
            categoryProperties?: string | CategoryProperties
          ) => void;
          batchTakeSnapshot: (snapshot: Snapshot<T, K>) => void;
          batchTakeSnapshotsRequest: (snapshots: Snapshots<T>) => void;
          deleteSnapshot: (id: string) => void;
          batchFetchSnapshots: (criteria: any) => Promise<Snapshots<T>>;
          batchFetchSnapshotsSuccess: (snapshots: Snapshots<T>) => void;
          batchFetchSnapshotsFailure: (error: Error) => void;
          filterSnapshotsByStatus: (status: string) => Snapshots<T>;
          filterSnapshotsByCategory: (category: string) => Snapshots<T>;
          filterSnapshotsByTag: (tag: string) => Snapshots<T>;
          fetchSnapshot: (id: string) => Promise<Snapshot<T, K>>;
          getSnapshotData: (id: string | number | undefined) => T;
          setSnapshotCategory: (id: string, category: string) => void;
          getSnapshotCategory: (id: string) => string;
          getSnapshots: (criteria: any) => Snapshots<T>;
          getAllSnapshots: (filter?: (snapshot: Snapshot<T, K>) => boolean) => Promise<Snapshots<T>>;
          addData: (id: string, data: T) => void;
          setData: (id: string, data: T) => void;
          getData: (id: string) => T;

          dataItems: () => T[];
          getStore: (id: string) => SnapshotStore<T, K>;
          addStore: (store: SnapshotStore<T, K>) => void;
          removeStore: (id: string) => void;
          stores: () => SnapshotStore<T, K>[];
          configureSnapshotStore: (config: any) => void;

          onSnapshot: (snapshotId: number,
            snapshot: Snapshot<T, K>,
            type: string, 
            event: Event,
            callback: (snapshot: Snapshot<T, K>) => void
          ) => void;
          onSnapshots: (
            snapshotId: number,
            snapshots: Snapshots<T>, 
            type: string,
            event: Event,
            callback: (snapshots: Snapshots<T>) => void) => void;
          events: any; // Adjust type as needed
          notify: (message: string) => void;
          notifySubscribers: (
            message: string, subscribers: Subscriber<T, K>[], data: Partial<SnapshotStoreConfig<T, any>>
          ) => Subscriber<T, K>[];
          parentId: string;
          childIds: string[];
          getParentId: (id: string) => string;
          getChildIds: (id: string) => string[];
          addChild: (parentId: string, childId: string) => void;
          removeChild: (parentId: string, childId: string) => void;
          getChildren: (id: string) => string[];
          hasChildren: (id: string) => boolean;
          isDescendantOf: (childId: string, parentId: string) => boolean;

          generateId: () => string;
          compareSnapshots: (snap1: Snapshot<T, K>, snap2: Snapshot<T, K>) => number;
          compareSnapshotItems: (item1: T, item2: T) => number;
          mapSnapshot: (snap: Snapshot<T, K>, mapFn: (item: T) => T) => Snapshot<T, K>;
          compareSnapshotState: (state1: any, state2: any) => number;

          getConfigOption: (key: string) => any;
          getTimestamp: () => string;
          getInitialState: () => any;
          getStores: () => SnapshotStore<T, K>[];
          getSnapshotId: (snapshot: Snapshot<T, K>) => string;
          handleSnapshotSuccess: (message: string) => void;
        }> | undefined
      ): Promise<SnapshotContainer<T, K>> => {
        return new Promise(async (resolve, reject) => {
          const snapshotId = getSnapshotId(snapshotFetcher).toString();
          const snapshotData = await snapshotFetcher(snapshotId);
        
          if (snapshotData) {
            const snapshotContainer: SnapshotContainer<T, K> = {
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
                  }, {} as SnapshotsObject<T>)
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
              dataItems: snapshotData.dataItems,
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
              snapshot: (id, snapshotData, category, categoryProperties, dataStoreMethods) => {
                return snapshotData.snapshot;
              },
              snapshotData: (id, snapshotData, category, categoryProperties, dataStoreMethods) => {
                return Promise.resolve(snapshotData.snapshot);
              },
            };

        
            resolve(snapshotContainer);
          } else {
            reject(new Error("Snapshot container not found"));
          }
        });
      },
      

      getSnapshotVersions: (
        snapshot: Snapshot<T, K>,
        snapshotId: string,
        snapshotData: SnapshotStore<T, K>,
        versionHistory: VersionHistory,
      ): Promise<Snapshot<T, K>> => {
        return new Promise(async (resolve, reject) => {
          
          const fetchSnapshotData = async (id: string): Promise<VersionData | undefined> => {
            try {
                // Use arrow function to maintain `this` context
                const self = this;

                if(self === undefined){
                  throw new Error("Snapshot container not found");
                }
                if (self.delegate && self.delegate.length > 0) {
                    const firstDelegate = self.delegate.find(
                        (del) => typeof del.getSnapshot === "function"
                    );

                    if (firstDelegate) {
                        const snapshotResult = await firstDelegate.getSnapshot(snapshot);

                        if (!snapshotResult) {
                            return undefined;
                        }

                    // Map snapshotResult to VersionData
                    const versionData: VersionData = {
                      // Assuming you need to extract and assign the relevant fields
                      id: snapshotResult.data.id,
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
          // Call fetchSnapshotData with the required id if needed
        const result = await fetchSnapshotData(snapshotId);
        resolve(result);
        });
      },
      fetchData: async (): Promise<VersionData[]> => {
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
        snapshot: Snapshot<T, K>,
        snapshotId: string,
        snapshotData: SnapshotStore<T, K>,
        snapshotConfig: SnapshotStoreConfig<T, K>,
        callback: (snapshotStore: SnapshotStore<T, K>) => Promise<Snapshot<T, K>>,
        versionHistory: VersionHistory
      ): Promise<Snapshot<T, K> > => {
        return new Promise((resolve, reject) => {
          try {
            const API_URL = endpoints.snapshots.fetch;
            if (typeof API_URL !== "string") {
              throw new Error("Invalid API URL");
            }
            return new Promise<Snapshot<T, K>>((resolve) => {
              setTimeout(() => resolve(snapshot), 1000);
            });
          } catch (error) {
            console.error("Error getting snapshot:", error);
            reject(error);
            throw error;
          }
        });
      },
      meta: (snapshot: Snapshot<T, K>, snapshotId: string, snapshotData: SnapshotStore<T, K>, snapshotConfig: SnapshotStoreConfig<T, K>, callback: (snapshotStore: SnapshotStore<T, K>) => Promise<Snapshot<T, K>>, versionHistory: VersionHistory): Promise<Snapshot<T, K>> => {
        return new Promise((resolve, reject) => {
          try {
            const API_URL = endpoints.snapshots.fetch;
            if (typeof API_URL !== "string") {
              throw new Error("Invalid API URL");
            }
            return new Promise<Snapshot<T, K>>((resolve) => {
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
        snapshot: Snapshot<T, K>,
        snapshotId: string,
        snapshotData: SnapshotStore<T, K>, 
        snapshotConfig: SnapshotStoreConfig<T, K>,
        callback: (snapshotStore: SnapshotStore<T, K>) => Promise<Snapshot<T, K>>,
        versionHistory: VersionHistory
      ): Promise<Snapshot<T, K>> => {
        return new Promise((resolve, reject) => {
          try {
            const API_URL = endpoints.snapshots.fetch;
            if (typeof API_URL !== "string") {
              throw new Error("Invalid API URL");
            }
            return new Promise<Snapshot<T, K>>((resolve) => {
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