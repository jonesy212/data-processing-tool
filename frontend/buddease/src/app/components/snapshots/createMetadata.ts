import { UnifiedMetaDataOptions } from "@/app/configs/database/MetaDataOptions";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { BaseData } from "../models/data/Data";

export const createMetadata = <
    T extends BaseData<T>,
    K extends T = T,
    Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
    ExcludedFields extends keyof T = never
    >(
    options: UnifiedMetaDataOptions<T, K, Meta, ExcludedFields>
  ): Meta => {
    const defaultMeta: Meta = {
      createdBy: 'system',
      createdAt: new Date(),
      childIds: [] as unknown as K[],
      relatedData: [] as unknown as T[],
    } as Meta;
  

    const areaSpecificMeta: Partial<Meta> = {
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

  return {
    ...defaultMetaData,
    ...areaMetaData,
    ...options.overrides, // Apply overrides if provided
  };
};





