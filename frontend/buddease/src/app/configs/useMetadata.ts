import { Attachment } from '@/app/components/documents/Attachment/attachment';
import SecurityAudit from "@/app/components/security/SecurityAudit";
import { baseConfig, BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/configs/BaseConfig';
import { UnifiedMetadata } from "@/app/configs/database/MetaDataOptions";
import metadata from '@/app/layout';
import { useAuth } from '@/server/auth/AuthContext';
import { useMemo, useState } from "react";
import { BaseData } from "../components/models/data/Data";
import { UserRole } from '../components/users/UserRole';
import UserRoles, { UserRoleEnum } from '../components/users/UserRoles';
import { createLastUpdatedWithVersion, createLatestVersion } from '../components/versions/createLatestVersion';
import { StructuredMetadata } from "./StructuredMetadata";


function useMetadata<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  AttachmentType extends any = any
>(
  area: string | undefined,
  relatedKeys?: Array<keyof K>,
  overrides: Partial<Omit<Meta, ExcludedFields>> & {
    versionData?: Meta["versionData"];
    latestVersion?: Meta["latestVersion"];
  } = {},
  projectId?: number,
): UnifiedMetadata<T, K, Meta, ExcludedFields> & {
  options: UnifiedMetadata<T, K>;
  updateOptions: (newOptions: Partial<UnifiedMetadata<T, K>>) => void;
} {

  const [options, setOptions] = useState<UnifiedMetadata<T, K>>({
    area,
    metadataEntries: {} as Meta['metadataEntries'],
    latestVersion: createLatestVersion<T,K>(),
    schema: {},
  });

  const updateOptions = (newOptions: Partial<UnifiedMetadata<T, K>>) => {
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

  const generateMetadataEntry = (): Meta['metadataEntries'][string] => ({
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
  } as Meta['metadataEntries'][string]);

  // Typed helper function to construct baseConfig
  const createBaseConfig = (): Meta => {
    const metadataEntries: Meta['metadataEntries'] = {
      file1: generateMetadataEntry(),
      file2: generateMetadataEntry(),
    };

    return {
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
    } as Meta;
  };

  const generatedMetadata = useMemo(() => {
    const baseConfig = createBaseConfig();

    let sanitizedMetadataEntries = baseConfig.metadataEntries;

    if (userRole) {
      const sanitized = securityAudit.sanitizeState(
        baseConfig as StructuredMetadata<T, K, Meta, ExcludedFields>,
        userRole.roleType,
        userRole.roleType === "admin"
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
    };
  }, [area, relatedKeys, overrides, projectId, userRole, securityAudit]);

  return {
    ...generatedMetadata,
    options,
    updateOptions,
  };
}

export { useMetadata };
