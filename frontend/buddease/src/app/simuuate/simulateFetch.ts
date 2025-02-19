import { BaseData } from "../components/models/data/Data";
import { StatusType } from "../components/models/data/StatusType";
import { FetchSnapshotPayload } from "../components/snapshots/FetchSnapshotPayload";
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';

async function simulateFetch<
  T extends BaseData<any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
>(
    snapshotId: string,
    queryParams: Record<string, any>
  ): Promise<Partial<FetchSnapshotPayload<T, K>>> {
    // Simulate a delay for fetching data
    await new Promise((resolve) => setTimeout(resolve, 100));
  
    // Return mocked data (replace with actual API response)
    return {
      id: snapshotId,
      title: 'Sample Snapshot',
      description: 'This is a sample snapshot description.',
      createdAt: new Date(),
      updatedAt: new Date(),
      status: StatusType.Active,
      data: null,
      events: {},
      newData: null,
      metadata: { key: 'value' },
      category: {
        name: 'Sample Category',
        id: 'cat-001',
        type: 'default',
        description: 'Sample category description',
        icon: 'default-icon',
        color: 'blue',
        iconColor: 'default-icon-color', // Example default string
        isActive: true,                 // Example default boolean
        isPublic: false,                // Example default boolean
        isSystem: false,                // Example default boolean
        isDefault: false,               // Example default boolean
        isHidden: false,                // Example default boolean
        isHiddenInList: false,          // Example default boolean
        UserInterface: [],
        DataVisualization: [],
        Forms: [],
        Analysis: [],
        Communication: [],
        TaskManagement: [],
        Crypto: [],
        brandName: "",
        brandLogo: "",
        brandColor: "",
        brandMessage: "",
        chartType: "",
        dataProperties: [],
        formFields: [],
        // Add other required properties of CategoryProperties here
      },
      
      subscribers: [],
      snapshots: new Map(),
      eventRecords: {},
      topic: 'Sample Topic',
      message: 'Fetch successful.',
      timestamp: Date.now(),
      createdBy: 'system',
      type: 'example',
      priority: 'normal',
      customPayload: { additionalInfo: 'info' },
    };
  }  

  export { simulateFetch };
