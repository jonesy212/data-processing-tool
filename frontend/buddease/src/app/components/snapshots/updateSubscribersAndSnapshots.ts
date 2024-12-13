// // updateSubscribersAndSnapshots.ts

// import UniqueIDGenerator from "../../../app/generators/GenerateUniqueIds";
// import { CategoryProperties } from "../../../app/pages/personas/ScenarioBuilder";
// import { Subscriber } from "../users/Subscriber";
// import { Subscription } from "../subscriptions/Subscription";
// import { useParams } from "react-router-dom";
// import { ModifiedDate } from "../documents/DocType";
// import { SnapshotManager } from "../hooks/useSnapshotManager";
// import { BaseData } from "../models/data/Data";
// import { SubscriberTypeEnum, SubscriptionTypeEnum } from "../models/data/StatusType";
// import { NotificationTypeEnum, NotificationType } from "../support/NotificationContext";
// import { getTradeExecutions, getMarketUpdates, getCommunityEngagement } from "../trading/TradingUtils";
// import { userId } from "../users/ApiUser";
// import { triggerIncentives } from "../utils/applicationUtils";
// import { Snapshot, CreateSnapshotsPayload, CustomSnapshotData, Snapshots, SnapshotsArray } from "./LocalStorageSnapshotStore";
// import { SnapshotConfig } from "./snapshot";
// import { K, T } from "./SnapshotConfig";
// import SnapshotStore from "./SnapshotStore";
// import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
// import * as snapshotApi from '../../api/SnapshotApi';
// // Example of asynchronous function using async/await
// const updateSubscribersAndSnapshots = async (
//     snapshotId: string,
//     subscribers: Subscriber<BaseData, K>[],
//     snapshots: Snapshot<BaseData, K>[]
//   ): Promise<{
//     subscribers: Subscriber<BaseData, K>[];
//     snapshots: Snapshot<BaseData, K>[];
//   }> => {
//     // Generate a subscription ID using a utility function
//     const generateSubscriptionId = UniqueIDGenerator.generateID(
//       "snap",
//       "subscription",
//       NotificationTypeEnum.Snapshot
//     );
  
//     try {
//       // Update each subscriber asynchronously
//       const updatedSubscribers = await Promise.all(
//         subscribers.map(async (subscriber: Subscriber<BaseData, K>) => {
//           // Ensure snapshots is an array and get the data from the method if necessary
//           const snapshotsArray = Array.isArray(subscriber.snapshots) ? subscriber.snapshots : await subscriber.snapshots();
  
//           // Function to get snapshots based on category and filter them
//           const filterSnapshotsByCategory = (
//             snapshots: Snapshot<BaseData, K>[],
//             targetCategory: string
//           ): Snapshot<BaseData, K>[] => {
//             const determineCategory = (snapshot: Snapshot<BaseData, K>): string => {
//               const category = snapshot.category;
//               return typeof category === 'string' ? category : 'defaultCategory';
//             };
//             return snapshots.filter(snapshot => {
//               const category = determineCategory(snapshot);
//               return category === targetCategory;
//             });
//           };
  
//           // Define the base snapshot with default or placeholder implementations
//           const createDefaultSnapshot = (snapshot: SnapshotStore<BaseData, K>): Snapshot<BaseData, K> => {
//             return {
//               ...snapshot,
//               data: snapshot.data,
//               compareSnapshotState: snapshot.compareSnapshotState,
//               eventRecords: null,
//               getParentId: (childSnapshot: Snapshot<T, K>) => snapshot.getParentId(childSnapshot),
//               getChildIds: (id: string, childSnapshot: Snapshot<T, K>) => snapshot.getChildIds(childSnapshot),
//               addChild: (snapshot: Snapshot<T, K>) => snapshot.addChild(snapshot),
//               removeChild: (snapshot: Snapshot<T, K>) => snapshot.removeChild(snapshot),
//               getChildren: () => { },
//               hasChildren: () => false,
//               isDescendantOf: (snapshot: Snapshot<T, K>, childSnapshot: Snapshot<T, K>) => snapshot.isDescendantOf(snapshot, childSnapshot),
              
//               dataItems: null,
//               newData: undefined,
//               stores: null,
//               getStore: (  storeId: number,
//                 snapshotStore: SnapshotStore<T, K>,
//                 snapshotId: string,
//                 snapshot: Snapshot<T, K>,
//                 type: string,
//                 event: Event
//               ): SnapshotStore<BaseData, any> | null => {
//                 if (snapshotStore.stores === null) {
//                   snapshotStore.stores = [];
//                 }
//                 const store = snapshotStore.stores[storeId];
//                 // if store doesn't exist
//                 if (!store) {
//                   // create store
//                   snapshotStore.stores[storeId] = {} as SnapshotStore<BaseData, any>;
//                 }
//                 return snapshotStore.stores[storeId];
//               },
//               addStore: (storeId: number, snapshotStore: SnapshotStore<BaseData, K>, snapshotId: string, snapshot: Snapshot<BaseData, K>, type: string, event: Event) => {
//                 throw new Error("Function not implemented.");
//               },
//               removeStore: (storeId: number, store: SnapshotStore<BaseData, K>, snapshotId: string, snapshot: Snapshot<BaseData, K>, type: string, event: Event) => {
//                 throw new Error("Function not implemented.");
//               },
//               createSnapshots: (id: string, snapshotId: string, snapshot: Snapshot<BaseData, K>, snapshotManager: SnapshotManager<BaseData, K>, payload: CreateSnapshotsPayload<BaseData, K>, callback: (snapshots: Snapshot<BaseData, K>[]) => void | null, snapshotDataConfig?: SnapshotConfig<BaseData, K>[], category?: string | symbol | Category) => {
//                 // Implement the function logic here
//                 return null;
//               },
//               events: {
//                   callbacks: (snapshots:SnapshotsArray<T, K>) => {
//                       return snapshots.map(snapshot => snapshot.eventRecords?.callbacks).flat();
//                 },
//                 eventRecords: undefined,
//                 subscribers: [], eventIds: []
//               },
//               meta: undefined,
//               snapshot: null
//             };
//           };
  
//           // Use reduce to construct updatedSnapshots with default snapshot objects
//           const updatedSnapshots = snapshotsArray.reduce<Record<string, Snapshot<BaseData, K>[]>>((acc, snapshot) => {
//             const category = (snapshot.category as string) ?? 'defaultCategory';
//             if (!acc[category]) {
//               acc[category] = [];
//             }
//             acc[category].push(createDefaultSnapshot(snapshot));
//             return acc;
//           }, {});
  
//           // Create a new Subscriber object with updated data
//           const id = (await snapshotApi.fetchSnapshotById(snapshotId)).toString();
//           const subscriberObj: Subscriber<BaseData, K> = {
//             ...subscriber,
//             id: undefined,
//             _id: undefined,
//             name: "",
//             subscriberId: "",
//             subscribers: [],
//             onSnapshotCallbacks: [],
//             onErrorCallbacks: [],
//             onUnsubscribeCallbacks: [],
//             notifyEventSystem: undefined,
//             updateProjectState: undefined,
//             logActivity: undefined,
//             triggerIncentives: undefined,
//             optionalData: null,
//             email: "",
//             snapshotIds: [],
//             payload: undefined,
//             data: {
//               ...subscriber.data,
//               snapshots: updatedSnapshots,
//             },
//             subscription: {
//               subscriberId: subscriber.getSubscriberId() ??
//                 SubscriberTypeEnum.PortfolioUpdates,
//               subscriberType: subscriber.getSubscriberType!(String(userId), id) ??
//                 SubscriberTypeEnum.PortfolioUpdates,
//               subscriptionId: generateSubscriptionId,
//               subscriptionType: SubscriptionTypeEnum.CommunityEngagement,
//               portfolioUpdates: () => subscriber,
//               tradeExecutions: () => getTradeExecutions(),
//               marketUpdates: () => getMarketUpdates(),
//               communityEngagement: () => getCommunityEngagement(),
//               triggerIncentives: () => triggerIncentives({
//                 userId: subscriber.getSubscriberId(),
//                 incentiveType: SubscriberTypeEnum.PortfolioUpdates,
//                 params: useParams(),
//               }),
//               determineCategory: () => subscriber.getDetermineCategory(data),
//               unsubscribe: () => {
//                 /* Unsubscribe logic */
//               },
//               portfolioUpdatesLastUpdated: {} as ModifiedDate,
//             },
//             toSnapshotStore: (
//               initialState: Snapshot<BaseData, K>,
//               snapshotConfig: SnapshotStoreConfig<BaseData, K>[]
//             ): SnapshotStore<BaseData, K>[] | undefined => {
//               // Implement logic to convert subscriber data to SnapshotStore instance
//               return undefined; // Replace with actual implementation
//             },
//             processNotification: async (
//               id: string,
//               message: string,
//               snapshotContent: Map<string, Snapshot<BaseData, any>> | null | undefined,
//               date: Date,
//               type: NotificationType
//             ): Promise<void> => {
//               // Process notification logic
//             },
//             getState: () => null,
//             onError: () => {
//               /* Error handling logic */
//             },
//             getId: function (): string | undefined {
//               return this.getId();
//             },
//             fetchSnapshotIds: function (): Promise<string[]> {
//               return new Promise<string[]>((resolve, reject) => {
//                 if (this.getSnapshotIds()) {
//                   resolve([]);
//                 } else {
//                   reject(new Error("Function not implemented."));
//                 }
//               });
//             },
//             getEmail: function (): string {
//               return this.getEmail();
//             },
//             subscribe: function (
//               callback: (data: Snapshot<BaseData, K>) => void
//             ): void {
//               this.subscribe(callback);
//               return;
//             },
//             unsubscribe: function (
//               callback: (data: Snapshot<BaseData, K>) => void
//             ): void {
//               this.unsubscribe(callback);
//               return;
//             },
//             getOptionalData: function (): CustomSnapshotData | null {
//               return this.getOptionalData();
//             },
//             getFetchSnapshotIds: function (): Promise<string[]> {
//               return new Promise((resolve, reject) => {
//                 if (this.getSnapshotIds()) {
//                   resolve([]);
//                 } else {
//                   reject(new Error("Function not implemented."));
//                 }
//               });
//             },
//             getSnapshotIds: function (): string[] {
//               return this.getSnapshotIds();
//             },
//             getData: function (): Partial<SnapshotStore<BaseData, K>> | undefined {
//               return this.getData();
//             },
//             getNotifyEventSystem: function (): Function | undefined {
//               return this.getNotifyEventSystem();
//             },
//             getUpdateProjectState: function (): Function | undefined {
//               return this.getUpdateProjectState();
//             },
//             getLogActivity: function (): Function | undefined {
//               throw new Error("Function not implemented.");
//             },
//             getTriggerIncentives: function (): Function | undefined {
//               return this.getTriggerIncentives();
//             },
//             initialData: function (data: Snapshot<BaseData, K>): void {
//               return this.initialData(data);
//             },
//             getName: function (): string {
//               throw new Error("Function not implemented.");
//             },
//             getDetermineCategory: function (
//               data: Snapshot<BaseData, K>
//             ): string {
//               throw new Error("Function not implemented.");
//             },
//             getDeterminedCategory: function (
//               data: Snapshot<BaseData, K>
//             ): Snapshot<BaseData, K> {
//               throw new Error("Function not implemented.");
//             },
//             receiveSnapshot: function (snapshot: BaseData): void {
//               throw new Error("Function not implemented.");
//             },
//             getSubscriberId: function (): string {
//               throw new Error("Function not implemented.");
//             },
//             getSubscription: function (): Subscription<T, K> {
//               throw new Error("Function not implemented.");
//             },
//             onUnsubscribe: function (
//               callback: (data: Snapshot<T, K>) => void
//             ): void {
//               throw new Error("Function not implemented.");
//             },
//             onSnapshot: function (
//               callback: (snapshot: Snapshot<T, K>) => void | Promise<void>
//             ): void {
//               throw new Error("Function not implemented.");
//             },
//             onSnapshotError: function (
//               callback: (error: Error
  
//               ) => void): void {
//               throw new Error("Function not implemented.");
//             },
//             onSnapshotUnsubscribe: function (
//               callback: (data: Snapshot<T, K>) => void
//             ): void {
//               throw new Error("Function not implemented.");
//             },
//             triggerOnSnapshot: function (
//               snapshot: Snapshot<BaseData, K>
//             ): void {
//               throw new Error("Function not implemented.");
//             },
//             handleCallback: function (data: Snapshot<BaseData, K>): void {
//               throw new Error("Function not implemented.");
//             },
//             snapshotCallback: function (data: Snapshot<BaseData, K>): void {
//               throw new Error("Function not implemented.");
//             }
//           };
  
//           return subscriberObj; // Return updated subscriber object
//         })
//       );
  
//       // Return updated subscribers and snapshots
//       return {
//         subscribers: updatedSubscribers,
//         snapshots: snapshots, // Return the original snapshots or updated snapshots if applicable
//       };
//     } catch (error) {
//       console.error("Error occurred:", error); // Handle or log errors as needed
//       throw error; // Re-throw error to propagate or handle higher up
//     }
//   }


//   export default updateSubscribersAndSnapshots;

  
  
//   // Accessing subscriberId and subscriptionId
//   console.log("Subscriber ID:", johnSubscriber.getSubscriberId());
//   console.log("Subscription ID:", johnSubscriber.getSubscriberId());
  