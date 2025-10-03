// getDefaultSnapshot.ts

// Helper function to create a default Snapshot instance
function getDefaultSnapshot<T extends BaseDataEntity, K extends T = T>(): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  return {
    // Basic Snapshot properties
    id: "",
    timestamp: Date.now(),
    data: new Map(),
    metadata: {},
    // Add all required Snapshot properties and methods with default implementations
    get: (key: string) => undefined,
    set: (key: string, value: any) => {},
    // ... other required Snapshot properties
  } as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}
