import { useMemo } from "react";
import { BaseData } from "../components/models/data/Data";
import { EventManager } from "../components/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { Snapshot } from "../components/snapshots";
import { StructuredMetadata } from "./StructuredMetadata";
import Version, { VersionImpl } from "../components/versions/Version";
import { PhaseData } from "../components/phases/Phase";

function useMeta<
    T extends BaseData<any>,
    K extends T = T
>(
  area: string, 
  relatedData?: K[],
  childIds?: K[] | undefined,
  description?: string
): StructuredMetadata<T, K> {
  const meta = useMemo<StructuredMetadata<T, K>>(() => {

    const dynamicVersion: Version = VersionImpl.createVersion({
      id: 1, // Dynamically assign ID based on your logic
      major: 1,
      versionNumber: "1.0.0",
      versions: {},
      buildVersions: undefined, // You can populate this based on your logic
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
      mappedSnapshot: undefined,
    });
    
    const generateMetadataEntry = (fileOrFolderId: string): StructuredMetadata<T, K>['metadataEntries'][string] => ({
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
    });

    return {
      id: "default-id",
      apiEndpoint: "https://api.example.com",
      apiKey: "default-api-key",
      lastUpdated: new Date(),
      timeout: 5000,
      description: description || "Default Description",
      retryAttempts: 3, // Default retry attempts
      name: "Default Name", // Default name
      category: "General", // Default category
      timestamp: new Date(), // Current timestamp
      createdBy: "system", // Default creator
      tags: ["default", "tag"], // Default tags
      metadata: {}, // Empty object for metadata
      initialState: {}, // Empty object for initial state
      meta: {} as Map<string, Snapshot<T, K, StructuredMetadata<T, K>, never>>,
      events: {} as EventManager<T, K, StructuredMetadata<T, K>>,
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
    };
  }, [description, childIds, relatedData]);

  return meta;
}


function usePhaseMeta(
  area: string,
  relatedPhases?: PhaseData[],
  childIds?: PhaseData[] | undefined,
  description?: string
): StructuredMetadata<PhaseData, PhaseData> {
  return useMeta<PhaseData>(area, relatedPhases, childIds, description);
}

export { useMeta, usePhaseMeta};
