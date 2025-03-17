import SecurityAudit from "@/app/components/security/SecurityAudit"; // Assuming this is the correct path to the SecurityAudit class
import { baseConfig } from '@/app/configs/BaseConfig';
import metadata from '@/app/layout';
import { useMemo } from "react";
import { useAuth } from '../components/auth/AuthContext';
import { BaseData } from "../components/models/data/Data";
import { UserRole } from '../components/users/UserRole';
import UserRoles, { UserRoleEnum } from '../components/users/UserRoles';
import { createLastUpdatedWithVersion, createLatestVersion } from '../components/versions/createLatestVersion';
import { StructuredMetadata } from "./StructuredMetadata";
import { UnifiedMetadata } from "@/app/configs/database/MetaDataOptions";
import { Attachment } from '@/app/components/documents/Attachment/attachment'


function useMetadata<
  T extends BaseData<any>, 
  K extends T = T, 
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>, 
  ExcludedFields extends keyof T = never,
  AttachmentType extends Attachment = Attachment
>(
  area: string | undefined,
  relatedKeys: Array<keyof K> = [],
  overrides: Partial<Omit<Meta, ExcludedFields>> & {
    versionData?: Meta["versionData"];
    latestVersion?: Meta["latestVersion"];
  } = {},
  projectId?: number,
): UnifiedMetadata<T, K, Meta, ExcludedFields> & {
  options: UnifiedMetaDataOptions<T, K>;
  updateOptions: (newOptions: Partial<UnifiedMetaDataOptions<T, K>>) => void;
} {
  // Initialize options state
  const [options, setOptions] = useState<UnifiedMetaDataOptions<T, K>>({
    // Default options here
  });

  // Function to update options
  const updateOptions = (newOptions: Partial<UnifiedMetaDataOptions<T, K>>) => {
    setOptions((prevOptions) => ({ ...prevOptions, ...newOptions }));
  };

  // Retrieve the user role from authentication hook
  const { user } = useAuth();

  // Check if the user.role is a valid UserRoleEnum before using it:
  const userRole: UserRole | undefined = user?.role && (Object.values(UserRoles) as unknown as UserRoleEnum[]).includes(user.role.roleType as UserRoleEnum)
    ? {
        roleType: user.role.roleType,
        responsibilities: [],
        permissions: [],
        positions: [],
        includes: [],
      }
    : undefined;

  // Create instance of SecurityAudit
  const securityAudit = useMemo(() => new SecurityAudit(), []); 

  // Generate metadata
  const generatedMetadata = useMemo(() => {
    // Define default metadata entry
    const generateMetadataEntry = (
      fileOrFolderId: string
    ): Meta["metadataEntries"][string] => ({
      originalPath: `/path/to/${fileOrFolderId}`,
      alternatePaths: [`/alternate/${fileOrFolderId}`],
      author: "default-author",
      timestamp: new Date(),
      fileType: "text/plain",
      title: `Title for ${fileOrFolderId}`,
      description: `Description for ${fileOrFolderId}`,
      keywords: ["keyword1", "keyword2"],
      authors: ["Author 1"],
      contributors: ["Contributor 1"],
      publisher: "Default Publisher",
      copyright: "© 2024 Default",
      license: "MIT",
      links: ["http://example.com"],
      tags: ["tag1", "tag2"],
    } as Meta["metadataEntries"][string]);

    // Structured metadata object
    const structuredMetadata = {
      ...baseConfig,
      meta: metadata,
      id: "default-id",
      apiEndpoint: "https://api.example.com",
      apiKey: "default-api-key",
      timeout: 5000,
      description: "Default Description",
      metadataEntries: {
        file1: generateMetadataEntry("file1"),
        file2: generateMetadataEntry("file2"),
      },
      childIds: [],
      relatedData: [],
      version: "1.0.0",
      latestVersion: overrides.latestVersion || createLatestVersion(),
      isActive: true,
      config: {},
      permissions: [],
      customFields: {},
      lastUpdated: createLastUpdatedWithVersion(),
      baseUrl: "http://example-base-url.com",
      versionData: overrides.versionData || [],       
      timestamp: new Date("2023-01-01"),
      ...overrides,
    } as unknown as Meta;

    // Conduct audit and sanitize metadata
    let sanitizedMetadataEntries = structuredMetadata.metadataEntries;
    if (userRole) {
      const sanitizedMetadata = securityAudit.sanitizeState(structuredMetadata, userRole.roleType.toString(), userRole.roleType === UserRoles.Administrator);
      const findings = securityAudit.conductAudit(sanitizedMetadata);
      securityAudit.reviewFindings(findings);
      sanitizedMetadataEntries = sanitizedMetadata.metadataEntries;
    }

    return {
      area,
      currentMeta: structuredMetadata as Meta,
      projectId,
      overrides,
      relatedKeys,
      metadataEntries: sanitizedMetadataEntries,
      videoMetadata: undefined, // Extend as needed
      mediaMetadata: undefined, // Extend as needed
      projectMetadata: undefined, // Extend as needed
      taskMetadata: undefined, // Extend as needed
      meetingMetadata: undefined, // Extend as needed
      customMediaSession: undefined, // Extend as needed
      childIds: [],
      relatedData: [],
      latestVersion: structuredMetadata.latestVersion,
    };
  }, [area, relatedKeys, overrides, projectId, userRole, securityAudit]);

    // Return metadata along with options and updateOptions function
    return {
      ...generatedMetadata,
      options,
      updateOptions,
    };
}  

export { useMetadata };
