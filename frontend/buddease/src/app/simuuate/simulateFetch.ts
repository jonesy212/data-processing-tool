import { BaseData } from "../components/models/data/Data";
import { StatusType } from "../components/models/data/StatusType";
import { FetchSnapshotPayload } from "../components/snapshots/FetchSnapshotPayload";

async function simulateFetch<
  T extends BaseData<any>,
  K extends T = T
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
      category: { name: 'Sample Category', id: 'cat-001' },
      categoryProperties: { color: 'blue', type: 'default' },
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
