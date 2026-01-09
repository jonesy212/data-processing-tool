batchResult.ts
// Now you can call processBatch with proper parameters
const batchResult = await this.processBatch(
  [
    {
      type: 'add',
      snapshot: mySnapshot,
      snapshotId: 'snapshot-1'
    },
    {
      type: 'update',
      snapshotId: 'snapshot-2',
      data: { name: 'updated-name' }
    }
  ],
  {
    atomic: true,
    onProgress: (completed, total) => {
      console.log(`Progress: ${completed}/${total}`);
    }
  }
);