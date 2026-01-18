// useMetadata.tsx
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { UnifiedMetadata } from "@/core/config/MetaDataOptions";
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { UserRole } from "@/core/models/UserRole";
import UserRoles, { UserRoleEnum } from '@/core/models/UserRoles';
import SecurityAudit from "@/core/server/security/SecurityAudit";
import { useAuth } from '@/core/state/context/AuthContext';
import { createLastUpdatedWithVersion, createLatestVersion } from '@/core/versions/createLatestVersion';
import { useMemo, useState } from "react";

function useMetadata<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  area: string | undefined,
  relatedKeys?: Array<keyof K>,
  overrides: Partial<Omit<Meta, ExcludedFields>> & {
    versionData?: Meta["versionData"];
    latestVersion?: Meta["latestVersion"];
  } = {},
  projectId?: number,
): UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & {
  options: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  updateOptions: (newOptions: Partial<UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>) => void;
} {

  const [options, setOptions] = useState<UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>({
    area,
    metadataEntries: {} as Meta['metadataEntries'],
    latestVersion: createLatestVersion<T, K>(),
    schema: {},
  } as UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>);

  const updateOptions = (newOptions: Partial<UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>) => {
    setOptions(prev => ({ ...prev, ...newOptions }));
  };

  const { user } = useAuth();

  const userRole: UserRole | undefined = user?.role && 
    (Object.values(UserRoles) as unknown as UserRoleEnum[]).includes(user.role.roleType as UserRoleEnum)
      ? {
          roleType: user.role.roleType,
          responsibilities: [],
          permissions: [],
          positions: [],
          includes: [],
        }
      : undefined;

  const securityAudit = useMemo(() => new SecurityAudit(), []);

  // Fix 1: Use type assertion with unknown first for metadata entries
  const generateMetadataEntry = (): Meta['metadataEntries'][string] => {
    const entry = {
      originalPath: "/path/to/file",
      alternatePaths: ["/alternate/path"],
      author: "default-author",
      timestamp: new Date(),
      fileType: "text/plain",
      title: "Default Title",
      description: "Default Description",
      keywords: ["keyword1", "keyword2"],
      authors: ["Author 1"],
      contributors: ["Contributor 1"],
      publisher: "Default Publisher",
      copyright: "© 2024 Default",
      license: "MIT",
      links: ["http://example.com"],
      tags: ["tag1", "tag2"],
    };
    
    return entry as unknown as Meta['metadataEntries'][string];
  };

  // Fix 2: Properly typed helper function to construct baseConfig
  const createBaseConfig = (): Meta => {
    // Fix for metadataEntries - use unknown assertion
    const metadataEntries = {
      file1: generateMetadataEntry(),
      file2: generateMetadataEntry(),
    } as unknown as Meta['metadataEntries'];

    // Fix for the base config - use unknown assertion first, then Meta
    const baseConfig = {
      id: "default-id",
      metadataEntries,
      childIds: [],
      relatedData: [],
      version: "1.0.0",
      latestVersion: overrides.latestVersion || createLatestVersion<T,K>(),
      isActive: true,
      config: {},
      permissions: [],
      customFields: {},
      lastUpdated: createLastUpdatedWithVersion(),
      timestamp: new Date(),
      versionData: overrides.versionData || [],
      ...overrides, // safe merge
    } as unknown as Meta;

    return baseConfig;
  };

  const generatedMetadata = useMemo(() => {
    const baseConfig = createBaseConfig();

    let sanitizedMetadataEntries = baseConfig.metadataEntries;

    if (userRole) {
      // FIX: Use UserRoleEnum.Administrator instead of "admin"
      const isAdmin = userRole.roleType === UserRoleEnum.Administrator;
      
      const sanitized = securityAudit.sanitizeState(
        baseConfig,
        userRole.roleType, // This is now UserRoleEnum which works as a string
        isAdmin
      );
      const findings = securityAudit.conductAudit(sanitized);
      securityAudit.reviewFindings(findings);
      sanitizedMetadataEntries = sanitized.metadataEntries;
    }

    return {
      area,
      currentMeta: baseConfig,
      projectId,
      overrides,
      relatedKeys,
      metadataEntries: sanitizedMetadataEntries,
      videoMetadata: undefined,
      mediaMetadata: undefined,
      projectMetadata: undefined,
      taskMetadata: undefined,
      meetingMetadata: undefined,
      customMediaSession: undefined,
      childIds: [],
      relatedData: [],
      latestVersion: baseConfig.latestVersion,
      schema: baseConfig.schema,
    } as UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  }, [area, relatedKeys, overrides, projectId, userRole, securityAudit]);

  return {
    ...generatedMetadata,
    options,
    updateOptions,
  };
}

export { useMetadata };
