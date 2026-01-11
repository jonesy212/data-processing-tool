// useMeta.tsx
import { frontendStructure } from "@/core/config/appStructure/FrontendStructure";
import { BaseConfig, BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { StructuredMetadata } from "@/core/config/StructuredMetadata";
import { Attachment } from '@/core/documents/attachment/Attachment';
import { PhaseData } from "@/core/models/phases/Phase";
import { Taggable } from '@/core/models/tracker/Tag';
import { backendStructure } from "@/core/server/database/BackendStructure";
import { SharedMetadata } from '@/core/shared/SharedMetadata';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import { EventManager } from "@/core/state/stores/DataStore";
import VersionImpl, { Version } from "@/core/versions/Version";
import { useMemo } from "react";

function useMeta<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  area: string | undefined, 
  relatedData?: K[],
  childIds?: K[],
  description?: string
): StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  const meta = useMemo<StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(() => {

    const dynamicVersion: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = VersionImpl.createVersion({
      id: 1, // Dynamically assign ID based on your logic
      major: 1,
      versionNumber: "1.0.0",
      versions: {
        backend: backendStructure,
        frontend: frontendStructure,
        history: []
        
      },
      
      buildVersions: undefined, // You can populate this based on your logic
      keywords: [], 
      mappedSnapshot: {},
      versionHistory: {
        history: [
          {
            id: "1",
            description: "Initial version",
            timestamp: new Date(),
            releaseDate: new Date(),
          },
        ],
      },
    });
    
    const generateMetadataEntry = (fileOrFolderId: string): StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>['metadataEntries'][string] => ({
      originalPath: `/path/to/${fileOrFolderId}`,
      alternatePaths: [`/alternate/${fileOrFolderId}`],
      author: "default-author",
      timestamp: new Date(),
      fileType: "text/plain",
      title: `Title for ${fileOrFolderId}`,
      description: `Description for ${fileOrFolderId}`,
      keywords: ["keyword1", "keyword2"],
      authors: ["Author 1"],
      contributors: [{}],
      publisher: "Default Publisher",
      copyright: "© 2024 Default",
      license: "MIT",
      links: ["http://example.com"],
      tags: ["tag1", "tag2"],
    });

    return {
      id: "default-id",
      apiEndpoint: "https://api.example.com",
      apiKey: "default-api-key",
      lastUpdated: new Date(),
      timeout: 5000,
      keywords: [],
      description: description || "Default Description",
      retryAttempts: 3, // Default retry attempts
      name: "Default Name", // Default name
      category: "General", // Default category
      timestamp: new Date(), // Current timestamp
      createdBy: "system", // Default creator
      tags: ["default", "tag"], // Default tags
      metadata: {}, // Empty object for metadata
      initialState: {}, // Empty object for initial state
      meta: {} as Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
      events: {} as EventManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      metadataEntries: {
        file1: generateMetadataEntry("file1"),
        file2: generateMetadataEntry("file2"),
      },
      childIds,
      relatedData,
      baseUrl: "http://example-base-url.com",
      isActive: true,
      config: {},
      permissions: [],
      customFields: {},
      versionData: {},
      latestVersion: {},
      version: dynamicVersion,
      mappedSnapshot: undefined,
      baseConfig: {} as BaseConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      sharedMetadata: {} as SharedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      sharedBaseData: {} as SharedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      taggable: {} as Taggable<T>,
     
    };
  }, [description, childIds, relatedData]);

  return meta;
}


function usePhaseMeta<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T >(
  area: string | undefined,
  relatedPhases?: PhaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
  childIds?: PhaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined,
  description?: string
): StructuredMetadata<PhaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, PhaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
  return useMeta<PhaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(area, relatedPhases, childIds, description);
}

export { useMeta, usePhaseMeta };

