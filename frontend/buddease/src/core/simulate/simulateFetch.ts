// simulateFetch.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { StatusType } from "@/core/models/data/StatusType";
import type { FetchSnapshotPayload } from "@/core/snapshots/FetchSnapshotPayload";

async function simulateFetch<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
    snapshotId: string,
    queryParams: Record<string, any>
  ): Promise<Partial<FetchSnapshotPayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>> {
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
