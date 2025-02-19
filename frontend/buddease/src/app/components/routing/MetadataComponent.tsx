import { StatusType } from "@/app/components/models/data/StatusType";
import { K, T } from "@/app/components/models/data/dataStoreMethods";
import * as React from 'react';
import { useEffect, useState } from 'react';
import { UnifiedMetaDataOptions } from '../../configs/database/MetaDataOptions';
// Assume selectedmetadata is derived based on your logic (e.g., API call, user action, etc.)
// Usage Example



const selectedmetadata: UnifiedMetaDataOptions<T, K<T>> = {
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
    taskId, priority, assignedTo, id,

    // Fill in required properties for TaskMetadata<T, K>
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

  const MetadataComponent: React.FC = () => {
  // Initialize state with selectedmetadata
  const [currentMetadata, setCurrentMetadata] = useState<UnifiedMetaDataOptions<T, K<T>>(selectedmetadata);
  const [previousMetadata, setPreviousMetadata] = useState<UnifiedMetaDataOptions<T, K<T>>(selectedmetadata);

  // If you need to update the metadata, for example on a user action or API call
  const updateMetadata = (newMetadata: UnifiedMetaDataOptions<T, K<T>>) => {
    // Save current metadata as previous before updating
    setPreviousMetadata(currentMetadata);
    // Update the current metadata
    setCurrentMetadata(newMetadata);
  };

  useEffect(() => {
    // Example logic if metadata changes come from external sources like API
    // Call to fetch metadata, then set the metadata state
    const fetchMetadata = async () => {
      const fetchedMetadata: UnifiedMetaDataOptions<T, K<T>> = await getMetadataFromAPI(); // Replace with real API call
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












// Sample API function
const getMetadataFromAPI = async (): Promise<UnifiedMetaDataOptions> => {
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

export { selectedmetadata };
