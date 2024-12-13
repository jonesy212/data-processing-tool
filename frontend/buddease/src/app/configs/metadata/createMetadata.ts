import { UnifiedMetaDataOptions } from "@/app/configs/database/MetaDataOptions";
import { EventManager, InitializedState } from "@/app/components/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { BaseData } from "../../components/models/data/Data";

interface DashboardMeta<T extends BaseData<any>, K extends T = T>
  extends StructuredMetadata<T, K> {
  createdBy: string;
  // Other dashboard-specific fields here
}

interface ProfileMeta<T extends BaseData<any>, K extends T = T>
  extends StructuredMetadata<T, K> {
  createdBy: string;
  updatedBy?: string;
  updatedAt?: Date;
}

export const createMetadata = <
T extends BaseData<any>,
K extends T = T,
Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
ExcludedFields extends keyof T = never
>(
options: UnifiedMetaDataOptions<T, K, Meta, ExcludedFields>
): Meta => {
  const defaultMeta: StructuredMetadata<T, K> = {
    id: "default-id",
    apiEndpoint: "https://default-api-endpoint.com",
    apiKey: undefined,
    timeout: 3000,
    retryAttempts: 3,
    name: "Default Metadata",
    description: "Default metadata description",
    category: "Default Category",
    timestamp: new Date(),
    createdBy: "system",
    tags: [],
    metadata: {},
    initialState: { state: "initialized", data: [] } as InitializedState<T, K>,
    meta: new Map(),
    events: {} as EventManager<T, K>,
    metadataEntries: {},
    childIds: [],
    relatedData: [],
  };


  const areaSpecificMetaData: Record<
    string,
    Partial<DashboardMeta<T, K> | ProfileMeta<T, K>>
  > = {
    dashboard: {
      createdBy: 'dashboard-module',
      childIds: [],
    },
    profile: {
      createdBy: 'profile-module',
      updatedBy: 'user',
      updatedAt: new Date(),
    },
    // Add more areas as needed
  };

  const areaMetaData = areaSpecificMetaData[options.area] || {};

  const mergedMeta: Meta = {
    ...defaultMeta,
    ...areaMetaData,
    ...options.overrides,
  } as Meta;

  return mergedMeta;
};



