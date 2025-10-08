// createMeta.ts
import { BaseData } from '@/app/models/data/Data';
import { UserConfigData } from '@/app/components/models/data/dataStoreMethods';
import { StructuredMetadata } from "@/app/StructuredMetadata";

import { useSecurityAudit } from "@/app/hooks/useSecurityAudit";

const createMeta = <T extends BaseData<any>, K extends T = T>(
  data: Partial<StructuredMetadata<T, K>>
): StructuredMetadata<T, K> => {
  const { useSecureUserId, sanitizeMetadata } = useSecurityAudit();
  const id = useSecureUserId();

  // Optionally sanitize incoming data
  const sanitizedData = sanitizeMetadata(data);

  return {
    id,
    description: "",
    metadataEntries: {},
    childIds: [],
    relatedData: [],
    version: { id: "", name: "", createdAt: new Date() }, // Adjust `Version` fields
    lastUpdated: { versionData: {} }, // Adjust `VersionHistory` fields
    isActive: false,
    config: {},
    permissions: [],
    customFields: {},
    baseUrl: "",
    apiEndpoint: sanitizedData.apiEndpoint || "default-endpoint", // Ensure apiEndpoint is a string
    ...sanitizedData,
  };
};



const meta = createMeta<
  BaseData<any, any, StructuredMetadata<any, any>>,
  UserConfigData<BaseData<any, any, StructuredMetadata<any, any>>>
>(
  "metaId",
  {},
  [], // children
  []  // related
);

export { createMeta };
