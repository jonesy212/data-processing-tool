// SnapshotStoreContainer.ts

interface SnapshotStoreContainer<T extends Data, K extends Data> {
    id?: string | number | undefined;
    storeId: number;
    snapshotStore: SnapshotStore<T, K> | null;
    snapshotContainers: Map<string, SnapshotContainer<T, K>>;
    timestamp: string | number | Date | undefined;
    currentCategory: Category | undefined;
  
    setSnapshotCategory: (id: string, newCategory: string | Category) => void;
    getSnapshotCategory: (id: string) => Category | undefined;
  
    initializeSnapshotStore: (
      id: string | number | undefined,
      snapshotData: T | undefined,
      category: Category | undefined,
      categoryProperties: CategoryProperties | undefined
    ) => Promise<void>;
  
    addSnapshotContainer: (snapshotId: string, container: SnapshotContainer<T, K>) => void;
    getSnapshotContainer: (snapshotId: string) => SnapshotContainer<T, K> | undefined;
  
    // Other methods as necessary for managing snapshots and configurations
  }
  
  export const snapshotStoreContainer = <T extends BaseData, K extends BaseData>(
    storeId: number
  ): SnapshotStoreContainer<T, K> => {
    const snapshotStoreContainer: SnapshotStoreContainer<T, K> = {
      storeId,
      snapshotStore: null,
      snapshotContainers: new Map<string, SnapshotContainer<T, K>>(),
      timestamp: undefined,
      currentCategory: undefined,
  
      setSnapshotCategory: (id: string, newCategory: string | Category) => {
        const container = snapshotStoreContainer.getSnapshotContainer(id);
        if (container) {
          container.currentCategory = typeof newCategory === 'string' ? { name: newCategory } : newCategory;
        }
      },
  
      getSnapshotCategory: (id: string): Category | undefined => {
        const container = snapshotStoreContainer.getSnapshotContainer(id);
        return container?.currentCategory;
      },
  
      initializeSnapshotStore: async (
        id: string | number | undefined,
        snapshotData: T | undefined,
        category: Category | undefined,
        categoryProperties: CategoryProperties | undefined
      ): Promise<void> => {
        const options: SnapshotStoreOptions<T, K> = {
          id: id,
          data: snapshotData,
          metadata: {},
          criteria: {}
        };
        const config: SnapshotStoreConfig<T, K> = {
          snapshots: [],
        };
        snapshotStoreContainer.snapshotStore = new SnapshotStore<T, K>(
          snapshotStoreContainer.storeId,
          options,
          category,
          config,
          'create'
        );
      },
  
      addSnapshotContainer: (snapshotId: string, container: SnapshotContainer<T, K>) => {
        snapshotStoreContainer.snapshotContainers.set(snapshotId, container);
      },
  
      getSnapshotContainer: (snapshotId: string) => {
        return snapshotStoreContainer.snapshotContainers.get(snapshotId);
      },
  
      // Add other methods as necessary
    };
  
    return snapshotStoreContainer;
  };
  
  export type { SnapshotStoreContainer };