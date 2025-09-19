src/
└── methods/
    ├── utilMethods.ts          // Utility functions
    ├── dataMethods.ts          // Data operations
    ├── snapshotMethods.ts      // Snapshot-specific operations
    ├── versionMethods.ts       // Version management
    ├── fetchMethods.ts         // Data fetching
    ├── lifecycleMethods.ts     // Lifecycle hooks
    ├── validationMethods.ts    // Validation logic
    ├── batchMethods.ts         // Batch operations
    ├── configMethods.ts        // Configuration management
    └── subscriptionMethods.ts  // Subscription handling (new)
Categorized Props/Functions:
1. UtilMethods (utilMethods.ts)
typescript
deepCompare
shallowCompare
determineCategory
determinePrefix
compareSnapshots
compareSnapshotItems
getAllKeys
getAllValues
getAllItems
getSnapshotEntries
getAllSnapshotEntries
2. DataMethods (dataMethods.ts)
typescript
addData
removeData
updateData
updateDataTitle
updateDataDescription
addDataStatus
updateDataStatus
addDataSuccess
getDataVersions
updateDataVersions
setData
getData
addData

3. SnapshotMethods (snapshotMethods.ts)

addSnapshot
removeSnapshot
updateSnapshot
takeSnapshot
createSnapshot
createInitSnapshot
getSnapshot
getSnapshotById
findSnapshot
takeLatestSnapshot
validateSnapshot
setSnapshot
clearSnapshot
mergeSnapshots
reduceSnapshots
sortSnapshots
filterSnapshots
mapSnapshots
mapSnapshotsAO
1. VersionMethods (versionMethods.ts)
typescript
getBackendVersion
getFrontendVersion
getSnapshotVersions
1. FetchMethods (fetchMethods.ts)
typescript
fetchData
fetchStoreData
fetchSnapshot
batchFetchSnapshots
1. LifecycleMethods (lifecycleMethods.ts)
typescript
initializeWithData
initSnapshot
handleSnapshot
handleActions
mount
unmount
cleanup
startIdleTimeout
stopIdleTimeout
1. ValidationMethods (validationMethods.ts)
typescript
validateSnapshot
isCompatibleSnapshot
isSnapshotStoreConfig
isSnapshotConfig
1. BatchMethods (batchMethods.ts)
typescript
batchTakeSnapshot
batchTakeSnapshotsRequest
batchUpdateSnapshotsRequest
batchFetchSnapshotsSuccess
batchFetchSnapshotsFailure
batchUpdateSnapshotsSuccess
batchUpdateSnapshotsFailure
1. ConfigMethods (configMethods.ts)
typescript
getConfig
setConfig
getConfigs
addConfig
findConfigById
updateConfigOption
getConfigOption
handleSnapshotConfig
getSnapshotConfig
configureSnapshotStore
updateSnapshotStore
1.  SubscriptionMethods (subscriptionMethods.ts) - NEW
typescript
subscribe
unsubscribe
subscribeToSnapshots
subscribeToSnapshot
unsubscribeFromSnapshot
subscribeToSnapshotsSuccess
unsubscribeFromSnapshots
subscribeToSnapshotList
getSubscribers
notifySubscribers
addSnapshotSubscriber
removeSnapshotSubscriber
1.  StoreManagementMethods (storeManagementMethods.ts) - NEW
typescript
getStore
addStore
removeStore
getStores
addNestedStore
addSnapshotToStore
addSnapshotItem
1.  NotificationMethods (notificationMethods.ts) - NEW
typescript
notify
notifySuccess
notifyFailure
handleSnapshotSuccess
handleSnapshotFailure