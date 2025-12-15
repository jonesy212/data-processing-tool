// createMeta.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { StructuredMetadata } from "@/app/config/StructuredMetadata";
import { Attachment } from '@/app/documents/attachment/Attachment';
import { useSecurityAudit } from "@/app/hooks/useSecurityAudit";
import { BaseData } from '@/app/models/data/Data';
import { UserConfigData } from '@/app/models/data/dataStoreMethods';

const createMeta = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  data: Partial<StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
): StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {

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
