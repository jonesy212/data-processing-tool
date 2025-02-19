// createMeta.ts
import { BaseData } from "@/app/components/models/data/Data";
import { UserConfigData } from "@/app/components/models/data/dataStoreMethods";
import { UserData } from "@/app/components/users/User";
import { StructuredMetadata } from "../StructuredMetadata";

import { useSecurityAudit } from "@/app/components/utils/useSecurityAudit";
import { UnifiedMetaDataOptions } from "../database/MetaDataOptions";

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

export const createMetadata = <T extends BaseData<any>, K extends T = T>(
  data: Partial<UnifiedMetaDataOptions<T, K>>
): UnifiedMetaDataOptions<T, K> => {
  const { sanitizeMetadata } = useSecurityAudit();

  // Optionally sanitize incoming data
  const sanitizedData = sanitizeMetadata(data);

  return {
    area: "",
    tags: [],
    projectMetadata: undefined,
    videoMetadata: undefined,
    mediaMetadata: undefined,
    taskMetadata: undefined,
    meetingMetadata: undefined,
    structuredMetadata: undefined,
    metadataEntries: {},
    childIds: [],
    relatedData: [],
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

export { createMeta }