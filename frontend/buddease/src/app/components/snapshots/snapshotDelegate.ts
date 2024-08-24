import { endpoints } from "@/app/api/endpointConfigurations";
import { getSnapshotId } from "@/app/api/SnapshotApi";
import { Data } from '../model/data/Data'
import { VersionHistory, VersionData } from "../versions/VersionData";
import { Snapshot, Snapshots, SnapshotsObject, SnapshotUnion } from "./LocalStorageSnapshotStore";
import { SnapshotContainer } from "./SnapshotContainer";
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";

// snapshotDelegate.ts
const snapshotDelegate = <T extends Data, K extends Data>(
  snapshotStoreConfig: SnapshotStoreConfig<SnapshotUnion<Data>, Data>[] | undefined
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

      getSnapshotContainer:  (
        snapshotFetcher: (
          id: string | number
        ) => Promise<{
          category: string;
          timestamp: string;
          id: string;
          snapshotStore: SnapshotStore<T, K>;
          snapshot: Snapshot<T, K>;
          snapshots: Snapshots<T>;
          data: T;
        }> | undefined
      ): Promise<SnapshotContainer<T, K>> => {
        const snapshotId = getSnapshotId(snapshotFetcher).toString();
        const snapshotData = await snapshotFetcher(snapshotId);
      
        if (snapshotData) {
          const snapshotContainer: SnapshotContainer<T, K> = {
            id: snapshotData.id,
            category: snapshotData.category,
            timestamp: snapshotData.timestamp,
            snapshot: snapshotData.snapshot,
            snapshotStore: snapshotData.snapshotStore,
            snapshotData: snapshotData.snapshotStore,
            data: snapshotData.data,
            snapshotsArray: Array.isArray(snapshotData.snapshots) ? snapshotData.snapshots : [],
            snapshotsObject: Array.isArray(snapshotData.snapshots)
              ? snapshotData.snapshots.reduce((acc, snap) => {
                  if (snap.id) {
                    acc[snap.id] = snap;
                  }
                  return acc;
                }, {} as SnapshotsObject<T>)
              : {}
          };
      
          return snapshotContainer;
        }
      
        throw new Error("Snapshot container not found");
      },
      

      getSnapshotVersions: (
        snapshot: Snapshot<T, K>,
        snapshotId: string,
        snapshotData: SnapshotStore<T, K>,
        versionHistory: VersionHistory
      ): Promise<Snapshot<T, K>> => {
        return new Promise(async (resolve, reject) => {
          
          const fetchSnapshotData = async (id: string): Promise<VersionData | undefined> => {
            
            const snapshotResult = await snapshotData.getSnapshot(id);
            
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
              publishedAt:snapshotResult.data.publishedAt ?? null,
              source: snapshotResult.data.source,
              status: snapshotResult.data.status,
              version: snapshotResult.data.version,
              timestamp: snapshotResult.data.timestamp,
              user: snapshotResult.data.user,
              comments:snapshotResult.data.comments ?? [],
              workspaceId: snapshotResult.data.workspaceId,
              workspaceName: snapshotResult.data.workspaceName,
              workspaceType: snapshotResult.data.workspaceType,
              workspaceUrl: snapshotResult.data.workspaceUrl,
              workspaceViewers:snapshotResult.data.workspaceViewers ?? [],
              workspaceAdmins:snapshotResult.data.workspaceAdmins ?? [],
              workspaceMembers:snapshotResult.data.workspaceMembers ?? [],
              data:  snapshotResult.data.data,
              backend:  snapshotResult.data.backend,
              frontend:  snapshotResult.data.frontend,
              name: snapshotResult.data.name,
              url: snapshotResult.data.url,
              documentId: snapshotResult.data.documentId,
              draft: snapshotResult.data.draft,
              userId: snapshotResult.data.userId,
              content: snapshotResult.data.content,
              versionData: snapshotResult.data.versionData ?? [],
              checksum:  snapshotResult.data.checksum
              changes: snapshotResult.changes
            };
          
            return versionData;
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
            };
        
            snapshot.versionHistory = versionHistory;
        
            resolve(snapshot);
          } catch (error) {
            reject(error);
          }
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