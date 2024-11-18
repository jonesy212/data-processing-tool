
// // Sample function to convert snapshotMethods
// function convertSnapshotMethods<T, K>(
//   snapshotMethods: SnapshotStoreMethod<T, K>[] | undefined,
//   snapshot: Snapshot<T, K>,
//   snapshotId: string,
//   snapshotData: SnapshotData<T, K>,
//   snapshotConfig: SnapshotStoreConfig<T, K>,
//   callback: (snapshotStore: SnapshotStore<T, K>) => Promise<Snapshot<T, K>>,
//   versionHistory: VersionHistory
// ): Promise<Snapshot<T, K>> {
//   return new Promise(async (resolve, reject) => {
//     try {
//       if (!snapshotMethods) {
//         throw new Error("No snapshot methods provided");
//       }

//       // Iterate over each method in the array and apply it
//       for (const method of snapshotMethods) {
//         const result = await method(snapshot, snapshotId, snapshotData, snapshotConfig, callback, versionHistory);
//         // Process result if needed, here we just resolve with the last result
//         snapshot = result; // Assuming we want to chain the results
//       }

//       resolve(snapshot); // Final resolved snapshot after processing all methods
//     } catch (error) {
//       console.error("Error processing snapshot methods:", error);
//       reject(error);
//     }
//   });
// }

// export { convertSnapshotMethods }
















// // Usage Example
// // Here's how you might use this function in your application:
// const snapshotMethods: SnapshotStoreMethod<Data, string>[] | undefined = /* Your methods here */;
// const snapshot: Snapshot<Data, string> = /* Your snapshot */;
// const snapshotId = "someId";
// const snapshotData: SnapshotData<Data, string> = /* Your snapshot data */;
// const snapshotConfig: SnapshotStoreConfig<Data, string> = /* Your snapshot config */;
// const versionHistory: VersionHistory = /* Your version history */;

// convertSnapshotMethods(snapshotMethods, snapshot, snapshotId, snapshotData, snapshotConfig, async (snapshotStore) => {
//   // Perform some operations with snapshotStore
//   return snapshot; // Return the modified snapshot
// }, versionHistory)
//   .then(result => {
//     console.log("Final snapshot:", result);
//   })
//   .catch(error => {
//     console.error("Error during conversion:", error);
//   });