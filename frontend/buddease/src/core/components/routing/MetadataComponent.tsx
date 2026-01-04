MetadataComponent.tsx
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { UnifiedMetadata } from '@/core/config/MetaDataOptions';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { StatusType } from "@/core/models/data/StatusType";
import { useEffect, useState } from 'react';


Assume selectedmetadata is derived based on your logic (e.g., API call, user action, etc.)
type MetadataComponentProps<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = {
  selectedMetadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  getMetadataFromAPI: () => Promise<UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
};

function MetadataComponent<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>({
  selectedMetadata,
  getMetadataFromAPI
}: MetadataComponentProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) {
  const [currentMetadata, setCurrentMetadata] =
    useState<UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(selectedMetadata);

  const [previousMetadata, setPreviousMetadata] =
    useState<UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(selectedMetadata);

  // If you need to update the metadata, for example on a user action or API call
  const updateMetadata = (newMetadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
    // Save current metadata as previous before updating
    setPreviousMetadata(currentMetadata);
    // Update the current metadata
    setCurrentMetadata(newMetadata);
  };

  useEffect(() => {
    // Example logic if metadata changes come from external sources like API
    // Call to fetch metadata, then set the metadata state
    const fetchMetadata = async () => {
      const fetchedMetadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = await getMetadataFromAPI(); // Replace with real API call
      updateMetadata(fetchedMetadata);
    };
    fetchMetadata();
  }, []);

  return (
    <div>
      <h3>Current Metadata</h3>
      <pre>{JSON.stringify(currentMetadata, null, 2)}</pre>

      <h3>Previous Metadata</h3>
      <pre>{JSON.stringify(previousMetadata, null, 2)}</pre>
    </div>
  );
};

export default MetadataComponent;












Sample API function
const getMetadataFromAPI = async (): Promise<AppMetadataEntity> => {
  // Simulate an API call or metadata fetching
  return {
    createdBy: "UserB",
    createdAt: new Date(),
    structuredMetadata: {
      metadataEntries: {
        "456": {
          originalPath: "/updated/path",
          alternatePaths: ["/alt/updated/path"],
          author: "UserB",
          timestamp: new Date(),
          fileType: "text",
          title: "Updated Metadata",
          description: "Updated description",
          keywords: ["keyword1", "keyword2"],
          authors: ["UserB"],
          contributors: ["UserC"],
          publisher: "PublisherName",
          copyright: "2024",
          license: "MIT",
          links: ["http://link.com"],
          tags: ["tag1", "tag2"]
        }
      }
    },
    simulatedDataSource: { key: "updatedValue" },
    metadataEntries: {},
    videos: [],
    description: "",
    startDate: undefined,
    endDate: undefined,
    budget: 0,
    status: '',
    teamMembers: [],
    tasks: [],
    milestones: []
  };
};


const selectedmetadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
  videoMetadata: {
    title: "",
    url: "",
    duration: 0,
    sizeInBytes: 0,
    format: "",
    resolution: "",
    frameRate: 0,
    bitRate: 0,
    codec: "",
    aspectRatio: "",
    creationDate: new Date(),
    lastModifiedDate: new Date(),
    author: "",
    copyright: "",
    description: "",
    tags: [],
    thumbnailUrl: "",
    captions: [],
    audioTracks: [],
    chapters: [],
    metadataEntries: {},
    relatedVideos: [],
    comments: 0
  },
  mediaMetadata: {
    title: "",
    artist: "",
    album: "",
    artwork: [] // Assuming MediaImage is defined elsewhere

    // Fill in properties for MediaMetadata
  },
  projectMetadata: {
    startDate: new Date(),
    endDate: new Date(),
    budget: 0,
    status: StatusType,
   
    teamMembers: [],
    tasks: [],
    milestones: [],
    videos: [],
    projectId: "",
   
    // Fill in required properties for ProjectMetadata
  },
  taskMetadata: {
    taskId: "",
    priority: "",
    assignedTo: "",
    id: "",
    // Fill in required properties for TaskMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  },
  meetingMetadata: {
    // Fill in properties for MeetingMetadata
    createdAt: "",
    lastModifiedAt: "",
    createdBy: "",
    status: "",
    isRecurring: "",
   

  }
}
export { selectedmetadata };
